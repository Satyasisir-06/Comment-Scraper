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
