from app.services.question_extractor import is_genuine_question, extract_questions


def test_is_genuine_question_valid():
    assert is_genuine_question("How do I install dependencies on Windows 11?") is True
    assert is_genuine_question("Is Redux still relevant in 2026?") is True
    assert is_genuine_question("Could you explain the difference between state and props?") is True
    assert is_genuine_question("What is the cheapest host for FastAPI?") is True


def test_is_genuine_question_invalid_praise():
    assert is_genuine_question("Great video!") is False
    assert is_genuine_question("Awesome video brother!") is False
    assert is_genuine_question("Thanks for sharing this") is False


def test_extract_questions_ranking():
    raw_comments = [
        {"id": "1", "author": "@user1", "text": "Great video man", "likes": 100},
        {
            "id": "2",
            "author": "@user2",
            "text": "How do you handle rate limits with YouTube API?",
            "likes": 45,
        },
        {
            "id": "3",
            "author": "@user3",
            "text": "Is Python 3.11 supported?",
            "likes": 120,
        },
    ]

    questions = extract_questions(raw_comments)
    assert len(questions) == 2
    # Highest likes question should be first
    assert questions[0].id == "3"
    assert questions[1].id == "2"
