# 학생 출결/성적 관리 시스템 (FastAPI + React)

학생들의 출결과 성적을 한 번에 관리하는 웹 기반 데모입니다. 기본 관리자 계정으로 로그인해 학생/강좌 등록, 출결 입력, 성적 입력·집계를 바로 해볼 수 있습니다.

## 배포 URL
- 백엔드 API: https://backend-geqe.onrender.com
- API 문서(Swagger): https://backend-geqe.onrender.com/docs
- 프론트엔드: https://frontend-zclx.onrender.com

> Render 등 무료 호스팅은 슬립 상태에서 깨우는 데 1~2분이 걸릴 수 있습니다.

## 주요 기능
- JWT 로그인: 기본 관리자 `admin / admin123` 자동 시드
- 학생·강좌 CRUD 및 수강 배정
- 출결 관리: 회차 생성, 학생별 출결 입력, 강좌별 출결 요약
- 성적 관리: 평가항목 생성, 점수 일괄 입력, 학생/강좌별 성적 요약
- 간단한 React UI로 학생·강좌·출결·성적을 한 화면에서 조작

## 기술 스택
- Backend: FastAPI, SQLAlchemy 2.0, SQLite(로컬), JWT
- Frontend: React 18, TypeScript, Vite, Axios
- Etc: UVicorn(개발 서버), bcrypt(password hash), jose(JWT)

## 빠른 시작 (로컬)
### Backend
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 환경변수 (선택)
export SECRET_KEY="change-me"           # 기본값: super-secret-key-change-me
export ACCESS_TOKEN_EXPIRE_MINUTES=60   # 기본값: 60

uvicorn app.main:app --reload --port 8000
```
- Swagger UI: http://127.0.0.1:8000/docs
- 기본 계정: `admin / admin123` (앱 시작 시 자동 생성)

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_BASE=http://127.0.0.1:8000" > .env
npm run dev
# 브라우저에서 표시된 로컬 주소(기본 http://127.0.0.1:5173) 접속
```

## 핵심 API 흐름
모든 보호된 API는 `Authorization: Bearer <token>` 헤더 필요합니다.

1) 로그인 토큰 발급
```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```
`access_token` 값을 추출해 이후 요청의 Bearer 토큰으로 사용합니다.

2) 학생/강좌 생성 → 수강 등록
```bash
curl -X POST http://127.0.0.1:8000/students \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"full_name":"Alice","email":"alice@example.com","grade_level":"2-B"}'

curl -X POST http://127.0.0.1:8000/courses \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Math 101","subject":"Math","class_name":"2-B","teacher_name":"Mr.Lee"}'

curl -X POST http://127.0.0.1:8000/courses/1/enrollments \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"student_id":1}'
```

3) 출결 회차 생성 → 출결 입력 → 요약
```bash
curl -X POST http://127.0.0.1:8000/courses/1/sessions \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"session_date":"2024-12-20","topic":"Algebra"}'

curl -X POST http://127.0.0.1:8000/sessions/1/attendance/bulk \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '[{"student_id":1,"status":"present"}]'

curl -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8000/courses/1/attendance/summary
```

4) 평가/점수 입력 → 성적 조회
```bash
curl -X POST http://127.0.0.1:8000/courses/1/assessments \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Midterm","weight":0.4,"max_score":100}'

curl -X POST http://127.0.0.1:8000/assessments/1/scores/bulk \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '[{"student_id":1,"raw_score":92}]'

curl -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8000/students/1/grades
curl -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8000/courses/1/grades/summary
```

## 프로젝트 구조
```
Mini_Project_01/
├── app/                 # FastAPI 백엔드
│   ├── main.py          # 라우팅 및 시드(admin)
│   ├── models.py        # SQLAlchemy 모델
│   ├── schemas.py       # Pydantic 스키마
│   ├── crud.py          # DB CRUD/비즈니스 로직
│   ├── security.py      # JWT/비밀번호 해시
│   ├── config.py        # 환경 설정
│   └── database.py      # DB 세션/엔진
├── frontend/            # React + Vite 프런트
│   ├── src/App.tsx      # 주요 UI (로그인/학생/강좌/출결/성적)
│   ├── src/api.ts       # Axios 인스턴스 및 타입
│   └── src/style.css    # 기본 스타일
├── requirements.txt
└── README.md
```

## 배포 가이드 (Render 예시)
1) GitHub 연동: 해당 저장소를 Render에 연결
2) Backend 서비스(Web Service)
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
   - Environment: `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES` 등 필요 시 설정
3) Frontend 서비스(Static Site)
   - Build Command: `npm install && npm run build`
   - Publish Directory: `frontend/dist`
   - Environment: `VITE_API_BASE=<Backend URL>`
4) 배포가 끝나면 위의 **배포 URL** 섹션에 실제 주소를 채워 넣으세요.

## 개발 현황 메모
- 백엔드/프론트 CRUD 및 JWT 로그인 기본 기능 구현
- 역할 값은 저장하지만 세부 RBAC 제어는 미구현 (추가 개발 필요)
- SQLite 기본, 운영 환경은 별도 RDB로 교체 가능

## 기본 계정
- 아이디: `admin`
- 비밀번호: `admin123`
