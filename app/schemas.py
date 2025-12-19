from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field, EmailStr

from .models import AttendanceStatus


class StudentBase(BaseModel):
    full_name: str = Field(..., example="Kim Yuna")
    email: Optional[EmailStr] = None
    grade_level: Optional[str] = Field(None, example="Grade 10")


class StudentCreate(StudentBase):
    pass


class StudentRead(StudentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CourseBase(BaseModel):
    name: str
    subject: Optional[str] = None
    class_name: Optional[str] = Field(None, example="2-B")
    teacher_name: Optional[str] = None


class CourseCreate(CourseBase):
    pass


class CourseRead(CourseBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class EnrollmentCreate(BaseModel):
    student_id: int


class EnrollmentRead(BaseModel):
    id: int
    student: StudentRead

    class Config:
        from_attributes = True


class SessionCreate(BaseModel):
    session_date: date
    start_time: Optional[str] = Field(None, example="09:00")
    end_time: Optional[str] = Field(None, example="10:00")
    topic: Optional[str] = None


class SessionRead(SessionCreate):
    id: int
    course_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AttendanceInput(BaseModel):
    student_id: int
    status: AttendanceStatus
    memo: Optional[str] = None


class AttendanceRead(BaseModel):
    id: int
    session_id: int
    student_id: int
    status: AttendanceStatus
    memo: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True


class AttendanceSummary(BaseModel):
    course_id: int
    session_count: int
    present: int
    late: int
    absent: int
    excused: int


class AssessmentCreate(BaseModel):
    name: str
    weight: float = Field(..., example=0.2)
    max_score: float = Field(..., example=100)
    due_date: Optional[date] = None


class AssessmentRead(AssessmentCreate):
    id: int
    course_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ScoreInput(BaseModel):
    student_id: int
    raw_score: float
    adjusted_score: Optional[float] = None


class ScoreRead(BaseModel):
    id: int
    student_id: int
    assessment_id: int
    raw_score: float
    adjusted_score: Optional[float]
    updated_at: datetime

    class Config:
        from_attributes = True


class GradeSummary(BaseModel):
    course_id: int
    course_name: str
    total_weight: float
    weighted_score: float
    details: List[ScoreRead]


class CourseGradeSummary(BaseModel):
    course_id: int
    course_name: str
    average_score: Optional[float]
    assessments: List[AssessmentRead]
