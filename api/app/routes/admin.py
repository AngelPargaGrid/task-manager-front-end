"""Admin dashboard and reports (PRD 6.4, FR-029, FR-030)."""

from datetime import datetime, timedelta
from sqlalchemy import func

from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required

from app.models.ticket import Ticket
from app.models.user import User
from app.utils.security import get_current_user
from app.exceptions import ForbiddenException

ns = Namespace("admin", description="Admin dashboard and reports")


@ns.route("/dashboard")
class Dashboard(Resource):
    """Admin dashboard metrics (FR-029)."""

    @ns.doc("get_dashboard")
    @ns.response(200, "Success")
    @jwt_required()
    def get(self):
        """Get dashboard metrics: ticket counts, avg resolution time, etc."""
        user = get_current_user()
        if user.role != "admin":
            raise ForbiddenException("Insufficient permissions")

        total = Ticket.query.count()
        by_status = (
            Ticket.query.with_entities(Ticket.status, func.count(Ticket.id))
            .group_by(Ticket.status)
            .all()
        )
        status_counts = dict(by_status)
        by_priority = (
            Ticket.query.with_entities(Ticket.priority, func.count(Ticket.id))
            .group_by(Ticket.priority)
            .all()
        )
        priority_counts = dict(by_priority)
        by_category = (
            Ticket.query.with_entities(Ticket.category, func.count(Ticket.id))
            .group_by(Ticket.category)
            .all()
        )
        category_counts = dict(by_category)

        # Average resolution time (in hours)
        resolved = Ticket.query.filter(
            Ticket.resolved_at.isnot(None),
            Ticket.created_at.isnot(None),
        ).all()
        avg_hours = None
        if resolved:
            total_seconds = sum(
                (t.resolved_at - t.created_at).total_seconds()
                for t in resolved
                if t.resolved_at and t.created_at
            )
            avg_hours = round(total_seconds / len(resolved) / 3600, 2) if resolved else None

        return {
            "status": "success",
            "dashboard": {
                "total_tickets": total,
                "by_status": status_counts,
                "by_priority": priority_counts,
                "by_category": category_counts,
                "average_resolution_hours": avg_hours,
                "agent_count": User.query.filter_by(role="agent").count(),
            },
        }, 200


@ns.route("/reports/tickets")
class TicketReports(Resource):
    """Ticket volume reports (FR-030)."""

    @ns.doc("ticket_reports")
    @ns.response(200, "Success")
    @jwt_required()
    def get(self):
        """Daily/weekly ticket volume."""
        user = get_current_user()
        if user.role != "admin":
            raise ForbiddenException("Insufficient permissions")

        # Last 7 days
        week_ago = datetime.utcnow() - timedelta(days=7)
        daily = (
            Ticket.query.with_entities(
                func.date(Ticket.created_at).label("date"),
                func.count(Ticket.id).label("count"),
            )
            .filter(Ticket.created_at >= week_ago)
            .group_by(func.date(Ticket.created_at))
            .all()
        )
        return {
            "status": "success",
            "report": {
                "type": "ticket_volume",
                "daily": [{"date": str(d[0]), "count": d[1]} for d in daily],
            },
        }, 200


@ns.route("/reports/agents")
class AgentReports(Resource):
    """Agent performance report (FR-030)."""

    @ns.doc("agent_reports")
    @ns.response(200, "Success")
    @jwt_required()
    def get(self):
        """Agent performance: tickets assigned, resolved."""
        user = get_current_user()
        if user.role != "admin":
            raise ForbiddenException("Insufficient permissions")

        agents = User.query.filter_by(role="agent").all()
        report = []
        for agent in agents:
            assigned = Ticket.query.filter_by(assigned_to_id=agent.id).count()
            resolved = Ticket.query.filter_by(
                assigned_to_id=agent.id,
                status="resolved",
            ).count()
            closed = Ticket.query.filter_by(
                assigned_to_id=agent.id,
                status="closed",
            ).count()
            report.append(
                {
                    "agent_id": agent.id,
                    "agent_name": agent.name,
                    "assigned": assigned,
                    "resolved": resolved,
                    "closed": closed,
                }
            )
        return {"status": "success", "report": report}, 200


@ns.route("/reports/sla")
class SLAReports(Resource):
    """SLA compliance report (FR-030)."""

    @ns.doc("sla_reports")
    @ns.response(200, "Success")
    @jwt_required()
    def get(self):
        """SLA compliance - simplified (FR-020 defines response/resolution hours)."""
        user = get_current_user()
        if user.role != "admin":
            raise ForbiddenException("Insufficient permissions")

        sla_hours = {"urgent": 24, "high": 48, "medium": 120, "low": 240}
        compliance = []
        for priority, limit_hours in sla_hours.items():
            resolved = Ticket.query.filter(
                Ticket.priority == priority,
                Ticket.status.in_(["resolved", "closed"]),
                Ticket.resolved_at.isnot(None),
            ).all()
            total = len(resolved)
            within_sla = sum(
                1
                for t in resolved
                if t.resolved_at
                and t.created_at
                and (t.resolved_at - t.created_at).total_seconds() / 3600 <= limit_hours
            )
            compliance.append(
                {
                    "priority": priority,
                    "resolved_count": total,
                    "within_sla": within_sla,
                    "compliance_rate": round(within_sla / total * 100, 1) if total else 100,
                }
            )
        return {"status": "success", "sla_compliance": compliance}, 200
