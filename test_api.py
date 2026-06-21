"""Core API endpoint tests."""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestHealth:
    def test_health_ok(self):
        r = client.get("/api/health")
        assert r.status_code == 200
        assert r.json() == {"status": "ok"}


class TestStreak:
    def test_get_streak_initial(self):
        r = client.get("/api/streak")
        assert r.status_code == 200
        data = r.json()
        assert "count" in data
        assert "last_active" in data

    def test_set_and_get_streak(self):
        client.post("/api/streak", json={"count": 5, "last_active": "2026-06-21"})
        r = client.get("/api/streak")
        assert r.json()["count"] == 5


class TestTrainingSession:
    def test_log_session(self):
        r = client.post("/api/training/session", json={
            "date": "2026-06-21", "module": "reading", "duration_min": 10
        })
        assert r.status_code == 200
        assert r.json()["ok"] is True


class TestCalendar:
    def test_calendar(self):
        r = client.get("/api/calendar?start=2026-06-01&end=2026-06-30")
        assert r.status_code == 200

    def test_calendar_day(self):
        r = client.get("/api/calendar/day?date=2026-06-21")
        assert r.status_code == 200


class TestFlashcard:
    def test_log_flashcard(self):
        r = client.post("/api/flashcard/log", json={
            "deck": "shici", "card_word": "面", "rating": "easy"
        })
        assert r.status_code == 200

    def test_srs_update(self):
        r = client.put("/api/card-srs", json={
            "deck": "shici", "card_idx": 0, "rating": "easy"
        })
        assert r.status_code == 200


class TestTemplate:
    def test_log_template(self):
        r = client.post("/api/template/log", json={
            "combo_a": "A1", "combo_b": "B1", "combo_c": "C1", "topic": "测试"
        })
        assert r.status_code == 200

    def test_stats(self):
        r = client.get("/api/stats/template")
        assert r.status_code == 200


class TestGrammar:
    def test_log_grammar(self):
        r = client.post("/api/grammar/log", json={
            "sentence": "测试", "example_idx": 0, "module": "grammar"
        })
        assert r.status_code == 200

    def test_stats(self):
        r = client.get("/api/stats/grammar")
        assert r.status_code == 200


class TestAssessment:
    def test_save_assessment(self):
        r = client.post("/api/assessment", json={
            "item": "reading_comp", "week": 25, "score": 9
        })
        assert r.status_code == 200


class TestExercises:
    def test_list_flashcards(self):
        r = client.get("/api/exercises/flashcard?category=shici&limit=5")
        assert r.status_code == 200
        assert "items" in r.json()

    def test_list_modern(self):
        r = client.get("/api/exercises/modern")
        assert r.status_code == 200
        assert "items" in r.json()

    def test_list_classical(self):
        r = client.get("/api/exercises/classical")
        assert r.status_code == 200

    def test_list_writing(self):
        r = client.get("/api/exercises/writing")
        assert r.status_code == 200

    def test_list_grammar(self):
        r = client.get("/api/exercises/grammar")
        assert r.status_code == 200


class TestGeneric:
    def test_run_rejects_unknown_table(self):
        r = client.post("/api/run", json={
            "sql": "INSERT INTO streak VALUES (2,0,'')", "params": []
        })
        data = r.json()
        assert data["ok"] is False

    def test_run_allows_daily_tasks(self):
        r = client.post("/api/run", json={
            "sql": "INSERT OR IGNORE INTO daily_tasks (date,task) VALUES ('2026-06-21','flashcard')",
            "params": []
        })
        assert r.json()["ok"] is True

    def test_run_rejects_drop(self):
        r = client.post("/api/run", json={
            "sql": "DROP TABLE daily_tasks", "params": []
        })
        assert r.json()["ok"] is False


class TestStatic:
    def test_index_html(self):
        r = client.get("/")
        assert r.status_code == 200
        assert "语文提高训练" in r.text

    def test_css(self):
        r = client.get("/css/style.css")
        assert r.status_code == 200

    def test_js_api(self):
        r = client.get("/js/api.js")
        assert r.status_code == 200

    def test_js_app(self):
        r = client.get("/js/app.js")
        assert r.status_code == 200
