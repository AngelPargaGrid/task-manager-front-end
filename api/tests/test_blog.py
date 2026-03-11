"""Blog API tests (posts, comments, categories, search, caching)."""

import pytest


# --- Posts ---


def test_blog_list_posts_empty(client):
    """List blog posts returns empty when no posts."""
    resp = client.get("/api/v1/blog/posts")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["posts"] == []
    assert data["total"] == 0
    assert data["page"] == 1
    assert data["per_page"] == 20


def test_blog_create_post(client, auth_headers):
    """Create blog post returns 201."""
    resp = client.post(
        "/api/v1/blog/posts",
        headers=auth_headers,
        json={"title": "My Post", "content": "Post content here."},
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["title"] == "My Post"
    assert data["slug"] == "my-post"
    assert "id" in data


def test_blog_create_post_requires_auth(client):
    """Create blog post without auth returns 401."""
    resp = client.post(
        "/api/v1/blog/posts",
        json={"title": "Post", "content": "Content"},
    )
    assert resp.status_code in (401, 422)


def test_blog_get_post(client, auth_headers):
    """Get single blog post by ID."""
    create = client.post(
        "/api/v1/blog/posts",
        headers=auth_headers,
        json={"title": "Get Me", "content": "Content"},
    )
    post_id = create.get_json()["id"]
    resp = client.get(f"/api/v1/blog/posts/{post_id}")
    assert resp.status_code == 200
    assert resp.get_json()["title"] == "Get Me"


def test_blog_list_posts_paginated(client, auth_headers):
    """List blog posts with pagination."""
    for i in range(25):
        client.post(
            "/api/v1/blog/posts",
            headers=auth_headers,
            json={"title": f"Post {i}", "content": f"Content {i}"},
        )
    resp = client.get("/api/v1/blog/posts?page=1")
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data["posts"]) == 20
    assert data["total"] == 25
    assert data["pages"] == 2


def test_blog_update_post(client, auth_headers):
    """Update own blog post returns 200."""
    create = client.post(
        "/api/v1/blog/posts",
        headers=auth_headers,
        json={"title": "Original", "content": "Content"},
    )
    post_id = create.get_json()["id"]
    resp = client.put(
        f"/api/v1/blog/posts/{post_id}",
        headers=auth_headers,
        json={"title": "Updated", "content": "New content"},
    )
    assert resp.status_code == 200
    assert resp.get_json()["title"] == "Updated"


def test_blog_delete_post(client, auth_headers):
    """Delete own blog post returns 204."""
    create = client.post(
        "/api/v1/blog/posts",
        headers=auth_headers,
        json={"title": "To Delete", "content": "Content"},
    )
    post_id = create.get_json()["id"]
    resp = client.delete(f"/api/v1/blog/posts/{post_id}", headers=auth_headers)
    assert resp.status_code == 204
    assert client.get(f"/api/v1/blog/posts/{post_id}").status_code == 404


def test_blog_list_posts_filter_by_category(client, auth_headers, blog_category):
    """List blog posts filtered by category_id."""
    cat_id = blog_category["id"]
    client.post(
        "/api/v1/blog/posts",
        headers=auth_headers,
        json={"title": "Tech Post", "content": "Content", "category_id": cat_id},
    )
    client.post(
        "/api/v1/blog/posts",
        headers=auth_headers,
        json={"title": "Other Post", "content": "Content"},
    )
    resp = client.get(f"/api/v1/blog/posts?category_id={cat_id}")
    assert resp.status_code == 200
    posts = resp.get_json()["posts"]
    assert len(posts) == 1
    assert posts[0]["category_id"] == cat_id


# --- Comments ---


def test_blog_list_comments_empty(client, auth_headers):
    """List comments on new post returns empty."""
    create = client.post(
        "/api/v1/blog/posts",
        headers=auth_headers,
        json={"title": "Post", "content": "Content"},
    )
    post_id = create.get_json()["id"]
    resp = client.get(f"/api/v1/blog/posts/{post_id}/comments")
    assert resp.status_code == 200
    assert resp.get_json() == []


def test_blog_create_comment(client, auth_headers):
    """Create blog comment returns 201."""
    create = client.post(
        "/api/v1/blog/posts",
        headers=auth_headers,
        json={"title": "Post", "content": "Content"},
    )
    post_id = create.get_json()["id"]
    resp = client.post(
        f"/api/v1/blog/posts/{post_id}/comments",
        headers=auth_headers,
        json={"content": "Great post!"},
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["content"] == "Great post!"
    assert data["post_id"] == post_id


def test_blog_delete_comment(client, auth_headers):
    """Delete own comment returns 204."""
    create = client.post(
        "/api/v1/blog/posts",
        headers=auth_headers,
        json={"title": "Post", "content": "Content"},
    )
    post_id = create.get_json()["id"]
    com = client.post(
        f"/api/v1/blog/posts/{post_id}/comments",
        headers=auth_headers,
        json={"content": "To delete"},
    )
    comment_id = com.get_json()["id"]
    resp = client.delete(
        f"/api/v1/blog/posts/{post_id}/comments/{comment_id}",
        headers=auth_headers,
    )
    assert resp.status_code == 204


# --- Categories ---


def test_blog_list_categories_empty(client):
    """List blog categories returns empty when none exist."""
    resp = client.get("/api/v1/blog/categories")
    assert resp.status_code == 200
    assert resp.get_json() == []


def test_blog_list_categories(client, blog_category):
    """List blog categories returns all categories."""
    resp = client.get("/api/v1/blog/categories")
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data) == 1
    assert data[0]["name"] == blog_category["name"]


def test_blog_create_category(client, auth_headers):
    """Create blog category returns 201 (authenticated)."""
    resp = client.post(
        "/api/v1/blog/categories",
        headers=auth_headers,
        json={"name": "Sports", "description": "Sports posts"},
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["name"] == "Sports"
    assert data["slug"] == "sports"


# --- Search ---


def test_blog_search_empty(client):
    """Search with no query returns empty."""
    resp = client.get("/api/v1/blog/search?q=")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["posts"] == []
    assert data["total"] == 0


def test_blog_search_by_keyword(client, auth_headers):
    """Search finds posts by keyword in title."""
    client.post(
        "/api/v1/blog/posts",
        headers=auth_headers,
        json={"title": "Python Tutorial", "content": "Learn Python basics."},
    )
    client.post(
        "/api/v1/blog/posts",
        headers=auth_headers,
        json={"title": "JavaScript Guide", "content": "JS fundamentals."},
    )
    resp = client.get("/api/v1/blog/search?q=Python")
    assert resp.status_code == 200
    posts = resp.get_json()["posts"]
    assert len(posts) == 1
    assert "Python" in posts[0]["title"]


# --- Caching ---


def test_blog_post_list_cached(client, auth_headers):
    """Blog post list is cached."""
    client.post(
        "/api/v1/blog/posts",
        headers=auth_headers,
        json={"title": "Cached Post", "content": "Content"},
    )
    resp1 = client.get("/api/v1/blog/posts")
    resp2 = client.get("/api/v1/blog/posts")
    assert resp1.get_json() == resp2.get_json()


def test_blog_cache_invalidated_on_update(client, auth_headers):
    """Blog cache invalidated when post is updated."""
    create = client.post(
        "/api/v1/blog/posts",
        headers=auth_headers,
        json={"title": "Original", "content": "Content"},
    )
    post_id = create.get_json()["id"]
    client.get(f"/api/v1/blog/posts/{post_id}")

    client.put(
        f"/api/v1/blog/posts/{post_id}",
        headers=auth_headers,
        json={"title": "Updated Title", "content": "New"},
    )

    resp = client.get(f"/api/v1/blog/posts/{post_id}")
    assert resp.get_json()["title"] == "Updated Title"
