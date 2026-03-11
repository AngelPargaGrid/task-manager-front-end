"""Blog schemas."""

from marshmallow import fields, validate
from flask_marshmallow import Schema


class BlogPostSchema(Schema):
    """Blog post response schema."""

    class Meta:
        ordered = True

    id = fields.Int(dump_only=True)
    title = fields.Str()
    slug = fields.Str()
    content = fields.Str()
    excerpt = fields.Str()
    is_published = fields.Bool()
    author_id = fields.Int()
    category_id = fields.Int()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class BlogPostCreateSchema(Schema):
    """Schema for creating a blog post."""

    title = fields.Str(required=True)
    content = fields.Str(required=True)
    excerpt = fields.Str()
    is_published = fields.Bool(load_default=True)
    category_id = fields.Int()


class BlogPostUpdateSchema(Schema):
    """Schema for updating a blog post."""

    title = fields.Str()
    content = fields.Str()
    excerpt = fields.Str()
    is_published = fields.Bool()
    category_id = fields.Int()


class BlogCommentSchema(Schema):
    """Blog comment response schema."""

    class Meta:
        ordered = True

    id = fields.Int(dump_only=True)
    content = fields.Str()
    post_id = fields.Int()
    author_id = fields.Int()
    created_at = fields.DateTime(dump_only=True)


class BlogCommentCreateSchema(Schema):
    """Schema for creating a blog comment."""

    content = fields.Str(required=True, validate=validate.Length(min=1, max=2000))


class BlogCategorySchema(Schema):
    """Blog category response schema."""

    class Meta:
        ordered = True

    id = fields.Int(dump_only=True)
    name = fields.Str()
    slug = fields.Str()
    description = fields.Str()
    created_at = fields.DateTime(dump_only=True)


class BlogCategoryCreateSchema(Schema):
    """Schema for creating a blog category."""

    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    description = fields.Str()
