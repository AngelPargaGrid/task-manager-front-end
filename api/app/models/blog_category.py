"""Blog category model."""

from app import db


class BlogCategory(db.Model):
    """Category for organizing blog posts."""

    __tablename__ = "blog_categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    slug = db.Column(db.String(100), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    posts = db.relationship(
        "BlogPost",
        backref="category",
        lazy="dynamic",
        foreign_keys="BlogPost.category_id",
    )
