"""Agent endpoints (PRD 6.3)."""

from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError as MarshmallowValidationError

from app.models.user import User
from app.models.ticket import Ticket
from app.schemas.user import UserSchema
from app.schemas.ticket import TicketSchema
from app.schemas.user import UserUpdateSchema
from app.utils.security import get_current_user
from app.exceptions import ForbiddenException, NotFoundException, ValidationException

ns = Namespace("agents", description="Agent operations")

user_schema = UserSchema()
ticket_schema = TicketSchema()
user_update_schema = UserUpdateSchema()


@ns.route("/")
class AgentList(Resource):
    """List agents."""

    @ns.doc("list_agents")
    @ns.response(200, "Success")
    @jwt_required()
    def get(self):
        """List all agents."""
        user = get_current_user()
        if user.role not in ("admin", "agent"):
            raise ForbiddenException("Insufficient permissions")
        agents = User.query.filter_by(role="agent").all()
        return {"status": "success", "agents": user_schema.dump(agents, many=True)}, 200


@ns.route("/<int:agent_id>/tickets")
@ns.param("agent_id", "Agent ID")
class AgentTickets(Resource):
    """Get agent's assigned tickets."""

    @ns.doc("get_agent_tickets")
    @ns.response(200, "Success")
    @jwt_required()
    def get(self, agent_id):
        """Get tickets assigned to an agent (FR-006)."""
        user = get_current_user()
        if user.role != "admin" and user.id != agent_id:
            raise ForbiddenException("Insufficient permissions")
        agent = User.query.get(agent_id)
        if not agent or agent.role != "agent":
            raise NotFoundException("Agent not found")
        tickets = Ticket.query.filter_by(assigned_to_id=agent_id).order_by(
            Ticket.created_at.desc()
        ).all()
        return {"status": "success", "tickets": ticket_schema.dump(tickets, many=True)}, 200


@ns.route("/<int:agent_id>/availability")
@ns.param("agent_id", "Agent ID")
class AgentAvailability(Resource):
    """Update agent availability (FR-034)."""

    @ns.doc("update_availability")
    @ns.response(200, "Availability updated")
    @jwt_required()
    def put(self, agent_id):
        """Update agent availability status."""
        user = get_current_user()
        if user.role != "admin" and user.id != agent_id:
            raise ForbiddenException("Insufficient permissions")
        agent = User.query.get(agent_id)
        if not agent or agent.role != "agent":
            raise NotFoundException("Agent not found")
        data = request.get_json() or {}
        status = data.get("availability_status")
        if status not in ("available", "busy", "offline"):
            raise ValidationException(message="Invalid availability status")
        agent.availability_status = status
        from app import db
        db.session.commit()
        return {"status": "success", "agent": user_schema.dump(agent)}, 200
