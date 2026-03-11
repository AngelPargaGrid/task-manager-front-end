"""Blog endpoints: posts, comments, categories, search."""

from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from sqlalchemy import or_

from app import db, cache
from app.models.blog_post import BlogPost
from app.models.blog_comment import BlogComment
from app.models.blog_category import BlogCategory
from app.schemas.blog import (
    BlogPostSchema,
    BlogPostCreateSchema,
    BlogPostUpdateSchema,
    BlogCommentSchema,
    BlogCommentCreateSchema,
    BlogCategorySchema,
    BlogCategoryCreateSchema,
)
from app.exceptions import NotFoundException, ForbiddenException
from app.utils.slug import slugify

blog_ns = Namespace("blog", description="Blog: posts, comments, categories, search")

post_schema = BlogPostSchema()
post_create_schema = BlogPostCreateSchema()
post_update_schema = BlogPostUpdateSchema()
comment_schema = BlogCommentSchema()
comment_create_schema = BlogCommentCreateSchema()
category_schema = BlogCategorySchema(many=True)
category_create_schema = BlogCategoryCreateSchema()

POSTS_PER_PAGE = 20
CACHE_TIMEOUT = 300
CACHE_KEY_PREFIX = "blog_api"
POSTS_LIST_VERSION_KEY = f"{CACHE_KEY_PREFIX}:posts_version"


def _post_detail_cache_key(post_id):
    return f"{CACHE_KEY_PREFIX}:post:{post_id}"


def _posts_list_cache_key(page, category_id):
    v = cache.get(POSTS_LIST_VERSION_KEY) or 0
    return f"{CACHE_KEY_PREFIX}:posts:v{v}:{page}:{category_id}"


def _invalidate_post_caches(post_id=None):
    try:
        v = cache.get(POSTS_LIST_VERSION_KEY) or 0
        cache.set(POSTS_LIST_VERSION_KEY, v + 1, timeout=86400)
    except Exception:
        pass
    if post_id:
        try:
            cache.delete(_post_detail_cache_key(post_id))
        except Exception:
            pass


# --- Posts ---


@blog_ns.route("/posts")
class BlogPostList(Resource):
    """List and create blog posts."""

    @blog_ns.doc("list_posts", security=[])
    @blog_ns.param("page", "Page number", type=int)
    @blog_ns.param("category_id", "Filter by category")
    @blog_ns.response(200, "Success")
    def get(self):
        """List posts with pagination (20 per page, cached)."""
        page = request.args.get("page", 1, type=int)
        category_id = request.args.get("category_id", type=int)
        cid = category_id or ""

        cache_key = _posts_list_cache_key(page, cid)
        result = cache.get(cache_key)
        if result is None:
            query = BlogPost.query.filter_by(is_published=True).order_by(
                BlogPost.created_at.desc()
            )
            if category_id:
                query = query.filter_by(category_id=category_id)
            pagination = query.paginate(
                page=page, per_page=POSTS_PER_PAGE, error_out=False
            )
            result = {
                "posts": post_schema.dump(pagination.items, many=True),
                "total": pagination.total,
                "page": page,
                "per_page": POSTS_PER_PAGE,
                "pages": pagination.pages,
            }
            cache.set(cache_key, result, timeout=CACHE_TIMEOUT)

        return result, 200

    @blog_ns.doc("create_post")
    @blog_ns.response(201, "Post created")
    @blog_ns.response(400, "Validation error")
    @blog_ns.response(404, "Category not found")
    @blog_ns.response(401, "Unauthorized")
    @jwt_required()
    def post(self):
        """Create a new blog post."""
        try:
            data = post_create_schema.load(request.get_json())
        except ValidationError as err:
            return {"errors": err.messages}, 400

        user_id = int(get_jwt_identity())

        if data.get("category_id"):
            cat = BlogCategory.query.get(data["category_id"])
            if not cat:
                return {"message": "Category not found"}, 404

        base_slug = slugify(data["title"])
        slug = base_slug
        counter = 1
        while BlogPost.query.filter_by(slug=slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1

        post = BlogPost(
            title=data["title"],
            slug=slug,
            content=data["content"],
            excerpt=data.get("excerpt"),
            is_published=data.get("is_published", True),
            author_id=user_id,
            category_id=data.get("category_id"),
        )
        db.session.add(post)
        db.session.commit()

        _invalidate_post_caches()

        return post_schema.dump(post), 201


@blog_ns.route("/posts/<int:post_id>")
@blog_ns.param("post_id", "Post ID")
class BlogPostDetail(Resource):
    """Get, update, delete a blog post."""

    @blog_ns.doc("get_post", security=[])
    @blog_ns.response(200, "Success")
    @blog_ns.response(404, "Post not found")
    def get(self, post_id):
        """Get a single post by ID (cached)."""
        cache_key = _post_detail_cache_key(post_id)
        result = cache.get(cache_key)
        if result is None:
            post = BlogPost.query.get_or_404(post_id)
            if not post.is_published:
                raise NotFoundException("Post not found")
            result = post_schema.dump(post)
            cache.set(cache_key, result, timeout=CACHE_TIMEOUT)
        return result, 200

    @blog_ns.doc("update_post")
    @blog_ns.response(200, "Post updated")
    @blog_ns.response(400, "Validation error")
    @blog_ns.response(403, "Forbidden")
    @blog_ns.response(404, "Post not found")
    @jwt_required()
    def put(self, post_id):
        """Update a blog post."""
        user_id = int(get_jwt_identity())
        post = BlogPost.query.get_or_404(post_id)

        if post.author_id != user_id:
            raise ForbiddenException("You can only edit your own posts")

        try:
            data = post_update_schema.load(request.get_json(), partial=True)
        except ValidationError as err:
            return {"errors": err.messages}, 400

        if "title" in data:
            post.title = data["title"]
            base_slug = slugify(data["title"])
            slug = base_slug
            counter = 1
            while BlogPost.query.filter(
                BlogPost.slug == slug, BlogPost.id != post_id
            ).first():
                slug = f"{base_slug}-{counter}"
                counter += 1
            post.slug = slug

        for key in ("content", "excerpt", "is_published", "category_id"):
            if key in data:
                setattr(post, key, data[key])

        db.session.commit()
        _invalidate_post_caches(post_id)

        return post_schema.dump(post), 200

    @blog_ns.doc("delete_post")
    @blog_ns.response(204, "Post deleted")
    @blog_ns.response(403, "Forbidden")
    @blog_ns.response(404, "Post not found")
    @jwt_required()
    def delete(self, post_id):
        """Delete a blog post."""
        user_id = int(get_jwt_identity())
        post = BlogPost.query.get_or_404(post_id)

        if post.author_id != user_id:
            raise ForbiddenException("You can only delete your own posts")

        db.session.delete(post)
        db.session.commit()
        _invalidate_post_caches(post_id)

        return "", 204


# --- Comments ---


def _invalidate_post_cache(post_id):
    try:
        cache.delete(_post_detail_cache_key(post_id))
    except Exception:
        pass


@blog_ns.route("/posts/<int:post_id>/comments")
@blog_ns.param("post_id", "Post ID")
class BlogCommentList(Resource):
    """List and create blog comments."""

    @blog_ns.doc("list_comments", security=[])
    @blog_ns.response(200, "Success")
    @blog_ns.response(404, "Post not found")
    def get(self, post_id):
        """Get all comments for a post."""
        BlogPost.query.get_or_404(post_id)
        comments = BlogComment.query.filter_by(post_id=post_id).order_by(
            BlogComment.created_at
        ).all()
        return comment_schema.dump(comments, many=True), 200

    @blog_ns.doc("create_comment")
    @blog_ns.response(201, "Comment created")
    @blog_ns.response(400, "Validation error")
    @blog_ns.response(404, "Post not found")
    @jwt_required()
    def post(self, post_id):
        """Add a comment to a post."""
        BlogPost.query.get_or_404(post_id)

        try:
            data = comment_create_schema.load(request.get_json())
        except ValidationError as err:
            return {"errors": err.messages}, 400

        user_id = int(get_jwt_identity())

        comment = BlogComment(
            content=data["content"],
            post_id=post_id,
            author_id=user_id,
        )
        db.session.add(comment)
        db.session.commit()

        _invalidate_post_cache(post_id)

        return comment_schema.dump(comment), 201


@blog_ns.route("/posts/<int:post_id>/comments/<int:comment_id>")
@blog_ns.param("post_id", "Post ID")
@blog_ns.param("comment_id", "Comment ID")
class BlogCommentDetail(Resource):
    """Delete a blog comment."""

    @blog_ns.doc("delete_comment")
    @blog_ns.response(204, "Comment deleted")
    @blog_ns.response(403, "Forbidden")
    @blog_ns.response(404, "Comment not found")
    @jwt_required()
    def delete(self, post_id, comment_id):
        """Delete a comment (author only)."""
        comment = BlogComment.query.filter_by(
            id=comment_id, post_id=post_id
        ).first_or_404()

        user_id = int(get_jwt_identity())
        if comment.author_id != user_id:
            raise ForbiddenException("You can only delete your own comments")

        db.session.delete(comment)
        db.session.commit()

        _invalidate_post_cache(post_id)

        return "", 204


# --- Categories ---


@blog_ns.route("/categories")
class BlogCategoryList(Resource):
    """List and create blog categories."""

    @blog_ns.doc("list_categories", security=[])
    @blog_ns.response(200, "Success")
    def get(self):
        """Get all blog categories."""
        categories = BlogCategory.query.order_by(BlogCategory.name).all()
        return category_schema.dump(categories), 200

    @blog_ns.doc("create_category")
    @blog_ns.response(201, "Category created")
    @blog_ns.response(400, "Validation error")
    @blog_ns.response(409, "Category exists")
    @jwt_required()
    def post(self):
        """Create a blog category."""
        try:
            data = category_create_schema.load(request.get_json())
        except ValidationError as err:
            return {"errors": err.messages}, 400

        slug = slugify(data["name"])
        if BlogCategory.query.filter_by(slug=slug).first():
            return {"message": "Category already exists"}, 409

        cat = BlogCategory(
            name=data["name"],
            slug=slug,
            description=data.get("description"),
        )
        db.session.add(cat)
        db.session.commit()
        return BlogCategorySchema().dump(cat), 201


# --- Search ---


@blog_ns.route("/search")
class BlogSearch(Resource):
    """Search blog posts by keyword."""

    @blog_ns.doc("search_posts", security=[])
    @blog_ns.param("q", "Search keyword", required=True)
    @blog_ns.param("page", "Page number", type=int)
    @blog_ns.response(200, "Success")
    def get(self):
        """Search posts by keyword in title and content."""
        q = request.args.get("q", "").strip()
        page = request.args.get("page", 1, type=int)
        per_page = 20

        if not q:
            return {
                "posts": [],
                "total": 0,
                "page": page,
                "per_page": per_page,
                "pages": 0,
            }, 200

        query = BlogPost.query.filter(
            BlogPost.is_published == True,  # noqa: E712
            or_(
                BlogPost.title.ilike(f"%{q}%"),
                BlogPost.content.ilike(f"%{q}%"),
            ),
        ).order_by(BlogPost.created_at.desc())

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            "posts": post_schema.dump(pagination.items, many=True),
            "total": pagination.total,
            "page": page,
            "per_page": per_page,
            "pages": pagination.pages,
        }, 200
