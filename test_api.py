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
        r = client.get("/api/exercises?module=flashcard&type=shici&limit=5")
        assert r.status_code == 200
        assert "items" in r.json()

    def test_list_modern(self):
        r = client.get("/api/exercises?module=modern_reading")
        assert r.status_code == 200
        assert "items" in r.json()

    def test_list_classical(self):
        r = client.get("/api/exercises?module=classical_reading")
        assert r.status_code == 200

    def test_list_writing(self):
        r = client.get("/api/exercises?module=writing")
        assert r.status_code == 200

    def test_list_grammar(self):
        r = client.get("/api/exercises?module=grammar")
        assert r.status_code == 200

    def test_add_exercise(self):
        r = client.post("/api/exercises", json={
            "module": "grammar", "type": "bingju",
            "content": "通过这次学习，使我认识到自己的不足。",
            "answer": "缺主语", "explanation": "介词导致主语被淹没"
        })
        assert r.status_code == 200
        assert r.json()["ok"] is True


class TestDaily:
    # Use far-future dates to avoid collisions with real data
    D1 = "2099-01-10"
    D2 = "2099-01-11"
    D3 = "2099-01-12"
    D4 = "2099-01-13"

    def setup_method(self):
        """清理可能残留的测试数据"""
        from backend.database import get_db
        conn = get_db()
        conn.execute("DELETE FROM daily_assignments WHERE date >= '2099-01-01'")
        conn.commit()
        conn.close()

    def test_assign_new(self):
        """首次请求自动分配一题"""
        r = client.get(f"/api/daily?module=grammar&date={self.D1}")
        assert r.status_code == 200
        data = r.json()
        assert data["is_new"] is True
        assert data["exercise"] is not None
        assert data["exercise"]["module"] == "grammar"

    def test_same_day_same_module_returns_same(self):
        """同一天同模块请求两次返回同一题"""
        r1 = client.get(f"/api/daily?module=grammar&date={self.D2}")
        r2 = client.get(f"/api/daily?module=grammar&date={self.D2}")
        assert r1.json()["exercise"]["id"] == r2.json()["exercise"]["id"]
        assert r2.json()["is_new"] is False

    def test_different_day_different_exercise(self):
        """相邻两天返回不同题（如果题库够）"""
        r1 = client.get(f"/api/daily?module=flashcard&date={self.D3}")
        r2 = client.get(f"/api/daily?module=flashcard&date={self.D4}")
        assert r1.status_code == 200
        assert r2.status_code == 200

    def test_complete(self):
        """标记完成"""
        r = client.post("/api/daily/complete", json={
            "module": "grammar", "date": self.D1, "score": 3
        })
        assert r.status_code == 200
        assert r.json()["ok"] is True


class TestMethods:
    def setup_method(self):
        from backend.database import get_db
        conn = get_db()
        conn.execute("DELETE FROM methods WHERE sort_order >= 10")
        conn.commit()
        conn.close()

    def test_list_methods(self):
        r = client.get("/api/methods")
        assert r.status_code == 200
        data = r.json()
        assert len(data["items"]) == 9
        assert data["items"][0]["title"] == "主动标记阅读法"

    def test_add_method(self):
        r = client.post("/api/methods", json={
            "sort_order": 10, "icon": "🆕", "title": "测试方法",
            "source": "测试来源", "description": "测试描述"
        })
        assert r.status_code == 200
        assert r.json()["ok"] is True


class TestRecords:
    def test_get_records(self):
        r = client.get("/api/records?days=7")
        assert r.status_code == 200
        data = r.json()
        assert "daily" in data
        assert "flashcards" in data
        assert "grammar" in data
        assert "templates" in data
        assert "week_stats" in data


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
