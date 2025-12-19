from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import Base, engine, get_db
from .deps import api_key_auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="학생 출결/성적 관리 API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def healthcheck():
    return {"status": "ok"}


# Students
@app.post(
    "/students",
    response_model=schemas.StudentRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(api_key_auth)],
)
def create_student(payload: schemas.StudentCreate, db: Session = Depends(get_db)):
    return crud.create_student(db, payload)


@app.get("/students", response_model=list[schemas.StudentRead], dependencies=[Depends(api_key_auth)])
def list_students(db: Session = Depends(get_db)):
    return crud.list_students(db)


@app.get(
    "/students/{student_id}/grades",
    response_model=list[schemas.GradeSummary],
    dependencies=[Depends(api_key_auth)],
)
def get_student_grades(student_id: int, db: Session = Depends(get_db)):
    summaries = crud.grade_summary_for_student(db, student_id)
    return [
        schemas.GradeSummary(
            course_id=item["course_id"],
            course_name=item["course_name"],
            total_weight=item["total_weight"],
            weighted_score=item["weighted_score"],
            details=item["details"],
        )
        for item in summaries
    ]


# Courses
@app.post(
    "/courses",
    response_model=schemas.CourseRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(api_key_auth)],
)
def create_course(payload: schemas.CourseCreate, db: Session = Depends(get_db)):
    return crud.create_course(db, payload)


@app.get("/courses", response_model=list[schemas.CourseRead], dependencies=[Depends(api_key_auth)])
def list_courses(db: Session = Depends(get_db)):
    return crud.list_courses(db)


@app.post(
    "/courses/{course_id}/enrollments",
    response_model=schemas.EnrollmentRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(api_key_auth)],
)
def enroll_student(course_id: int, payload: schemas.EnrollmentCreate, db: Session = Depends(get_db)):
    try:
        return crud.enroll_student(db, course_id, payload.student_id)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Student already enrolled for this course")


@app.get(
    "/courses/{course_id}/enrollments",
    response_model=list[schemas.EnrollmentRead],
    dependencies=[Depends(api_key_auth)],
)
def list_enrollments(course_id: int, db: Session = Depends(get_db)):
    return crud.list_enrollments(db, course_id)


# Sessions / Attendance
@app.post(
    "/courses/{course_id}/sessions",
    response_model=schemas.SessionRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(api_key_auth)],
)
def create_session(course_id: int, payload: schemas.SessionCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_session(db, course_id, payload)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Session already exists for this date")


@app.get(
    "/courses/{course_id}/sessions",
    response_model=list[schemas.SessionRead],
    dependencies=[Depends(api_key_auth)],
)
def list_sessions(course_id: int, db: Session = Depends(get_db)):
    return crud.list_sessions(db, course_id)


@app.post(
    "/sessions/{session_id}/attendance/bulk",
    response_model=list[schemas.AttendanceRead],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(api_key_auth)],
)
def upsert_attendance(
    session_id: int, payload: list[schemas.AttendanceInput], db: Session = Depends(get_db)
):
    return crud.upsert_attendance(db, session_id, payload)


@app.get(
    "/sessions/{session_id}/attendance",
    response_model=list[schemas.AttendanceRead],
    dependencies=[Depends(api_key_auth)],
)
def list_attendance(session_id: int, db: Session = Depends(get_db)):
    return crud.list_attendance(db, session_id)


@app.get(
    "/courses/{course_id}/attendance/summary",
    response_model=schemas.AttendanceSummary,
    dependencies=[Depends(api_key_auth)],
)
def attendance_summary(course_id: int, db: Session = Depends(get_db)):
    return crud.attendance_summary_by_course(db, course_id)


# Assessments / Scores
@app.post(
    "/courses/{course_id}/assessments",
    response_model=schemas.AssessmentRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(api_key_auth)],
)
def create_assessment(course_id: int, payload: schemas.AssessmentCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_assessment(db, course_id, payload)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Assessment with this name already exists")


@app.get(
    "/courses/{course_id}/assessments",
    response_model=list[schemas.AssessmentRead],
    dependencies=[Depends(api_key_auth)],
)
def list_assessments(course_id: int, db: Session = Depends(get_db)):
    return crud.list_assessments(db, course_id)


@app.post(
    "/assessments/{assessment_id}/scores/bulk",
    response_model=list[schemas.ScoreRead],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(api_key_auth)],
)
def upsert_scores(
    assessment_id: int, payload: list[schemas.ScoreInput], db: Session = Depends(get_db)
):
    return crud.upsert_scores(db, assessment_id, payload)


@app.get(
    "/courses/{course_id}/grades/summary",
    response_model=schemas.CourseGradeSummary,
    dependencies=[Depends(api_key_auth)],
)
def grade_summary(course_id: int, db: Session = Depends(get_db)):
    data = crud.grade_summary_for_course(db, course_id)
    if not data:
        raise HTTPException(status_code=404, detail="Course not found")
    return data
