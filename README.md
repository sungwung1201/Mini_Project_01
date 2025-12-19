# 학생 출결/성적 관리 시스템 (FastAPI + React)

Python(FastAPI + SQLAlchemy + SQLite) 백엔드와 React(프론트) 기반의 출결·성적 관리 골격입니다. 학생/수업/수강/출결/평가/점수 CRUD, 출결 요약, 성적 요약(학생/강좌별) 및 JWT 로그인(기본 admin/admin123)을 포함합니다.

## 백엔드 실행

```bash
pip install -r requirements.txt
export API_KEY=devkey          # 사용 안 해도 무방 (JWT 사용)
export SECRET_KEY=changeme     # 운영 시 필수 변경
uvicorn app.main:app --reload
```
- SQLite 파일: `app.db` 자동 생성
- 기본 관리자: `admin / admin123` (startup 시 자동 생성)

## 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```
- 환경: `frontend/.env.example` 참고 (`VITE_API_BASE`)
- 브라우저에서 로그인 후 학생/강좌/출결/성적 탭 사용

## 주요 엔드포인트 (JWT Bearer)
- `POST /auth/login` (form: username, password) → `access_token`
- 학생: `POST /students`, `GET /students`, `GET /students/{id}/grades`
- 강좌: `POST /courses`, `GET /courses`
- 수강: `POST /courses/{course_id}/enrollments`, `GET /courses/{course_id}/enrollments`
- 수업/출결: `POST /courses/{course_id}/sessions`, `GET /courses/{course_id}/sessions`, `POST /sessions/{session_id}/attendance/bulk`, `GET /sessions/{session_id}/attendance`, `GET /courses/{course_id}/attendance/summary`
- 평가/성적: `POST /courses/{course_id}/assessments`, `GET /courses/{course_id}/assessments`, `POST /assessments/{assessment_id}/scores/bulk`, `GET /courses/{course_id}/grades/summary`

## cURL 테스트 예시

```bash
# 로그인 → 토큰 획득
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123" | jq -r .access_token)

# 학생 추가
curl -X POST http://127.0.0.1:8000/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Alice","email":"alice@example.com","grade_level":"G2"}'

# 강좌 생성
curl -X POST http://127.0.0.1:8000/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Math 101","subject":"Math","class_name":"2-B","teacher_name":"Mr.Lee"}'

# 수강 등록
curl -X POST http://127.0.0.1:8000/courses/1/enrollments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"student_id":1}'

# 회차 생성
curl -X POST http://127.0.0.1:8000/courses/1/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"session_date":"2024-12-20","topic":"Algebra"}'

# 출결 입력
curl -X POST http://127.0.0.1:8000/sessions/1/attendance/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"student_id":1,"status":"present"}]'

# 평가/점수 입력
curl -X POST http://127.0.0.1:8000/courses/1/assessments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Midterm","weight":0.4,"max_score":100}'

curl -X POST http://127.0.0.1:8000/assessments/1/scores/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"student_id":1,"raw_score":92}]'

# 성적/출결 요약 확인
curl -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8000/students/1/grades
curl -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8000/courses/1/attendance/summary
curl -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8000/courses/1/grades/summary
```

## 빠른 테스트 흐름
1) 백엔드 띄우기 → `admin/admin123`로 로그인해 토큰 확보
2) 프론트 실행 후 로그인 → 학생/강좌 생성 → 수강 등록 → 회차 생성 → 출결 입력 → 평가/점수 입력 → 요약 확인

## 추가 개발 아이디어
- RBAC 세분화(관리자/교사/학생/보호자) 및 권한별 API 필터
- 출결·성적 변경 이력/감사 로그
- PDF/엑셀 리포트 + 비동기 워커(Celery)
- 정책 기반 성적 산출(결측/재시험/가산점)
- 멀티테넌시(기관 분리), 관리자 콘솔
