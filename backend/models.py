from pydantic import BaseModel
class StreakUpdate(BaseModel): count: int; last_active: str
class FlashcardLog(BaseModel): deck: str; card_word: str; rating: str
class TemplateLog(BaseModel): combo_a: str; combo_b: str; combo_c: str; topic: str
class GrammarLog(BaseModel): sentence: str; example_idx: int = -1; module: str = ""
class TrainingSession(BaseModel): date: str; module: str; duration_min: int
class CardSRS(BaseModel): deck: str; card_idx: int; interval_days: int|None=None; repetitions: int|None=None; next_review: str|None=None; mastered: int|None=None; rating: str|None=None
class Assessment(BaseModel): item: str; week: int; score: int
class ImportExercises(BaseModel): rows: list[list[str]]
