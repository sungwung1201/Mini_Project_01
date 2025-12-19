# 학생 출결/성적 관리 시스템 (FastAPI + React)

Python(FastAPI + SQLAlchemy + SQLite) 백엔드와 React(프론트) 기반의 출결·성적 관리 골격입니다. 학생/수업/수강/출결/평가/점수 CRUD, 출결 요약, 성적 요약(학생/강좌별)을 포함합니다. 기본 API-Key 인증을 사용합니다.

## 빠른 실행 방법

```bash
# (선택) 가상환경 활성화 후 백엔드 의존성 설치
pip install -r requirements.txt

# API 키 설정(선택, 미설정 시 devkey)
export API_KEY=devkey

# FastAPI 개발 서버 실행
uvicorn app.main:app --reload
```

SQLite 파일은 `app.db` 로 생성됩니다. DB 스키마는 첫 실행 시 자동 생성됩니다. 모든 보호된 API 호출 시 헤더 `X-API-Key: <API_KEY>` 를 포함하세요.

프론트엔드는 `frontend/`에 React + Vite + TypeScript 구조만 준비했습니다. 의존성 설치 후 개발 서버를 띄우면 됩니다.

```bash
cd frontend
npm install
npm run dev
```

## 주요 엔드포인트

- `GET /health` 헬스체크
- 학생: `POST /students`, `GET /students`, `GET /students/{id}/grades`
- 강좌: `POST /courses`, `GET /courses`
- 수강: `POST /courses/{course_id}/enrollments`, `GET /courses/{course_id}/enrollments`
- 수업 회차/출결: `POST /courses/{course_id}/sessions`, `GET /courses/{course_id}/sessions`, `POST /sessions/{session_id}/attendance/bulk`, `GET /sessions/{session_id}/attendance`, `GET /courses/{course_id}/attendance/summary`
- 평가/점수: `POST /courses/{course_id}/assessments`, `GET /courses/{course_id}/assessments`, `POST /assessments/{assessment_id}/scores/bulk`
- 성적 요약: `GET /students/{id}/grades`, `GET /courses/{course_id}/grades/summary`

Swagger UI는 `http://127.0.0.1:8000/docs` 에서 확인할 수 있습니다.

## 사용 흐름 예시

1) 학생/강좌 생성
```bash
curl -X POST http://127.0.0.1:8000/students -H "Content-Type: application/json" -H "X-API-Key: devkey" \
  -d '{"full_name":"Alice","email":"alice@example.com","grade_level":"G2"}'

curl -X POST http://127.0.0.1:8000/courses -H "Content-Type: application/json" -H "X-API-Key: devkey" \
  -d '{"name":"Math 101","subject":"Math","class_name":"2-B","teacher_name":"Mr.Lee"}'
```

2) 수강 등록 → 회차 생성 → 출결 입력
```bash
curl -X POST http://127.0.0.1:8000/courses/1/enrollments -H "Content-Type: application/json" -H "X-API-Key: devkey" -d '{"student_id":1}'
curl -X POST http://127.0.0.1:8000/courses/1/sessions -H "Content-Type: application/json" -H "X-API-Key: devkey" -d '{"session_date":"2024-12-20","topic":"Algebra"}'
curl -X POST http://127.0.0.1:8000/sessions/1/attendance/bulk -H "Content-Type: application/json" -H "X-API-Key: devkey" \
  -d '[{"student_id":1,"status":"present"}]'
```

3) 평가/점수 입력 → 성적 조회
```bash
curl -X POST http://127.0.0.1:8000/courses/1/assessments -H "Content-Type: application/json" -H "X-API-Key: devkey" \
  -d '{"name":"Midterm","weight":0.4,"max_score":100}'
curl -X POST http://127.0.0.1:8000/assessments/1/scores/bulk -H "Content-Type: application/json" -H "X-API-Key: devkey" \
  -d '[{"student_id":1,"raw_score":92}]'

curl -H "X-API-Key: devkey" http://127.0.0.1:8000/students/1/grades
curl -H "X-API-Key: devkey" http://127.0.0.1:8000/courses/1/attendance/summary
curl -H "X-API-Key: devkey" http://127.0.0.1:8000/courses/1/grades/summary
```

## 다음 확장 아이디어
- 사용자/권한(RBAC) 추가, 인증(JWT) 연동
- 출결/성적 변경 이력 테이블 및 감사 로그
- 리포트(PDF/엑셀) 생성 워커(Celery) 연동
- 정책 기반 성적 산출(결측 처리, 재시험, 가산점 등)
- 멀티테넌시(기관 구분)와 관리자용 대시보드
