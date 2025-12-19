from __future__ import annotations

from typing import Iterable, List

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import (
    Assessment,
    AttendanceRecord,
    AttendanceStatus,
    Course,
    Enrollment,
    Score,
    Session as CourseSession,
    Student,
)
from .schemas import (
    AssessmentCreate,
    AttendanceInput,
    CourseCreate,
    ScoreInput,
    SessionCreate,
    StudentCreate,
)


def create_student(db: Session, payload: StudentCreate) -> Student:
    student = Student(**payload.dict())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


def list_students(db: Session) -> List[Student]:
    return list(db.scalars(select(Student).order_by(Student.created_at.desc())))


def create_course(db: Session, payload: CourseCreate) -> Course:
    course = Course(**payload.dict())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


def list_courses(db: Session) -> List[Course]:
    return list(db.scalars(select(Course).order_by(Course.created_at.desc())))


def enroll_student(db: Session, course_id: int, student_id: int) -> Enrollment:
    enrollment = Enrollment(course_id=course_id, student_id=student_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


def list_enrollments(db: Session, course_id: int) -> List[Enrollment]:
    stmt = (
        select(Enrollment)
        .where(Enrollment.course_id == course_id)
        .order_by(Enrollment.created_at.desc())
    )
    return list(db.scalars(stmt))


def create_session(db: Session, course_id: int, payload: SessionCreate) -> CourseSession:
    session = CourseSession(course_id=course_id, **payload.dict())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def list_sessions(db: Session, course_id: int) -> List[CourseSession]:
    stmt = (
        select(CourseSession)
        .where(CourseSession.course_id == course_id)
        .order_by(CourseSession.session_date.desc())
    )
    return list(db.scalars(stmt))


def upsert_attendance(
    db: Session, session_id: int, items: Iterable[AttendanceInput]
) -> List[AttendanceRecord]:
    updated: list[AttendanceRecord] = []
    for item in items:
        stmt = select(AttendanceRecord).where(
            AttendanceRecord.session_id == session_id,
            AttendanceRecord.student_id == item.student_id,
        )
        existing = db.scalars(stmt).first()
        if existing:
            existing.status = item.status
            existing.memo = item.memo
            updated.append(existing)
        else:
            record = AttendanceRecord(
                session_id=session_id,
                student_id=item.student_id,
                status=item.status,
                memo=item.memo,
            )
            db.add(record)
            updated.append(record)
    db.commit()
    for record in updated:
        db.refresh(record)
    return updated


def list_attendance(db: Session, session_id: int) -> List[AttendanceRecord]:
    stmt = (
        select(AttendanceRecord)
        .where(AttendanceRecord.session_id == session_id)
        .order_by(AttendanceRecord.student_id.asc())
    )
    return list(db.scalars(stmt))


def attendance_summary_by_course(db: Session, course_id: int):
    sessions = db.scalars(
        select(CourseSession.id).where(CourseSession.course_id == course_id)
    ).all()
    if not sessions:
        return {"course_id": course_id, "session_count": 0, "present": 0, "late": 0, "absent": 0, "excused": 0}
    counts = {s.value: 0 for s in AttendanceStatus}
    for session_id in sessions:
        records = db.scalars(
            select(AttendanceRecord.status).where(AttendanceRecord.session_id == session_id)
        ).all()
        for status in records:
            counts[status.value] += 1
    return {
        "course_id": course_id,
        "session_count": len(sessions),
        "present": counts.get("present", 0),
        "late": counts.get("late", 0),
        "absent": counts.get("absent", 0),
        "excused": counts.get("excused", 0),
    }


def create_assessment(db: Session, course_id: int, payload: AssessmentCreate) -> Assessment:
    assessment = Assessment(course_id=course_id, **payload.dict())
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


def list_assessments(db: Session, course_id: int) -> List[Assessment]:
    stmt = (
        select(Assessment)
        .where(Assessment.course_id == course_id)
        .order_by(Assessment.created_at.desc())
    )
    return list(db.scalars(stmt))


def upsert_scores(
    db: Session, assessment_id: int, items: Iterable[ScoreInput]
) -> List[Score]:
    updated: list[Score] = []
    for item in items:
        stmt = select(Score).where(
            Score.assessment_id == assessment_id, Score.student_id == item.student_id
        )
        existing = db.scalars(stmt).first()
        if existing:
            existing.raw_score = item.raw_score
            existing.adjusted_score = item.adjusted_score
            updated.append(existing)
        else:
            score = Score(
                assessment_id=assessment_id,
                student_id=item.student_id,
                raw_score=item.raw_score,
                adjusted_score=item.adjusted_score,
            )
            db.add(score)
            updated.append(score)
    db.commit()
    for record in updated:
        db.refresh(record)
    return updated


def grade_summary_for_student(db: Session, student_id: int):
    courses = select(Course).join(Enrollment).where(Enrollment.student_id == student_id)
    results = []
    for course in db.scalars(courses):
        assessments = db.scalars(
            select(Assessment).where(Assessment.course_id == course.id)
        ).all()
        total_weight = sum(a.weight for a in assessments) or 1
        course_weighted = 0.0
        detail_scores: list[Score] = []
        for assessment in assessments:
            score = db.scalars(
                select(Score).where(
                    Score.assessment_id == assessment.id, Score.student_id == student_id
                )
            ).first()
            if score:
                detail_scores.append(score)
                base = float(score.adjusted_score or score.raw_score)
                course_weighted += (base / assessment.max_score) * assessment.weight * 100
        results.append(
            {
                "course_id": course.id,
                "course_name": course.name,
                "total_weight": total_weight,
                "weighted_score": round(course_weighted, 2),
                "details": detail_scores,
            }
        )
    return results


def grade_summary_for_course(db: Session, course_id: int):
    course = db.get(Course, course_id)
    if not course:
        return None
    assessments = db.scalars(
        select(Assessment).where(Assessment.course_id == course_id)
    ).all()
    student_scores: list[float] = []
    for assessment in assessments:
        scores = db.scalars(select(Score.raw_score).where(Score.assessment_id == assessment.id)).all()
        student_scores.extend([float(s) for s in scores])
    average_score = round(sum(student_scores) / len(student_scores), 2) if student_scores else None
    return {
        "course_id": course.id,
        "course_name": course.name,
        "average_score": average_score,
        "assessments": assessments,
    }
