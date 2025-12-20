from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import Base, engine, get_db
from .security import create_access_token, decode_access_token
from .config import API_KEY

Base.metadata.create_all(bind=engine)

app = FastAPI(title="학생 출결/성적 관리 API", version="0.1.0")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@app.on_event("startup")
def seed_admin():
    # create default admin if not exists
    db = next(get_db())
    if not crud.get_user_by_username(db, "admin"):
        crud.create_user(
            db,
            schemas.UserCreate(username="admin", password="admin123", role="admin"),
        )
    db.close()

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


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    username = decode_access_token(token)
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = crud.get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    token = create_access_token(subject=user.username)
    return {"access_token": token, "token_type": "bearer"}


@app.post("/auth/register", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    created = crud.create_user(db, user)
    return created


# Students
@app.post(
    "/students",
    response_model=schemas.StudentRead,
    status_code=status.HTTP_201_CREATED,
)
def create_student(
    payload: schemas.StudentCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    return crud.create_student(db, payload)


@app.get("/students", response_model=list[schemas.StudentRead])
def list_students(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return crud.list_students(db)


@app.put("/students/{student_id}", response_model=schemas.StudentRead)
def update_student(
    student_id: int,
    payload: schemas.StudentCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    updated = crud.update_student(db, student_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Student not found")
    return updated


@app.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    ok = crud.delete_student(db, student_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Student not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get(
    "/students/{student_id}/grades",
    response_model=list[schemas.GradeSummary],
)
def get_student_grades(
    student_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)
):
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
)
def create_course(
    payload: schemas.CourseCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)
):
    return crud.create_course(db, payload)


@app.get("/courses", response_model=list[schemas.CourseRead])
def list_courses(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return crud.list_courses(db)


@app.put("/courses/{course_id}", response_model=schemas.CourseRead)
def update_course(
    course_id: int,
    payload: schemas.CourseCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    updated = crud.update_course(db, course_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Course not found")
    return updated


@app.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    ok = crud.delete_course(db, course_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Course not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.post(
    "/courses/{course_id}/enrollments",
    response_model=schemas.EnrollmentRead,
    status_code=status.HTTP_201_CREATED,
)
def enroll_student(
    course_id: int,
    payload: schemas.EnrollmentCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    try:
        return crud.enroll_student(db, course_id, payload.student_id)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Student already enrolled for this course")


@app.get("/courses/{course_id}/enrollments", response_model=list[schemas.EnrollmentRead])
def list_enrollments(course_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return crud.list_enrollments(db, course_id)


# Sessions / Attendance
@app.post(
    "/courses/{course_id}/sessions",
    response_model=schemas.SessionRead,
    status_code=status.HTTP_201_CREATED,
)
def create_session(
    course_id: int,
    payload: schemas.SessionCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    try:
        return crud.create_session(db, course_id, payload)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Session already exists for this date")


@app.get("/courses/{course_id}/sessions", response_model=list[schemas.SessionRead])
def list_sessions(course_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return crud.list_sessions(db, course_id)


@app.post(
    "/sessions/{session_id}/attendance/bulk",
    response_model=list[schemas.AttendanceRead],
    status_code=status.HTTP_201_CREATED,
)
def upsert_attendance(
    session_id: int,
    payload: list[schemas.AttendanceInput],
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    return crud.upsert_attendance(db, session_id, payload)


@app.get(
    "/sessions/{session_id}/attendance",
    response_model=list[schemas.AttendanceRead],
)
def list_attendance(session_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return crud.list_attendance(db, session_id)


@app.get(
    "/courses/{course_id}/attendance/summary",
    response_model=schemas.AttendanceSummary,
)
def attendance_summary(course_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return crud.attendance_summary_by_course(db, course_id)


# Assessments / Scores
@app.post(
    "/courses/{course_id}/assessments",
    response_model=schemas.AssessmentRead,
    status_code=status.HTTP_201_CREATED,
)
def create_assessment(
    course_id: int,
    payload: schemas.AssessmentCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    try:
        return crud.create_assessment(db, course_id, payload)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Assessment with this name already exists")


@app.get("/courses/{course_id}/assessments", response_model=list[schemas.AssessmentRead])
def list_assessments(
    course_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)
):
    return crud.list_assessments(db, course_id)


@app.post(
    "/assessments/{assessment_id}/scores/bulk",
    response_model=list[schemas.ScoreRead],
    status_code=status.HTTP_201_CREATED,
)
def upsert_scores(
    assessment_id: int,
    payload: list[schemas.ScoreInput],
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    return crud.upsert_scores(db, assessment_id, payload)


@app.get(
    "/courses/{course_id}/grades/summary",
    response_model=schemas.CourseGradeSummary,
)
def grade_summary(course_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    data = crud.grade_summary_for_course(db, course_id)
    if not data:
        raise HTTPException(status_code=404, detail="Course not found")
    return data
