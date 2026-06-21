"""Pydantic request/response models."""
from typing import Optional
from pydantic import BaseModel


class StreakUpdate(BaseModel):
    count: int
    last_active: str


class FlashcardLog(BaseModel):
    deck: str
    card_word: str
    rating: str


class TemplateLog(BaseModel):
    combo_a: str
    combo_b: str
    combo_c: str
    topic: str


class GrammarLog(BaseModel):
    sentence: str
    example_idx: int = -1
    module: str = ""


class TrainingSession(BaseModel):
    date: str
    module: str
    duration_min: int


class CardSRS(BaseModel):
    deck: str
    card_idx: int
    interval_days: Optional[int] = None
    repetitions: Optional[int] = None
    next_review: Optional[str] = None
    mastered: Optional[int] = None
    rating: Optional[str] = None


class Assessment(BaseModel):
    item: str
    week: int
    score: int


class ImportExercises(BaseModel):
    rows: list[list[str]]
# ====== 统一题库模型 ======
class ExerciseItem(BaseModel):
    """通用题目模型 — module + type 区分题型，extra_json 存特有字段。"""
    module: str                                  # flashcard | modern_reading | classical_reading | writing | grammar
    type: str = ""                               # 子类型（如 shici / xuci / wenxue）
    title: str = ""
    content: str                                 # 主体文本（文言短句 / 文章段落 / 病句 / 作文题）
    question: str = ""                           # 具体问题（阅读题题干等）
    options_json: str = "[]"
    answer: str = ""                             # 答案文本或选项索引
    explanation: str = ""
    extra_json: str = "{}"                       # 模块特有字段（如 flashcards: {hl,word,meaning,analogy}）


class DailyAssign(BaseModel):
    """每日选题完成标记"""
    module: str
    date: str = ""
    score: int = 0

class WrongItem(BaseModel):
    """错题记录"""
    exercise_id: int = 0
    module: str = ""
    question_type: str = ""
    question: str = ""
    user_answer: str = ""
    correct_answer: str = ""
    explanation: str = ""
