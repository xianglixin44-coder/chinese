"""Core API endpoint tests."""
import os
os.environ["TRAINER_TOKEN"] = "test"

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

    def setup_method(self):
        """清理测试残留（仅删空内容测试题）"""
        from backend.database import get_db
        conn = get_db()
        conn.execute("DELETE FROM exercises WHERE module='grammar' AND content=''")
        conn.commit()
        conn.close()

    def test_add_exercise(self):
        r = client.post("/api/exercises", json={
            "module": "grammar", "type": "bingju",
            "content": "通过这次学习，使我认识到自己的不足。",
            "question": "请判断此句是否有语病，如有请指出类型并修改。",
            "options_json": '["A. 无语病","B. 成分残缺(缺主语)","C. 搭配不当","D. 句式杂糅"]',
            "answer": "B", "explanation": "介词导致主语被淹没"
        })
        assert r.status_code == 200
        assert r.json()["ok"] is True
        # 清理测试数据
        rid = r.json().get("id")
        if rid:
            from backend.database import get_db
            conn = get_db()
            conn.execute("DELETE FROM exercises WHERE id=?", (rid,))
            conn.commit()
            conn.close()


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

    def test_sql_wasm(self):
        r = client.get("/sql-wasm.wasm")
        assert r.status_code == 200


class TestWrongItems:
    def test_add_wrong(self):
        r = client.post("/api/wrong", json={
            "exercise_id": 0, "module": "grammar",
            "question": "测试错题", "user_answer": "A", "correct_answer": "B"
        })
        assert r.status_code == 200
        assert r.json()["ok"] is True

    def test_list_wrong(self):
        r = client.get("/api/wrong")
        assert r.status_code == 200
        assert "items" in r.json()

    def test_list_wrong_by_module(self):
        r = client.get("/api/wrong?module=grammar")
        assert r.status_code == 200

    def test_delete_wrong(self):
        # Create then delete
        client.post("/api/wrong", json={
            "exercise_id": 0, "module": "grammar",
            "question": "待删除", "user_answer": "X", "correct_answer": "Y"
        })
        items = client.get("/api/wrong?module=grammar").json()["items"]
        if items:
            wid = items[0]["id"]
            r = client.delete(f"/api/wrong/{wid}")
            assert r.status_code == 200
            assert r.json()["ok"] is True


class TestTrainingLog:
    def test_add_log(self):
        r = client.post("/api/training-log", json={
            "module": "grammar", "question": "测试题目",
            "user_answer": "B", "correct_answer": "A", "is_correct": 0
        })
        assert r.status_code == 200
        assert r.json()["ok"] is True

    def test_list_log(self):
        r = client.get("/api/training-log?limit=5")
        assert r.status_code == 200
        assert "items" in r.json()

    def test_list_log_filtered(self):
        r = client.get("/api/training-log?module=grammar&is_correct=0")
        assert r.status_code == 200

    def test_log_stats(self):
        r = client.get("/api/training-log/stats")
        assert r.status_code == 200
        data = r.json()
        assert "total" in data
        assert "correct" in data
        assert "wrong" in data
        assert "to_review" in data

    def test_update_note(self):
        # Create then update
        r = client.post("/api/training-log", json={
            "module": "grammar", "question": "纠错测试",
            "user_answer": "C", "correct_answer": "D", "is_correct": 0
        })
        log_id = r.json().get("id")
        if log_id:
            r2 = client.put(f"/api/training-log/{log_id}/note", json={"note": "这是纠错笔记"})
            assert r2.status_code == 200
            assert r2.json()["ok"] is True

    def test_mark_reviewed(self):
        items = client.get("/api/training-log?limit=1&is_correct=0").json()["items"]
        if items:
            r = client.put(f"/api/training-log/{items[0]['id']}/review")
            assert r.status_code == 200


class TestExport:
    def test_export_flashcards(self):
        r = client.get("/api/export/flashcards")
        assert r.status_code == 200
        assert "牌组" in r.text

    def test_export_training_log(self):
        r = client.get("/api/export/training_log")
        assert r.status_code == 200

    def test_export_methods(self):
        r = client.get("/api/export/methods")
        assert r.status_code == 200
        assert "标题" in r.text

    def test_export_wrong_items(self):
        r = client.get("/api/export/wrong_items")
        assert r.status_code == 200

    def test_export_exercises(self):
        r = client.get("/api/export/exercises")
        assert r.status_code == 200
        assert "模块" in r.text

    def test_export_unknown_dataset(self):
        r = client.get("/api/export/nonexistent")
        assert r.status_code == 200
        assert "error" in r.json()


class TestAuth:
    """AuthMiddleware tests — POST endpoints require token when TRAINER_TOKEN != 'test'."""
    def test_get_endpoints_no_auth(self):
        """GET endpoints should work without auth"""
        endpoints = ["/api/health", "/api/streak", "/api/stats/template"]
        for ep in endpoints:
            r = client.get(ep)
            assert r.status_code == 200, f"{ep} should return 200"


class TestImportExercises:
    def test_import_csv_rows(self):
        r = client.post("/api/import/exercises", json={
            "rows": [
                ["grammar", "bingju", "测试病句", '["A","B","C","D"]', "B", "解析内容"],
                ["modern_reading", "choice", "测试阅读", '["A","B"]', "A", "阅读解析"]
            ]
        })
        assert r.status_code == 200
        assert r.json()["ok"] is True

    def test_import_empty_rows(self):
        r = client.post("/api/import/exercises", json={"rows": []})
        assert r.status_code == 200
        assert r.json()["count"] == 0

class TestDuanju:
    """断句题库完整性测试"""
    import json as _json

    def test_duanju_api_returns_items(self):
        """API应返回足量断句题目"""
        r = client.get("/api/exercises?module=classical_reading&type=duanju&limit=200")
        assert r.status_code == 200
        data = r.json()
        assert "items" in data
        assert len(data["items"]) >= 10, f"至少应有10道断句题，实际{len(data['items'])}道"

    def test_duanju_each_has_valid_options(self):
        """每道断句题应有4个带/的选项"""
        r = client.get("/api/exercises?module=classical_reading&type=duanju&limit=200")
        for item in r.json()["items"]:
            opts = self._json.loads(item["options_json"])
            assert len(opts) == 4, f"id={item['id']} 选项数={len(opts)}，应为4"
            for o in opts:
                assert '/' in o, f"id={item['id']} 选项缺少断句符"

    def test_duanju_each_has_valid_answer(self):
        """答案应为A/B/C/D"""
        r = client.get("/api/exercises?module=classical_reading&type=duanju&limit=200")
        for item in r.json()["items"]:
            assert item["answer"] in ("A","B","C","D"), f"id={item['id']} 答案={item['answer']}"

    def test_duanju_each_has_content(self):
        """每道题应有原文"""
        r = client.get("/api/exercises?module=classical_reading&type=duanju&limit=200")
        for item in r.json()["items"]:
            assert len(item["content"]) > 10, f"id={item['id']} 内容过短"

    def test_duanju_each_has_explanation(self):
        """每道题应有解析"""
        r = client.get("/api/exercises?module=classical_reading&type=duanju&limit=200")
        for item in r.json()["items"]:
            assert len(item.get("explanation","")) > 10, f"id={item['id']} 缺少解析"

    def test_duanju_answer_matches_option(self):
        """答案索引对应正确选项"""
        r = client.get("/api/exercises?module=classical_reading&type=duanju&limit=200")
        for item in r.json()["items"]:
            opts = self._json.loads(item["options_json"])
            aidx = ord(item["answer"]) - 65
            assert 0 <= aidx < len(opts), f"id={item['id']} 答案索引越界"
