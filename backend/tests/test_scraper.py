import pytest
from app.services.scraper import extract_youtube_video_id, fetch_comments
from fastapi import HTTPException


def test_extract_youtube_video_id_standard_url():
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    assert extract_youtube_video_id(url) == "dQw4w9WgXcQ"


def test_extract_youtube_video_id_short_url():
    url = "https://youtu.be/dQw4w9WgXcQ"
    assert extract_youtube_video_id(url) == "dQw4w9WgXcQ"


def test_extract_youtube_video_id_shorts():
    url = "https://www.youtube.com/shorts/dQw4w9WgXcQ"
    assert extract_youtube_video_id(url) == "dQw4w9WgXcQ"


def test_extract_youtube_video_id_plain():
    url = "dQw4w9WgXcQ"
    assert extract_youtube_video_id(url) == "dQw4w9WgXcQ"


def test_extract_youtube_video_id_invalid():
    url = "https://google.com/search?q=test"
    assert extract_youtube_video_id(url) is None


def test_fetch_comments_raw_text():
    raw_text = "How do I setup this project?\nWhat python version is required?\nGreat video!"
    title, comments = fetch_comments(source_type="raw_text", raw_text=raw_text)

    assert title == "Raw Text Batch Input"
    assert len(comments) == 3
    assert comments[0]["text"] == "How do I setup this project?"
    assert comments[1]["text"] == "What python version is required?"


def test_fetch_comments_invalid_url():
    with pytest.raises(HTTPException) as exc_info:
        fetch_comments(source_type="youtube", url="https://invalid-url.com")
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail["error"] == "INVALID_URL"


def test_parse_like_count():
    from app.services.scraper import parse_like_count
    assert parse_like_count(None) == 0
    assert parse_like_count(0) == 0
    assert parse_like_count(42) == 42
    assert parse_like_count("350") == 350
    assert parse_like_count("1.2K") == 1200
    assert parse_like_count("15K") == 15000
    assert parse_like_count("2.5M") == 2500000
    assert parse_like_count("10,500") == 10500
    assert parse_like_count("invalid") == 0


def test_fetch_comments_raw_text_fetch_all():
    raw_text = "\n".join([f"Comment line {i}" for i in range(1, 25)])
    # With max_comments=10
    _, comments_limited = fetch_comments(source_type="raw_text", raw_text=raw_text, max_comments=10)
    assert len(comments_limited) == 10

    # With fetch_all=True
    _, comments_all = fetch_comments(source_type="raw_text", raw_text=raw_text, max_comments=10, fetch_all=True)
    assert len(comments_all) == 24
