import re
import urllib.parse
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timezone
import requests
from fastapi import HTTPException

from app.config import settings

try:
    from youtube_comment_downloader import YoutubeCommentDownloader, SORT_BY_POPULAR
    HAS_YOUTUBE_DOWNLOADER = True
except ImportError:
    HAS_YOUTUBE_DOWNLOADER = False


class ScrapedResult:
    """Encapsulates scraped comments and video metadata while supporting tuple unpacking."""
    def __init__(
        self,
        title: str,
        comments: List[Dict[str, Any]],
        author: Optional[str] = None,
        thumbnail_url: Optional[str] = None,
    ):
        self.title = title
        self.comments = comments
        self.author = author
        self.thumbnail_url = thumbnail_url

    def __iter__(self):
        return iter([self.title, self.comments])

    def __getitem__(self, index):
        return [self.title, self.comments][index]


def fetch_youtube_oembed(video_id: str) -> Tuple[str, Optional[str], Optional[str]]:
    """
    Fetches authentic video title, channel/author name, and thumbnail via YouTube's public oEmbed API.
    Does not require an API key.
    """
    default_thumb = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
    try:
        resp = requests.get(
            f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json",
            timeout=5,
        )
        if resp.status_code == 200:
            data = resp.json()
            title = data.get("title") or f"YouTube Video ({video_id})"
            author = data.get("author_name")
            thumb = data.get("thumbnail_url") or default_thumb
            return title, author, thumb
    except Exception:
        pass
    return f"YouTube Video ({video_id})", None, default_thumb


def extract_youtube_video_id(url: str) -> Optional[str]:
    """
    Extracts the 11-character YouTube video ID from various YouTube URL formats or plain ID.
    Examples:
    - https://www.youtube.com/watch?v=dQw4w9WgXcQ
    - https://youtu.be/dQw4w9WgXcQ
    - https://www.youtube.com/embed/dQw4w9WgXcQ
    - https://www.youtube.com/shorts/dQw4w9WgXcQ
    - dQw4w9WgXcQ
    """
    if not url:
        return None

    url = url.strip()

    # Plain 11-character ID check
    if re.match(r"^[a-zA-Z0-9_-]{11}$", url):
        return url

    # URL patterns
    patterns = [
        r"(?:v=|\/v\/|embed\/|shorts\/|youtu\.be\/|\/v=)([^#\&\?]{11})",
        r"(?:youtube\.com\/watch\?.*v=)([^#\&\?]{11})",
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)

    parsed = urllib.parse.urlparse(url)
    if "youtube.com" in parsed.netloc or "youtu.be" in parsed.netloc:
        query_params = urllib.parse.parse_qs(parsed.query)
        if "v" in query_params and query_params["v"]:
            v_id = query_params["v"][0]
            if len(v_id) == 11:
                return v_id

    return None


def fetch_youtube_comments_via_api(
    video_id: str,
    api_key: str,
    max_comments: int = 100,
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Fetch comments using official YouTube Data API v3.
    """
    try:
        # Get video details for title
        video_url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet&id={video_id}&key={api_key}"
        res = requests.get(video_url, timeout=10)
        video_title = f"YouTube Video ({video_id})"
        if res.status_code == 200:
            data = res.json()
            items = data.get("items", [])
            if items:
                video_title = items[0]["snippet"].get("title", video_title)

        # Get comments
        comments_url = f"https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId={video_id}&maxResults={min(max_comments, 100)}&order=relevance&key={api_key}"
        comments_res = requests.get(comments_url, timeout=10)

        if comments_res.status_code == 403:
            err_data = comments_res.json()
            error_reason = (
                err_data.get("error", {}).get("errors", [{}])[0].get("reason", "")
            )
            if error_reason == "commentsDisabled":
                raise HTTPException(
                    status_code=422,
                    detail={
                        "error": "COMMENTS_DISABLED",
                        "message": "This video has comments disabled or requires authentication.",
                        "details": None,
                    },
                )

        if comments_res.status_code != 200:
            raise Exception(f"YouTube API returned status {comments_res.status_code}")

        items = comments_res.json().get("items", [])
        raw_comments = []
        for index, item in enumerate(items):
            snippet = item["snippet"]["topLevelComment"]["snippet"]
            raw_comments.append(
                {
                    "id": f"yt_{video_id}_{index+1}",
                    "author": snippet.get("authorDisplayName", "@anonymous"),
                    "text": snippet.get("textDisplay", snippet.get("textOriginal", "")),
                    "likes": snippet.get("likeCount", 0),
                    "published_at": snippet.get(
                        "publishedAt", datetime.now(timezone.utc).isoformat()
                    ),
                }
            )

        return video_title, raw_comments
    except HTTPException:
        raise
    except Exception as e:
        raise e


def fetch_youtube_video_title(video_id: str) -> str:
    """
    Fetches the actual video title using YouTube's public oEmbed endpoint.
    Does not require a YouTube API key.
    """
    try:
        oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        res = requests.get(oembed_url, timeout=5)
        if res.status_code == 200:
            data = res.json()
            if "title" in data and data["title"]:
                return data["title"]
    except Exception:
        pass
    return f"YouTube Video ({video_id})"


def fetch_youtube_comments_via_downloader(
    video_id: str,
    max_comments: int = 100,
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Fetch comments using youtube-comment-downloader without requiring API keys.
    """
    if not HAS_YOUTUBE_DOWNLOADER:
        raise RuntimeError("youtube-comment-downloader is not installed.")

    downloader = YoutubeCommentDownloader()
    generator = downloader.get_comments_from_url(
        f"https://www.youtube.com/watch?v={video_id}", sort_by=SORT_BY_POPULAR
    )

    comments = []
    count = 0
    try:
        for comment in generator:
            count += 1
            pub_at = comment.get("time") or datetime.now(timezone.utc).isoformat()
            comments.append(
                {
                    "id": comment.get("cid") or f"yt_{video_id}_{count}",
                    "author": comment.get("author") or "@anonymous",
                    "text": comment.get("text") or "",
                    "likes": comment.get("votes") or 0,
                    "published_at": pub_at,
                }
            )
            if count >= max_comments:
                break
    except Exception as e:
        # Check if error implies comments disabled or missing video
        err_str = str(e).lower()
        if "disabled" in err_str or "private" in err_str:
            raise HTTPException(
                status_code=422,
                detail={
                    "error": "COMMENTS_DISABLED",
                    "message": "This video has comments disabled or requires authentication.",
                    "details": None,
                },
            )
        raise e

    if not comments:
        # Verify if video exists or comments are disabled
        raise HTTPException(
            status_code=422,
            detail={
                "error": "COMMENTS_DISABLED",
                "message": "No public comments found or comments are disabled on this video.",
                "details": None,
            },
        )

    title = fetch_youtube_video_title(video_id)
    return title, comments



def fetch_comments(
    source_type: str = "youtube",
    url: Optional[str] = None,
    raw_text: Optional[str] = None,
    max_comments: int = 100,
) -> Any:
    """
    Main scraper entrypoint.
    Returns ScrapedResult (supports both .title/.comments/.author/.thumbnail_url and tuple unpacking).
    """
    if source_type == "raw_text" or (raw_text and not url):
        if not raw_text or not raw_text.strip():
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "INVALID_TEXT",
                    "message": "Raw text input is empty.",
                    "details": None,
                },
            )

        lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
        comments = []
        for idx, line in enumerate(lines[:max_comments]):
            comments.append(
                {
                    "id": f"raw_{idx+1}",
                    "author": f"@user_{idx+1}",
                    "text": line,
                    "likes": 0,
                    "published_at": datetime.now(timezone.utc).isoformat(),
                }
            )

        return ScrapedResult(
            title="Raw Text Batch Input",
            comments=comments,
            author=None,
            thumbnail_url=None,
        )

    if source_type in ["youtube", "reddit"]:
        if not url:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "INVALID_URL",
                    "message": "The provided URL is empty or missing.",
                    "details": None,
                },
            )

        video_id = extract_youtube_video_id(url)
        if not video_id:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "INVALID_URL",
                    "message": "The provided URL is not a valid YouTube video link.",
                    "details": None,
                },
            )

        # 1. Try YouTube API v3 if key exists
        if settings.YOUTUBE_API_KEY:
            try:
                return fetch_youtube_comments_via_api(
                    video_id, settings.YOUTUBE_API_KEY, max_comments
                )
            except HTTPException:
                raise
            except Exception:
                pass  # Fallback to downloader if API fails

        # 2. Try youtube-comment-downloader
        if HAS_YOUTUBE_DOWNLOADER:
            try:
                return fetch_youtube_comments_via_downloader(
                    video_id, max_comments
                )
            except HTTPException:
                raise
            except Exception as e:
                # If downloader fails with network or structure change
                raise HTTPException(
                    status_code=500,
                    detail={
                        "error": "SERVER_ERROR",
                        "message": f"Failed to fetch comments from YouTube: {str(e)}",
                        "details": None,
                    },
                )

        raise HTTPException(
            status_code=500,
            detail={
                "error": "SERVER_ERROR",
                "message": "No scraper backend is available to process YouTube comments.",
                "details": None,
            },
        )

    raise HTTPException(
        status_code=400,
        detail={
            "error": "UNSUPPORTED_SOURCE",
            "message": f"Source type '{source_type}' is not supported.",
            "details": None,
        },
    )
