"""Blog post model."""

from app import db


class BlogPost(db.Model):
    """Blog post model."""

    __tablename__ = "blog_posts"
    __table_args__ = (
        db.Index("idx_blog_post_author_created", "author_id", "created_at"),
        db.Index("idx_blog_post_category_created", "category_id", "created_at"),
    )

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    slug = db.Column(db.String(220), unique=True, nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.String(500))
    is_published = db.Column(db.Boolean, default=True, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey("blog_categories.id"), index=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    author = db.relationship("User", foreign_keys=[author_id])
    comments = db.relationship(
        "BlogComment",
        backref="post",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )
