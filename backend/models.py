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
