"""Blog comment model."""

from app import db


class BlogComment(db.Model):
    """Comment on a blog post."""

    __tablename__ = "blog_comments"
    __table_args__ = (db.Index("idx_blog_comment_post_created", "post_id", "created_at"),)

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    post_id = db.Column(
        db.Integer, db.ForeignKey("blog_posts.id"), nullable=False, index=True
    )
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    author = db.relationship("User", foreign_keys=[author_id])
