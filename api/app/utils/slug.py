"""Slug generation utility."""

import re
import unicodedata


def slugify(text: str) -> str:
    """Generate URL-safe slug from text."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text.lower())
    text = re.sub(r"[-\s]+", "-", text).strip("-")
    return text or "untitled"
