import { useEffect, useMemo, useState } from 'react';
import type { SVGProps } from 'react';
import {
  api,
  Assessment,
  AttendanceRecord,
  AttendanceSummary,
  Course,
  CourseGradeSummary,
  GradeSummary,
  Score,
  Session,
  Student,
  login,
} from './api';

type SvgIcon = (props: SVGProps<SVGSVGElement>) => JSX.Element;

const IconLayoutDashboard: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="7" height="9" rx="2" />
    <rect x="14" y="3" width="7" height="5" rx="2" />
    <rect x="14" y="10" width="7" height="11" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
  </svg>
);

const IconGraduationCap: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 10L12 5 2 10l10 5 10-5Z" />
    <path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5" />
    <path d="M2 10v6" />
  </svg>
);

const IconBookOpen: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 7v14" />
    <path d="M3 5h7a2 2 0 0 1 2 2v14H5a2 2 0 0 1-2-2V5Z" />
    <path d="M21 5h-7a2 2 0 0 0-2 2v14h7a2 2 0 0 0 2-2V5Z" />
  </svg>
);

const IconCalendarCheck: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8 2v3M16 2v3" />
    <path d="M3 8h18" />
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="m9 14 2 2 4-4" />
  </svg>
);

const IconBarChart: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 3v18h18" />
    <path d="M7 16v-6" />
    <path d="M12 16V7" />
    <path d="M17 16v-9" />
  </svg>
);

const IconClipboardList: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="9" y="2" width="6" height="4" rx="1" />
    <path d="M9 4H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
    <path d="M8 11h8" />
    <path d="M8 15h8" />
    <path d="M8 19h6" />
  </svg>
);

const IconUsers: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconPercent: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 5 5 19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

const IconTrendingUp: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </svg>
);

const IconUserPlus: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M20 8v6" />
    <path d="M17 11h6" />
  </svg>
);

const IconFilePlus: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M12 11v6" />
    <path d="M9 14h6" />
  </svg>
);

const IconFiles: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 7h-6l-2-2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
    <path d="M2 10h20" />
  </svg>
);

const attendanceOptions = [
  { value: 'present', label: '출석' },
  { value: 'late', label: '지각' },
  { value: 'absent', label: '결석' },
  { value: 'excused', label: '공결' },
] as const;

type Tab = 'dashboard' | 'students' | 'courses' | 'attendance' | 'grades' | 'assignments';
type Role = 'admin' | 'teacher';
type Toast = { id: number; type: 'success' | 'error'; message: string };

type LoadState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

function useLoad<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<LoadState<T>>({ data: null, loading: false, error: null });

  useEffect(() => {
    let mounted = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetcher()
      .then((res) => mounted && setState({ data: res, loading: false, error: null }))
      .catch((err) => {
        const detail = err?.response?.data?.detail;
        const msg =
          typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
              ? detail.map((d: any) => d?.msg || JSON.stringify(d)).join(', ')
              : detail?.msg || err.message;
        mounted && setState({ data: null, loading: false, error: msg || '오류가 발생했습니다.' });
      })
      .finally(() => mounted && setState((prev) => ({ ...prev, loading: false })));
    return () => {
      mounted = false;
    };
  }, deps);

  return {
    ...state,
    setData: (fn: (prev: T | null) => T | null) => setState((prev) => ({ ...prev, data: fn(prev.data) })),
  };
}

function LoginCard({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.detail || '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h2>학생 관리 시스템</h2>
        <p className="muted">로그인하여 시작하세요</p>
        <div className="field">
          <label>아이디</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="아이디를 입력하세요" />
        </div>
        <div className="field">
          <label>비밀번호</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호를 입력하세요" />
        </div>
        <button onClick={submit} disabled={loading} style={{ width: '100%' }}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
        {error && <div className="error-text">{error}</div>}
        <p className="muted" style={{ marginTop: 12 }}>
          테스트 계정: admin / admin123
        </p>
      </div>
    </div>
  );
}

function HeaderBar({
  tab,
  setTab,
  role,
  onRoleChange,
  onLogout,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  role: Role;
  onRoleChange: (r: Role) => void;
  onLogout: () => void;
}) {
  return (
    <div className="header-bar">
      <div className="header-left">
        <div className="brand">
          <IconLayoutDashboard className="brand-icon" aria-hidden="true" />
          <span>Grade Management</span>
        </div>
        <div className="header-sub">출결 · 성적 관리</div>
      </div>

      <div className="header-right">
        <div className="header-group">
          <label className="header-label">화면</label>
          <select value={tab} onChange={(e) => setTab(e.target.value as Tab)} className="header-select">
            <option value="dashboard">대시보드</option>
            <option value="students">학생</option>
            <option value="courses">과정</option>
            <option value="attendance">출결</option>
            <option value="grades">성적</option>
            <option value="assignments">과제</option>
          </select>
        </div>

        <div className="header-group">
          <label className="header-label">역할</label>
          <select value={role} onChange={(e) => onRoleChange(e.target.value as Role)} className="header-select">
            <option value="admin">admin</option>
            <option value="teacher">teacher</option>
          </select>
        </div>

        <button className="secondary" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </div>
  );
}

function StatusLegend({ items, title = '상태 레전드' }: { items: { label: string; color: string }[]; title?: string }) {
  return (
    <div className="legend">
      <div className="legend-title">{title}</div>
      <div className="legend-items">
        {items.map((i) => (
          <span key={i.label} className="legend-pill" style={{ background: i.color }}>
            {i.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function DashboardSection({ go }: { go: (tab: Tab) => void }) {
  const { data: students } = useLoad<Student[]>(async () => (await api.get('/students')).data, []);
  const { data: courses } = useLoad<Course[]>(async () => (await api.get('/courses')).data, []);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [courseGrade, setCourseGrade] = useState<CourseGradeSummary | null>(null);
  const courseId = selectedCourseId ?? courses?.[0]?.id;

  useEffect(() => {
    if (!courseId) {
      setAttendanceSummary(null);
      setCourseGrade(null);
      return;
    }
    api
      .get<AttendanceSummary>(`/courses/${courseId}/attendance/summary`)
      .then((res) => setAttendanceSummary(res.data))
      .catch(() => setAttendanceSummary(null));
    api
      .get<CourseGradeSummary>(`/courses/${courseId}/grades/summary`)
      .then((res) => setCourseGrade(res.data))
      .catch(() => setCourseGrade(null));
  }, [courseId]);

  const totalStudents = students?.length ?? 0;
  const totalCourses = courses?.length ?? 0;
  const recentStudents = students?.slice(0, 4) ?? [];
  const recentCourses = courses?.slice(0, 4) ?? [];

  return (
    <div className="dashboard">
      <div className="hero">
        <div>
          <p className="eyebrow">안녕하세요</p>
          <h1>오늘의 학사 현황</h1>
        </div>
        <div className="hero-actions">
          <button className="secondary" onClick={() => go('students')}>
            학생 등록
          </button>
          <button onClick={() => go('attendance')}>출결 입력</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <IconUsers className="stat-icon-svg" aria-hidden="true" />
          </div>
          <div>
            <div className="stat-label">총 학생 수</div>
            <div className="stat-value">{totalStudents}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal">
            <IconBookOpen className="stat-icon-svg" aria-hidden="true" />
          </div>
          <div>
            <div className="stat-label">진행 중인 과정</div>
            <div className="stat-value">{totalCourses}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <IconPercent className="stat-icon-svg" aria-hidden="true" />
          </div>
          <div>
            <div className="stat-label">출석률</div>
            <div className="stat-value">
              {attendanceSummary && attendanceSummary.session_count > 0
                ? `${Math.round(
                    (attendanceSummary.present /
                      Math.max(
                        attendanceSummary.present + attendanceSummary.absent + attendanceSummary.late + attendanceSummary.excused,
                        1,
                      )) *
                      100,
                  )}%`
                : '-'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <IconTrendingUp className="stat-icon-svg" aria-hidden="true" />
          </div>
          <div>
            <div className="stat-label">평균 성적</div>
            <div className="stat-value">{courseGrade?.average_score ?? '-'}</div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <div className="quick-title">빠른 작업</div>
        <div className="quick-toolbar">
          <label className="quick-label">과정 선택</label>
          <select value={courseId ?? ''} onChange={(e) => setSelectedCourseId(Number(e.target.value) || null)} className="quick-select">
            <option value="">전체</option>
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="quick-grid">
          <button className="quick-card" onClick={() => go('students')}>
            <IconUserPlus className="quick-icon" aria-hidden="true" />
            <span>학생 등록</span>
          </button>
          <button className="quick-card" onClick={() => go('attendance')}>
            <IconCalendarCheck className="quick-icon" aria-hidden="true" />
            <span>출결 입력</span>
          </button>
          <button className="quick-card" onClick={() => go('grades')}>
            <IconFilePlus className="quick-icon" aria-hidden="true" />
            <span>평가/점수</span>
          </button>
          <button className="quick-card" onClick={() => go('courses')}>
            <IconBookOpen className="quick-icon" aria-hidden="true" />
            <span>과정 관리</span>
          </button>
          <button className="quick-card" onClick={() => go('assignments')}>
            <IconFiles className="quick-icon" aria-hidden="true" />
            <span>과제 목록</span>
          </button>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="header">
            <h3 style={{ margin: 0 }}>최근 등록 학생</h3>
          </div>
          {recentStudents.length === 0 ? (
            <small>학생 데이터가 없습니다.</small>
          ) : (
            <ul className="list">
              {recentStudents.map((s) => (
                <li key={s.id} className="list-item">
                  <div>
                    <div className="list-title">{s.full_name}</div>
                    <div className="list-sub">{s.email || '-'}</div>
                  </div>
                  <span className="badge">#{s.id}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="header">
            <h3 style={{ margin: 0 }}>최근 과정</h3>
          </div>
          {recentCourses.length === 0 ? (
            <small>과정 데이터가 없습니다.</small>
          ) : (
            <ul className="list">
              {recentCourses.map((c) => (
                <li key={c.id} className="list-item">
                  <div>
                    <div className="list-title">{c.name}</div>
                    <div className="list-sub">{c.teacher_name || '-'}</div>
                  </div>
                  <span className="badge">#{c.id}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentsSection({ notify }: { notify: (type: Toast['type'], message: string) => void }) {
  const { data: students, loading, error, setData } = useLoad<Student[]>(async () => (await api.get('/students')).data, []);
  const [form, setForm] = useState({ full_name: '', email: '', grade_level: '' });
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    setPage(1);
  }, [search, gradeFilter]);

  const addStudent = async () => {
    if (!form.full_name.trim()) return notify('error', '이름을 입력하세요.');
    try {
      const res = await api.post<Student>('/students', form);
      setData((prev) => (prev ? [res.data, ...prev] : [res.data]));
      setForm({ full_name: '', email: '', grade_level: '' });
      notify('success', '학생이 추가되었습니다.');
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      const msg =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d: any) => d?.msg || JSON.stringify(d)).join(', ')
            : detail?.msg || e?.message || '학생 추가 중 오류가 발생했습니다.';
      notify('error', msg);
    }
  };

  const filtered = (students || []).filter((s) => {
    const matchText = s.full_name.toLowerCase().includes(search.toLowerCase()) || (s.email || '').toLowerCase().includes(search.toLowerCase());
    const matchGrade = gradeFilter ? (s.grade_level || '').includes(gradeFilter) : true;
    return matchText && matchGrade;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const exportCSV = () => {
    const rows: string[][] = [['id', 'name', 'email', 'grade'], ...((students || []).map((s) => [String(s.id), s.full_name, s.email || '', s.grade_level || '']))];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="header">
        <h2 className="section-title">학생</h2>
        <button className="secondary" onClick={exportCSV}>
          CSV 다운로드
        </button>
      </div>

      <div className="form-row">
        <div>
          <label>검색 (이름/이메일)</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="예: 홍길동 또는 email" />
        </div>
        <div>
          <label>학년/반 필터</label>
          <input value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} placeholder="예: 2-B" />
        </div>
      </div>

      <div className="form-row">
        <div>
          <label>이름</label>
          <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="홍길동" />
        </div>
        <div>
          <label>이메일</label>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" />
        </div>
        <div>
          <label>학년/반</label>
          <input value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })} placeholder="2-B" />
        </div>
      </div>

      <button className="btn-slim" onClick={addStudent}>
        학생 추가
      </button>

      {loading && <p>불러오는 중...</p>}
      {error && <p className="error-text">{error}</p>}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>이름</th>
            <th>이메일</th>
            <th>학년/반</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.full_name}</td>
              <td>{s.email || '-'}</td>
              <td>{s.grade_level || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pager">
        <button className="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          이전
        </button>
        <span className="muted" style={{ fontSize: 12 }}>
          {page} / {totalPages}
        </span>
        <button className="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          다음
        </button>
      </div>
    </div>
  );
}

function CoursesSection({ notify }: { notify: (type: Toast['type'], message: string) => void }) {
  const { data: courses, loading, error, setData } = useLoad<Course[]>(async () => (await api.get('/courses')).data, []);
  const [form, setForm] = useState({ name: '', teacher_name: '' });

  const addCourse = async () => {
    if (!form.name.trim()) return notify('error', '과정명을 입력하세요.');
    try {
      const res = await api.post<Course>('/courses', form);
      setData((prev) => (prev ? [res.data, ...prev] : [res.data]));
      setForm({ name: '', teacher_name: '' });
      notify('success', '과정이 추가되었습니다.');
    } catch (e: any) {
      notify('error', e?.response?.data?.detail || '과정 추가 실패');
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">과정/강좌</h2>

      <div className="form-row">
        <div>
          <label>과정명</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="예: 수학 심화" />
        </div>
        <div>
          <label>담당 교사</label>
          <input value={form.teacher_name} onChange={(e) => setForm({ ...form, teacher_name: e.target.value })} placeholder="예: 김선생" />
        </div>
      </div>

      <button className="btn-slim" onClick={addCourse}>
        과정 추가
      </button>

      {loading && <p>불러오는 중...</p>}
      {error && <p className="error-text">{error}</p>}

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>과정명</th>
            <th>교사</th>
          </tr>
        </thead>
        <tbody>
          {(courses || []).map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.teacher_name || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AttendanceSection({ notify }: { notify: (type: Toast['type'], message: string) => void }) {
  const { data: courses } = useLoad<Course[]>(async () => (await api.get('/courses')).data, []);
  const { data: students } = useLoad<Student[]>(async () => (await api.get('/students')).data, []);

  const studentNameById = useMemo(() => {
    const map: Record<number, string> = {};
    (students || []).forEach((s) => {
      map[s.id] = s.full_name;
    });
    return map;
  }, [students]);

  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[] | null>(null);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [bulkStatus, setBulkStatus] = useState<(typeof attendanceOptions)[number]['value']>('present');

  const courseId = selectedCourse ?? courses?.[0]?.id ?? null;

  const getSessionId = (s: any) => s?.id ?? s?.session_id ?? null;
  const getSessionLabel = (s: any) => s?.session_date ?? s?.date ?? s?.created_at ?? String(getSessionId(s) ?? '');

  useEffect(() => {
    if (!courseId) return;
    api
      .get<Session[]>(`/courses/${courseId}/attendance/sessions`)
      .then((res) => setSessions(res.data))
      .catch(() => setSessions(null));
  }, [courseId]);

  useEffect(() => {
    if (!courseId || !selectedSession) return;
    api
      .get<AttendanceRecord[]>(`/courses/${courseId}/attendance/sessions/${selectedSession}/records`)
      .then((res) => setRecords(res.data))
      .catch(() => setRecords(null));
  }, [courseId, selectedSession]);

  const createSession = async () => {
    if (!courseId) return;
    const res = await api.post<Session>(`/courses/${courseId}/attendance/sessions`, {});
    setSessions((prev) => (prev ? [res.data, ...prev] : [res.data]));
    notify('success', '회차가 생성되었습니다.');
  };

  const updateRecord = async (student_id: number, status: AttendanceRecord['status']) => {
    if (!courseId || !selectedSession) return;
    await api.put(`/courses/${courseId}/attendance/sessions/${selectedSession}/records/${student_id}`, { status });
    setRecords((prev) => (prev ? prev.map((r) => (r.student_id === student_id ? { ...r, status } : r)) : prev));
  };

  const applyBulk = async () => {
    if (!records) return;
    for (const r of records) {
      await updateRecord(r.student_id, bulkStatus);
    }
    notify('success', '전체 상태가 적용되었습니다.');
  };

  return (
    <div className="card">
      <h2 className="section-title">출결</h2>

      <div className="form-row">
        <div>
          <label>과정 선택</label>
          <select value={courseId || ''} onChange={(e) => setSelectedCourse(Number(e.target.value) || null)}>
            {(courses || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>회차 선택</label>
          <select value={selectedSession || ''} onChange={(e) => setSelectedSession(Number(e.target.value) || null)}>
            <option value="">선택</option>
            {(sessions || []).map((s: any) => {
              const sid = getSessionId(s);
              return (
                <option key={String(sid)} value={sid}>
                  {getSessionLabel(s)}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="header">
        <button className="secondary" onClick={createSession}>
          회차 생성
        </button>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as any)} style={{ maxWidth: 140 }}>
            {attendanceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button onClick={applyBulk}>전체 적용</button>
        </div>
      </div>

      {!selectedSession && <p className="muted">회차를 선택하면 학생별 출결을 입력할 수 있습니다.</p>}

      {selectedSession && (
        <>
          <StatusLegend
            title="출결 상태"
            items={[
              { label: '출석', color: '#16c784' },
              { label: '지각', color: '#f59e0b' },
              { label: '결석', color: '#ef4444' },
              { label: '공결', color: '#8b5cf6' },
            ]}
          />

          <table className="table">
            <thead>
              <tr>
                <th>학생ID</th>
                <th>이름</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {(records || []).map((r: any) => {
                const name = r?.student_name ?? studentNameById[r.student_id] ?? '';
                return (
                  <tr key={r.student_id}>
                    <td>{r.student_id}</td>
                    <td>{name}</td>
                    <td>
                      <select value={r.status} onChange={(e) => updateRecord(r.student_id, e.target.value as any)}>
                        {attendanceOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function AssignmentsSection({ notify }: { notify: (type: Toast['type'], message: string) => void }) {
  const { data: courses } = useLoad<Course[]>(async () => (await api.get('/courses')).data, []);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [assessments, setAssessments] = useState<Assessment[] | null>(null);
  const courseId = selectedCourse ?? courses?.[0]?.id ?? null;

  useEffect(() => {
    if (!courseId) return;
    api
      .get<Assessment[]>(`/courses/${courseId}/assessments`)
      .then((res) => setAssessments(res.data))
      .catch(() => setAssessments(null));
  }, [courseId]);

  return (
    <div className="card">
      <h2 className="section-title">과제/평가</h2>

      <div className="form-row">
        <div>
          <label>과정 선택</label>
          <select value={courseId || ''} onChange={(e) => setSelectedCourse(Number(e.target.value) || null)}>
            {(courses || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="muted">평가는 성적 탭에서 생성 및 점수 입력을 진행합니다. 여기서는 목록 확인 중심입니다.</p>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>평가명</th>
            <th>가중치</th>
          </tr>
        </thead>
        <tbody>
          {(assessments || []).map((a) => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.name}</td>
              <td>{a.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GradesSection({ notify }: { notify: (type: Toast['type'], message: string) => void }) {
  const { data: courses } = useLoad<Course[]>(async () => (await api.get('/courses')).data, []);
  const { data: students } = useLoad<Student[]>(async () => (await api.get('/students')).data, []);

  const studentNameById = useMemo(() => {
    const map: Record<number, string> = {};
    (students || []).forEach((s) => {
      map[s.id] = s.full_name;
    });
    return map;
  }, [students]);

  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [assessments, setAssessments] = useState<Assessment[] | null>(null);
  const [scores, setScores] = useState<Score[] | null>(null);
  const [assessmentForm, setAssessmentForm] = useState({ name: '', weight: 1 });
  const [scoreForm, setScoreForm] = useState<Record<number, number>>({});
  const [studentGrade, setStudentGrade] = useState<GradeSummary[] | null>(null);
  const [courseGrade, setCourseGrade] = useState<CourseGradeSummary | null>(null);

  const exportCourseGrade = () => {
    if (!courseGrade) return notify('error', '강좌 성적 요약이 없습니다.');
    const header = ['course_id', 'course_name', 'average_score'];
    const body = [courseGrade.course_id, courseGrade.course_name, courseGrade.average_score ?? ''];
    const csv = [header.join(','), body.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course_grade_summary.csv';
    a.click();
    URL.revokeObjectURL(url);
    notify('success', '강좌 성적 요약 CSV를 다운로드했습니다.');
  };

  const exportStudentGrades = () => {
    if (!studentGrade) return notify('error', '학생 성적 데이터가 없습니다.');
    const rows: string[][] = [['course_id', 'course_name', 'weighted_score'], ...studentGrade.map((g) => [String(g.course_id), g.course_name, String(g.weighted_score)])];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_grades.csv';
    a.click();
    URL.revokeObjectURL(url);
    notify('success', '학생 성적 CSV를 다운로드했습니다.');
  };

  const courseId = selectedCourse ?? courses?.[0]?.id ?? null;
  const studentId = selectedStudent ?? students?.[0]?.id ?? null;

  useEffect(() => {
    if (!courseId) return;
    api
      .get<Assessment[]>(`/courses/${courseId}/assessments`)
      .then((res) => setAssessments(res.data))
      .catch(() => setAssessments(null));
    api
      .get<CourseGradeSummary>(`/courses/${courseId}/grades/summary`)
      .then((res) => setCourseGrade(res.data))
      .catch(() => setCourseGrade(null));
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;
    api
      .get<Score[]>(`/courses/${courseId}/scores`)
      .then((res) => setScores(res.data))
      .catch(() => setScores(null));
  }, [courseId]);

  useEffect(() => {
    if (!courseId || !studentId) return;
    api
      .get<GradeSummary[]>(`/courses/${courseId}/students/${studentId}/grades/summary`)
      .then((res) => setStudentGrade(res.data))
      .catch(() => setStudentGrade(null));
  }, [courseId, studentId]);

  const addAssessment = async () => {
    if (!courseId) return;
    const res = await api.post<Assessment>(`/courses/${courseId}/assessments`, assessmentForm);
    setAssessments((prev) => (prev ? [res.data, ...prev] : [res.data]));
    notify('success', '평가가 추가되었습니다.');
  };

  const saveScores = async (assessmentId: number) => {
    const payload = Object.entries(scoreForm).map(([studentIdKey, raw_score]) => ({
      student_id: Number(studentIdKey),
      raw_score,
    }));
    await api.post(`/assessments/${assessmentId}/scores/bulk`, payload);
    notify('success', '점수 저장 완료');
  };

  const viewScores = (assessmentId: number) => {
    const list: any[] = (scores || []).filter((s: any) => s.assessment_id === assessmentId);
    if (list.length === 0) return notify('error', '점수 데이터가 없습니다.');

    const rows: string[][] = [
      ['student_id', 'student_name', 'raw_score'],
      ...list.map((s: any) => [String(s.student_id), s.student_name ?? studentNameById[s.student_id] ?? '', String(s.raw_score)]),
    ];

    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scores_${assessmentId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify('success', '평가 점수 CSV를 다운로드했습니다.');
  };

  return (
    <div className="card">
      <h2 className="section-title">성적</h2>

      <div className="form-row">
        <div>
          <label>과정 선택</label>
          <select value={courseId || ''} onChange={(e) => setSelectedCourse(Number(e.target.value) || null)}>
            {(courses || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>학생 선택</label>
          <select value={studentId || ''} onChange={(e) => setSelectedStudent(Number(e.target.value) || null)}>
            {(students || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          <button className="btn-compact secondary" style={{ minWidth: 120 }} onClick={exportCourseGrade} disabled={!courseGrade}>
            강좌 요약 CSV
          </button>
          <button className="btn-compact primary" style={{ minWidth: 120 }} onClick={exportStudentGrades} disabled={!studentGrade}>
            학생 성적 CSV
          </button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card" style={{ margin: 0 }}>
          <div className="header">
            <h3 style={{ margin: 0 }}>평가 생성</h3>
          </div>
          <div className="form-row">
            <div>
              <label>평가명</label>
              <input value={assessmentForm.name} onChange={(e) => setAssessmentForm({ ...assessmentForm, name: e.target.value })} />
            </div>
            <div>
              <label>가중치</label>
              <input type="number" value={assessmentForm.weight} onChange={(e) => setAssessmentForm({ ...assessmentForm, weight: Number(e.target.value) })} />
            </div>
          </div>
          <button className="btn-slim" onClick={addAssessment} disabled={!courseId}>
            평가 추가
          </button>
        </div>

        <div className="card" style={{ margin: 0 }}>
          <div className="header">
            <h3 style={{ margin: 0 }}>학생 성적 요약</h3>
          </div>
          {!studentGrade || studentGrade.length === 0 ? (
            <small>데이터가 없습니다.</small>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>과정ID</th>
                  <th>과정명</th>
                  <th>가중 점수</th>
                </tr>
              </thead>
              <tbody>
                {studentGrade.map((g) => (
                  <tr key={g.course_id}>
                    <td>{g.course_id}</td>
                    <td>{g.course_name}</td>
                    <td>{g.weighted_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="header">
          <h3 style={{ margin: 0 }}>평가 목록</h3>
        </div>
        {!assessments || assessments.length === 0 ? (
          <small>평가가 없습니다.</small>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>이름</th>
                <th>가중치</th>
                <th>점수 입력</th>
                <th>CSV</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.name}</td>
                  <td>{a.weight}</td>
                  <td style={{ minWidth: 260 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {(students || []).slice(0, 4).map((s) => (
                        <input
                          key={s.id}
                          type="number"
                          placeholder={`${s.full_name} 점수`}
                          value={scoreForm[s.id] ?? ''}
                          onChange={(e) => setScoreForm((prev) => ({ ...prev, [s.id]: Number(e.target.value) }))}
                          style={{ maxWidth: 120 }}
                        />
                      ))}
                      <button className="secondary" onClick={() => saveScores(a.id)}>
                        저장
                      </button>
                    </div>
                  </td>
                  <td>
                    <button className="secondary" onClick={() => viewScores(a.id)}>
                      점수 CSV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ToastView({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [role, setRole] = useState<Role>('admin');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = (type: Toast['type'], message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2400);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthed(false);
  };

  const go = (t: Tab) => setTab(t);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthed(!!token);
  }, []);

  if (!authed) return <LoginCard onSuccess={() => setAuthed(true)} />;

  return (
    <div className="app-shell">
      <HeaderBar tab={tab} setTab={setTab} role={role} onRoleChange={setRole} onLogout={logout} />
      <main className="main">
        {tab === 'dashboard' && <DashboardSection go={go} />}
        {tab === 'students' && <StudentsSection notify={notify} />}
        {tab === 'courses' && <CoursesSection notify={notify} />}
        {tab === 'attendance' && <AttendanceSection notify={notify} />}
        {tab === 'grades' && <GradesSection notify={notify} />}
        {tab === 'assignments' && <AssignmentsSection notify={notify} />}
      </main>
      <ToastView toasts={toasts} />
    </div>
  );
}
