"""Ticket endpoints (PRD 6.2)."""

from datetime import datetime

from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError as MarshmallowValidationError
from sqlalchemy import or_

from app import db
from app.models.ticket import Ticket
from app.models.user import User
from app.models.assignment import Assignment
from app.schemas.ticket import (
    TicketSchema,
    TicketCreateSchema,
    TicketUpdateSchema,
    StatusUpdateSchema,
    PriorityUpdateSchema,
    AssignSchema,
    VALID_STATUS_TRANSITIONS,
)
from app.utils.ticket_utils import generate_ticket_number
from app.utils.security import get_current_user, role_required, sanitize_input
from app.exceptions import ForbiddenException, NotFoundException, ValidationException
from app import limiter

ns = Namespace("tickets", description="Ticket CRUD and management")

ticket_schema = TicketSchema()
ticket_create_schema = TicketCreateSchema()
ticket_update_schema = TicketUpdateSchema()
status_schema = StatusUpdateSchema()
priority_schema = PriorityUpdateSchema()
assign_schema = AssignSchema()


def _get_ticket_query_for_user(user):
    """Build ticket query based on user role (PRD FR-033)."""
    if user.role == "admin":
        return Ticket.query
    if user.role == "agent":
        return Ticket.query.filter(
            or_(
                Ticket.assigned_to_id == user.id,
                Ticket.assigned_to_id.is_(None),  # unassigned queue
            )
        )
    # customer: own tickets only
    return Ticket.query.filter(
        or_(
            Ticket.customer_email == user.email,
            Ticket.created_by_id == user.id,
        )
    )


def _can_access_ticket(user, ticket):
    """Check if user can access ticket."""
    if user.role == "admin":
        return True
    if ticket.assigned_to_id == user.id:
        return True
    if ticket.customer_email == user.email or ticket.created_by_id == user.id:
        return True
    if user.role == "agent" and ticket.assigned_to_id.is_(None):
        return True  # unassigned queue
    return False


def _can_update_ticket(user, ticket):
    """Check if user can update ticket (status, etc)."""
    if user.role == "admin":
        return True
    if user.role == "agent" and ticket.assigned_to_id == user.id:
        return True
    return False


def _can_assign_ticket(user):
    """Only admins can assign (PRD C)."""
    return user.role == "admin"


def _can_change_priority(user):
    """Agents and admins can change priority (PRD C)."""
    return user.role in ("agent", "admin")


def _can_delete_ticket(user):
    """Only admins can delete (PRD C)."""
    return user.role == "admin"


@ns.route("/")
class TicketList(Resource):
    """List and create tickets."""

    @ns.doc("list_tickets")
    @ns.response(200, "Success")
    @ns.response(401, "Unauthorized")
    @jwt_required()
    def get(self):
        """List tickets with filters (FR-025, FR-026, FR-027)."""
        user = get_current_user()
        query = _get_ticket_query_for_user(user)

        # Filters
        status = request.args.get("status")
        if status:
            query = query.filter(Ticket.status == status)
        priority = request.args.get("priority")
        if priority:
            query = query.filter(Ticket.priority == priority)
        category = request.args.get("category")
        if category:
            query = query.filter(Ticket.category == category)
        search = request.args.get("search")
        if search:
            q = f"%{search}%"
            query = query.filter(
                or_(
                    Ticket.ticket_number.ilike(q),
                    Ticket.subject.ilike(q),
                    Ticket.description.ilike(q),
                    Ticket.customer_email.ilike(q),
                )
            )
        assigned = request.args.get("assigned")
        if assigned == "true":
            query = query.filter(Ticket.assigned_to_id.isnot(None))
        elif assigned == "false":
            query = query.filter(Ticket.assigned_to_id.is_(None))

        page = request.args.get("page", 1, type=int)
        per_page = min(request.args.get("per_page", 20, type=int), 100)
        pagination = query.order_by(Ticket.created_at.desc()).paginate(
            page=page, per_page=per_page
        )
        return {
            "tickets": ticket_schema.dump(pagination.items, many=True),
            "total": pagination.total,
            "page": page,
            "per_page": per_page,
        }, 200

    @ns.doc("create_ticket")
    @ns.response(201, "Ticket created")
    @ns.response(400, "Validation error")
    @ns.response(429, "Rate limit exceeded")
    @limiter.limit("10 per minute")
    @jwt_required()
    def post(self):
        """Create a new ticket (FR-001, FR-002, FR-004). Rate limited 10/min."""
        try:
            data = ticket_create_schema.load(request.get_json())
        except MarshmallowValidationError as err:
            raise ValidationException(errors=err.messages)

        user = get_current_user()
        data = sanitize_input(data)

        ticket = Ticket(
            ticket_number=generate_ticket_number(),
            subject=data["subject"],
            description=data["description"],
            priority=data["priority"],
            category=data["category"],
            customer_email=data["customer_email"],
            status="open",
            created_by_id=user.id,
        )
        db.session.add(ticket)
        db.session.commit()

        return {"status": "success", "ticket": ticket_schema.dump(ticket)}, 201


@ns.route("/<int:ticket_id>")
@ns.param("ticket_id", "Ticket ID")
class TicketDetail(Resource):
    """Get, update, delete a ticket."""

    @ns.doc("get_ticket")
    @ns.response(200, "Success")
    @ns.response(403, "Forbidden")
    @ns.response(404, "Not found")
    @jwt_required()
    def get(self, ticket_id):
        """Get ticket by ID."""
        user = get_current_user()
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            raise NotFoundException("Ticket not found")
        if not _can_access_ticket(user, ticket):
            raise ForbiddenException("Insufficient permissions")
        return {"status": "success", "ticket": ticket_schema.dump(ticket)}, 200

    @ns.doc("update_ticket")
    @ns.response(200, "Ticket updated")
    @ns.response(400, "Validation error")
    @jwt_required()
    def put(self, ticket_id):
        """Update ticket (admin/agent only, partial)."""
        user = get_current_user()
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            raise NotFoundException("Ticket not found")
        if not _can_update_ticket(user, ticket):
            raise ForbiddenException("Insufficient permissions")

        try:
            data = ticket_update_schema.load(request.get_json(), partial=True)
        except MarshmallowValidationError as err:
            raise ValidationException(errors=err.messages)

        data = sanitize_input(data)
        for key, value in data.items():
            setattr(ticket, key, value)
        db.session.commit()
        return {"status": "success", "ticket": ticket_schema.dump(ticket)}, 200

    @ns.doc("delete_ticket")
    @ns.response(204, "Ticket deleted")
    @jwt_required()
    def delete(self, ticket_id):
        """Delete ticket (admin only)."""
        user = get_current_user()
        if not _can_delete_ticket(user):
            raise ForbiddenException("Insufficient permissions")
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            raise NotFoundException("Ticket not found")
        db.session.delete(ticket)
        db.session.commit()
        return "", 204


@ns.route("/<int:ticket_id>/status")
@ns.param("ticket_id", "Ticket ID")
class TicketStatus(Resource):
    """Update ticket status."""

    @ns.doc("update_status")
    @ns.response(200, "Status updated")
    @jwt_required()
    def put(self, ticket_id):
        """Update ticket status with transition validation (FR-012)."""
        user = get_current_user()
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            raise NotFoundException("Ticket not found")
        if not _can_update_ticket(user, ticket):
            raise ForbiddenException("Insufficient permissions")

        try:
            data = status_schema.load(request.get_json())
        except MarshmallowValidationError as err:
            raise ValidationException(errors=err.messages)

        new_status = data["status"]
        allowed = VALID_STATUS_TRANSITIONS.get(ticket.status, [])
        if new_status not in allowed:
            raise ValidationException(
                message=f"Invalid status transition: {ticket.status} → {new_status}. Allowed: {', '.join(allowed)}"
            )

        ticket.status = new_status
        if new_status == "resolved":
            ticket.resolved_at = datetime.utcnow()
        elif new_status == "closed":
            ticket.closed_at = datetime.utcnow()
        db.session.commit()
        return {"status": "success", "ticket": ticket_schema.dump(ticket)}, 200


@ns.route("/<int:ticket_id>/priority")
@ns.param("ticket_id", "Ticket ID")
class TicketPriority(Resource):
    """Update ticket priority."""

    @ns.doc("update_priority")
    @ns.response(200, "Priority updated")
    @jwt_required()
    def put(self, ticket_id):
        """Update priority (agents/admins, FR-024 requires reason)."""
        user = get_current_user()
        if not _can_change_priority(user):
            raise ForbiddenException("Insufficient permissions")
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            raise NotFoundException("Ticket not found")
        if not _can_access_ticket(user, ticket):
            raise ForbiddenException("Insufficient permissions")

        try:
            data = priority_schema.load(request.get_json())
        except MarshmallowValidationError as err:
            raise ValidationException(errors=err.messages)

        ticket.priority = data["priority"]
        db.session.commit()
        return {"status": "success", "ticket": ticket_schema.dump(ticket)}, 200


@ns.route("/<int:ticket_id>/assign")
@ns.param("ticket_id", "Ticket ID")
class TicketAssign(Resource):
    """Assign ticket to agent."""

    @ns.doc("assign_ticket")
    @ns.response(200, "Ticket assigned")
    @jwt_required()
    def post(self, ticket_id):
        """Assign ticket to agent (admin only, FR-005, FR-008)."""
        user = get_current_user()
        if not _can_assign_ticket(user):
            raise ForbiddenException("Insufficient permissions")
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            raise NotFoundException("Ticket not found")

        try:
            data = assign_schema.load(request.get_json())
        except MarshmallowValidationError as err:
            raise ValidationException(errors=err.messages)

        agent = User.query.get(data["agent_id"])
        if not agent or agent.role != "agent":
            raise ValidationException(message="Invalid agent ID")

        ticket.assigned_to_id = agent.id
        ticket.status = "assigned"

        assignment = Assignment(
            ticket_id=ticket.id,
            assigned_to_id=agent.id,
            assigned_by_id=user.id,
        )
        db.session.add(assignment)
        db.session.commit()
        return {"status": "success", "ticket": ticket_schema.dump(ticket)}, 200


@ns.route("/<int:ticket_id>/history")
@ns.param("ticket_id", "Ticket ID")
class TicketHistory(Resource):
    """Get ticket history (assignments, status changes)."""

    @ns.doc("get_ticket_history")
    @ns.response(200, "Success")
    @jwt_required()
    def get(self, ticket_id):
        """Get assignment and status history (FR-010, FR-013)."""
        user = get_current_user()
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            raise NotFoundException("Ticket not found")
        if not _can_access_ticket(user, ticket):
            raise ForbiddenException("Insufficient permissions")

        assignments = (
            Assignment.query.filter_by(ticket_id=ticket_id)
            .order_by(Assignment.assigned_at.desc())
            .all()
        )
        history = []
        for a in assignments:
            history.append(
                {
                    "type": "assignment",
                    "assigned_to_id": a.assigned_to_id,
                    "assigned_by_id": a.assigned_by_id,
                    "assigned_at": a.assigned_at.isoformat() if a.assigned_at else None,
                }
            )
        return {"status": "success", "history": history}, 200


# --- Comments (nested under tickets) ---
from app.models.comment import Comment
from app.schemas.comment import CommentSchema, CommentCreateSchema

comment_schema = CommentSchema()
comment_create_schema = CommentCreateSchema()


def _get_ticket_and_check_access(ticket_id, user):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        raise NotFoundException("Ticket not found")
    if not _can_access_ticket(user, ticket):
        raise ForbiddenException("Insufficient permissions")
    return ticket


def _can_add_internal_comment(user):
    return user.role in ("agent", "admin")


@ns.route("/<int:ticket_id>/comments")
@ns.param("ticket_id", "Ticket ID")
class TicketComments(Resource):
    """List and add comments on a ticket (FR-015, FR-016)."""

    @ns.doc("list_comments")
    @ns.response(200, "Success")
    @jwt_required()
    def get(self, ticket_id):
        """Get comments. Internal comments hidden from customers."""
        user = get_current_user()
        ticket = _get_ticket_and_check_access(ticket_id, user)
        comments = Comment.query.filter_by(ticket_id=ticket_id).order_by(Comment.created_at)
        if user.role == "customer":
            comments = comments.filter_by(is_internal=False)
        items = comments.all()
        return {"status": "success", "comments": comment_schema.dump(items, many=True)}, 200

    @ns.doc("add_comment")
    @ns.response(201, "Comment added")
    @jwt_required()
    def post(self, ticket_id):
        """Add a comment."""
        user = get_current_user()
        ticket = _get_ticket_and_check_access(ticket_id, user)
        try:
            data = comment_create_schema.load(request.get_json())
        except MarshmallowValidationError as err:
            raise ValidationException(errors=err.messages)
        if data.get("is_internal") and not _can_add_internal_comment(user):
            raise ForbiddenException("Only agents and admins can add internal comments")
        data = sanitize_input(data)
        comment = Comment(
            ticket_id=ticket_id,
            user_id=user.id,
            content=data["content"],
            is_internal=data.get("is_internal", False),
        )
        db.session.add(comment)
        db.session.commit()
        return {"status": "success", "comment": comment_schema.dump(comment)}, 201
