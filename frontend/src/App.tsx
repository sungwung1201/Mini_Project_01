import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FilePlus2,
  Files,
  GraduationCap,
  LayoutDashboard,
  Percent,
  TrendingUp,
  UserRoundPlus,
  Users,
} from 'lucide-react';
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


const attendanceOptions = [
  { value: 'present', label: '출석' },
  { value: 'late', label: '지각' },
  { value: 'absent', label: '결석' },
  { value: 'excused', label: '공결' },
] as const;

type Tab = 'dashboard' | 'students' | 'courses' | 'attendance' | 'grades' | 'assignments';
type Role = 'admin' | 'teacher';
type Toast = { id: number; type: 'success' | 'error'; message: string };
type NavItem = { key: Tab; label: string; icon: LucideIcon; roles: Role[] | 'all' };


type LoadState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: '대시보드', icon: LayoutDashboard, roles: 'all' },
  { key: 'students', label: '학생 관리', icon: GraduationCap, roles: ['admin'] },
  { key: 'courses', label: '과정 관리', icon: BookOpen, roles: ['admin'] },
  { key: 'attendance', label: '출결 관리', icon: CalendarCheck, roles: 'all' },
  { key: 'grades', label: '성적 관리', icon: BarChart3, roles: 'all' },
  { key: 'assignments', label: '과제 관리', icon: ClipboardList, roles: 'all' },
];


const STEP_FLOW: { key: Tab; label: string }[] = [
  { key: 'dashboard', label: '요약' },
  { key: 'students', label: '학생' },
  { key: 'courses', label: '과정' },
  { key: 'attendance', label: '출결' },
  { key: 'grades', label: '성적' },
  { key: 'assignments', label: '과제' },
];

function visibleNavItems(role: Role) {
  return NAV_ITEMS.filter((i) => i.roles === 'all' || i.roles.includes(role));
}

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

  return { ...state, setData: (fn: (prev: T | null) => T | null) => setState((prev) => ({ ...prev, data: fn(prev.data) })) };
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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
          />
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

function Sidebar({
  tab,
  setTab,
  onLogout,
  role,
  onRoleChange,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  onLogout: () => void;
  role: Role;
  onRoleChange: (r: Role) => void;
}) {
  const items = visibleNavItems(role);

  return (
    <aside className="sidebar">
      <div className="brand">Grade Management</div>
      <nav className="nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className={`nav-item ${tab === item.key ? 'active' : ''}`}
              onClick={() => setTab(item.key)}
            >
              <Icon className="nav-icon" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}

      </nav>
      <div className="sidebar-footer">
        <div className="user">
          <div className="avatar">S</div>
          <div>
            <div className="user-name">System Admin</div>
            <div className="user-role">{role}</div>
          </div>
        </div>
        <div>
          <label style={{ color: '#94a3b8', fontSize: 12 }}>역할</label>
          <select value={role} onChange={(e) => onRoleChange(e.target.value as Role)}>
            <option value="admin">admin</option>
            <option value="teacher">teacher</option>
          </select>
        </div>
        <button className="secondary" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </aside>
  );
}

function HeaderBar({ tab }: { tab: Tab }) {
  return (
    <div className="header-bar">
      <div>
        <div className="header-eyebrow">Admin Dashboard</div>
        <div className="header-title">출결·성적 관리 · {tab.toUpperCase()}</div>
      </div>
      <div className="header-actions">
        <input className="header-search" placeholder="검색 (학생/강좌/과목)" />
        <button className="secondary">공지 작성</button>
        <button>새 작업</button>
      </div>
    </div>
  );
}

function Topbar({ tab, setTab, role }: { tab: Tab; setTab: (t: Tab) => void; role: Role }) {
  const items = visibleNavItems(role);
  const stepIndex = STEP_FLOW.findIndex((s) => s.key === tab);

  return (
    <div className="topbar">
      <div className="topbar-main">
        <div className="topbar-title">네비게이션</div>
        <div className="topbar-chips">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`chip ${tab === item.key ? 'chip-active' : ''}`}
                onClick={() => setTab(item.key)}
              >
                <Icon className="chip-icon" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}

        </div>
      </div>
      <div className="topbar-actions">
        <label className="muted" style={{ fontSize: 12 }}>
          빠른 이동
        </label>
        <select value={tab} onChange={(e) => setTab(e.target.value as Tab)}>
          {items.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="stepper">
        {STEP_FLOW.map((s, idx) => {
          const active = idx === stepIndex;
          const done = stepIndex > idx;
          return (
            <div key={s.key} className="step">
              <div className={`step-dot ${active ? 'active' : ''} ${done ? 'done' : ''}`}>{idx + 1}</div>
              <div className="step-label">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusLegend({
  items,
  title = '상태 레전드',
}: {
  items: { label: string; color: string }[];
  title?: string;
}) {
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
          <p className="eyebrow">안녕하세요, System Admin님!</p>
          <h1>오늘의 학사 현황을 확인하세요.</h1>
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
          <div className="stat-icon purple"><Users className="stat-icon-svg" aria-hidden="true" /></div>
          <div>
            <div className="stat-label">총 학생 수</div>
            <div className="stat-value">{totalStudents}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal"><BookOpen className="stat-icon-svg" aria-hidden="true" /></div>
          <div>
            <div className="stat-label">진행 중인 과정</div>
            <div className="stat-value">{totalCourses}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Percent className="stat-icon-svg" aria-hidden="true" /></div>
          <div>
            <div className="stat-label">출석률</div>
            <div className="stat-value">
              {attendanceSummary && attendanceSummary.session_count > 0
                ? `${Math.round(
                    (attendanceSummary.present /
                      Math.max(attendanceSummary.present + attendanceSummary.absent + attendanceSummary.late + attendanceSummary.excused, 1)) *
                      100,
                  )}%`
                : '-'}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><TrendingUp className="stat-icon-svg" aria-hidden="true" /></div>
          <div>
            <div className="stat-label">평균 성적</div>
            <div className="stat-value">{courseGrade?.average_score ?? '-'}</div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <div className="quick-title">빠른 작업</div>
        <div style={{ marginBottom: 8, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ color: '#94a3b8', fontWeight: 600 }}>과정 선택</label>
          <select
            value={courseId ?? ''}
            onChange={(e) => setSelectedCourseId(Number(e.target.value) || null)}
            style={{ maxWidth: 260 }}
          >
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
            <UserRoundPlus className="quick-icon" aria-hidden="true" />
            <span>학생 등록</span>
          </button>
          <button className="quick-card" onClick={() => go('attendance')}>
            <CalendarCheck className="quick-icon" aria-hidden="true" />
            <span>오늘 출결 입력</span>
          </button>
          <button className="quick-card" onClick={() => go('grades')}>
            <FilePlus2 className="quick-icon" aria-hidden="true" />
            <span>새 평가 생성</span>
          </button>
          <button className="quick-card" onClick={() => go('courses')}>
            <BookOpen className="quick-icon" aria-hidden="true" />
            <span>과정/강좌 관리</span>
          </button>
          <button className="quick-card" onClick={() => go('assignments')}>
            <Files className="quick-icon" aria-hidden="true" />
            <span>과제 관리</span>
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

      <div className="card">
        <div className="header">
          <h3 style={{ margin: 0 }}>최근 알림</h3>
          <span className="badge">베타</span>
        </div>
        <ul className="list">
          <li className="list-item">
            <div>
              <div className="list-title">지각/결석 알림</div>
              <div className="list-sub">추후 출석 기록에서 자동 생성 예정</div>
            </div>
          </li>
          <li className="list-item">
            <div>
              <div className="list-title">성적 입력 알림</div>
              <div className="list-sub">평가 점수 입력 시 표시 예정</div>
            </div>
          </li>
        </ul>
      </div>

    </div>
  );
}

function StudentSection({ notify }: { notify: (type: Toast['type'], msg: string) => void }) {
  const { data: students, loading, error, setData } = useLoad<Student[]>(async () => {
    const res = await api.get<Student[]>('/students');
    return res.data;
  }, []);
  const [form, setForm] = useState({ full_name: '', email: '', grade_level: '' });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentForm, setEditStudentForm] = useState({ full_name: '', email: '', grade_level: '' });
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const addStudent = async () => {
    if (!form.full_name.trim()) {
      notify('error', '이름은 필수입니다.');
      return;
    }
    try {
      const payload: Partial<Student> & { full_name: string } = {
        full_name: form.full_name.trim(),
      };
      if (form.email.trim()) payload.email = form.email.trim();
      if (form.grade_level.trim()) payload.grade_level = form.grade_level.trim();

      const res = await api.post<Student>('/students', payload);
      setForm({ full_name: '', email: '', grade_level: '' });
      setData((prev) => (prev ? [res.data, ...prev] : [res.data]));
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
    const matchText =
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(search.toLowerCase());
    const matchGrade = gradeFilter ? (s.grade_level || '').includes(gradeFilter) : true;
    return matchText && matchGrade;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const exportCSV = () => {
    const rows: string[][] = [
      ['id', 'name', 'email', 'grade'],
      ...(students ?? []).map((s) => [
        String(s.id),
        s.full_name,
        s.email ?? '',
        s.grade_level ?? '',
      ]),
    ];

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
          <input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="홍길동"
          />
        </div>
        <div>
          <label>이메일</label>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="user@example.com"
          />
        </div>
        <div>
          <label>학년/반</label>
          <input
            value={form.grade_level}
            onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
            placeholder="2-B"
          />
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
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.full_name}</td>
              <td>{s.email}</td>
              <td>{s.grade_level}</td>
              <td>
                {editingStudent?.id === s.id ? (
                  <div className="action-row">
                    <button
                      className="btn-compact"
                      onClick={async () => {
                        const payload = {
                          full_name: editStudentForm.full_name || s.full_name,
                          email: editStudentForm.email || null,
                          grade_level: editStudentForm.grade_level || null,
                        };
                        await api.put(`/students/${s.id}`, payload);
                        setData((prev) =>
                          prev ? prev.map((st) => (st.id === s.id ? { ...st, ...payload } as Student : st)) : prev
                        );
                        setEditingStudent(null);
                      }}
                    >
                      저장
                    </button>
                    <button className="secondary btn-compact" onClick={() => setEditingStudent(null)}>
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="action-row">
                    <button
                      className="btn-compact"
                      onClick={() => {
                        setEditingStudent(s);
                        setEditStudentForm({
                          full_name: s.full_name,
                          email: s.email || '',
                          grade_level: s.grade_level || '',
                        });
                      }}
                    >
                      수정
                    </button>
                    <button
                      className="secondary btn-compact"
                      onClick={async () => {
                        if (confirm('이 학생을 삭제할까요?')) {
                          await api.delete(`/students/${s.id}`);
                          setData((prev) => (prev ? prev.filter((st) => st.id !== s.id) : prev));
                        }
                      }}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button className="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          이전
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button
          className="secondary"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          다음
        </button>
      </div>
    </div>
  );
}

function CourseSection({ notify }: { notify: (type: Toast['type'], msg: string) => void }) {
  const { data: courses, loading, error, setData } = useLoad<Course[]>(async () => {
    const res = await api.get<Course[]>('/courses');
    return res.data;
  }, []);
  const { data: students } = useLoad<Student[]>(async () => (await api.get('/students')).data, []);
  const [form, setForm] = useState({ name: '', subject: '', class_name: '', teacher_name: '' });
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [enrollStudentId, setEnrollStudentId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [page, setPage] = useState(1);

  const addCourse = async () => {
    const res = await api.post<Course>('/courses', form);
    setForm({ name: '', subject: '', class_name: '', teacher_name: '' });
    setData((prev) => (prev ? [res.data, ...prev] : [res.data]));
    notify('success', '강좌가 추가되었습니다.');
  };

  const enroll = async () => {
    if (!selectedCourse || !enrollStudentId) return;
    await api.post(`/courses/${selectedCourse}/enrollments`, { student_id: enrollStudentId });
    notify('success', '수강 등록 완료');
  };

  return (
    <div className="card">
      <h2 className="section-title">강좌</h2>
      <div className="form-row">
        <div>
          <label>강좌명</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label>과목</label>
          <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        </div>
        <div>
          <label>학급</label>
          <input value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })} />
        </div>
        <div>
          <label>담임/교사</label>
          <input value={form.teacher_name} onChange={(e) => setForm({ ...form, teacher_name: e.target.value })} />
        </div>
      </div>
      <button className="btn-slim" onClick={addCourse}>
        강좌 추가
      </button>
      <div className="form-row" style={{ marginTop: 12 }}>
        <div>
          <label>검색 (강좌/과목/교사)</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="예: Math, 영어, Lee" />
        </div>
        <div>
          <label>과목 필터</label>
          <input value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} placeholder="예: Math" />
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <strong>수강 등록</strong>
        <select value={selectedCourse ?? ''} onChange={(e) => setSelectedCourse(Number(e.target.value))}>
          <option value="">강좌 선택</option>
          {courses?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={enrollStudentId ?? ''} onChange={(e) => setEnrollStudentId(Number(e.target.value))}>
          <option value="">학생 선택</option>
          {students?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}
            </option>
          ))}
        </select>
        <button className="secondary" onClick={enroll}>
          수강 등록
        </button>
      </div>
      {loading && <p>불러오는 중...</p>}
      {error && <p className="error-text">{error}</p>}
      <CourseTable
        courses={courses || []}
        search={search}
        subjectFilter={subjectFilter}
        page={page}
        setPage={setPage}
        setData={setData}
        notify={notify}
      />
    </div>
  );
}

function CourseTable({
  courses,
  search,
  subjectFilter,
  page,
  setPage,
  setData,
  notify,
}: {
  courses: Course[];
  search: string;
  subjectFilter: string;
  page: number;
  setPage: (p: number) => void;
  setData: (fn: (prev: Course[] | null) => Course[] | null) => void;
  notify: (type: Toast['type'], msg: string) => void;
}) {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editCourseForm, setEditCourseForm] = useState({
    name: '',
    subject: '',
    class_name: '',
    teacher_name: '',
  });
  const pageSize = 5;
  const filtered = courses.filter((c) => {
    const text = [c.name, c.subject, c.teacher_name].join(' ').toLowerCase();
    const matchText = text.includes(search.toLowerCase());
    const matchSubject = subjectFilter ? (c.subject || '').toLowerCase().includes(subjectFilter.toLowerCase()) : true;
    return matchText && matchSubject;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>강좌명</th>
            <th>과목</th>
            <th>학급</th>
            <th>교사</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>
                {editingCourse?.id === c.id ? (
                  <input
                    value={editCourseForm.name}
                    onChange={(e) => setEditCourseForm((f) => ({ ...f, name: e.target.value }))}
                  />
                ) : (
                  c.name
                )}
              </td>
              <td>
                {editingCourse?.id === c.id ? (
                  <input
                    value={editCourseForm.subject}
                    onChange={(e) => setEditCourseForm((f) => ({ ...f, subject: e.target.value }))}
                  />
                ) : (
                  c.subject
                )}
              </td>
              <td>
                {editingCourse?.id === c.id ? (
                  <input
                    value={editCourseForm.class_name}
                    onChange={(e) => setEditCourseForm((f) => ({ ...f, class_name: e.target.value }))}
                  />
                ) : (
                  c.class_name
                )}
              </td>
              <td>
                {editingCourse?.id === c.id ? (
                  <input
                    value={editCourseForm.teacher_name}
                    onChange={(e) => setEditCourseForm((f) => ({ ...f, teacher_name: e.target.value }))}
                  />
                ) : (
                  c.teacher_name
                )}
              </td>
              <td>
                {editingCourse?.id === c.id ? (
                  <div className="action-row">
                    <button
                      className="btn-compact"
                      onClick={async () => {
                        const payload = {
                          name: editCourseForm.name || c.name,
                          subject: editCourseForm.subject || null,
                          class_name: editCourseForm.class_name || null,
                          teacher_name: editCourseForm.teacher_name || null,
                        };
                        await api.put(`/courses/${c.id}`, payload);
                        setData((prev) =>
                          prev
                            ? prev.map((item) => (item.id === c.id ? { ...item, ...payload } as Course : item))
                            : prev
                        );
                        setEditingCourse(null);
                        notify('success', '강좌가 수정되었습니다.');
                      }}
                    >
                      저장
                    </button>
                    <button className="secondary btn-compact" onClick={() => setEditingCourse(null)}>
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="action-row">
                    <button
                      className="btn-compact"
                      onClick={() => {
                        setEditingCourse(c);
                        setEditCourseForm({
                          name: c.name,
                          subject: c.subject || '',
                          class_name: c.class_name || '',
                          teacher_name: c.teacher_name || '',
                        });
                      }}
                    >
                      수정
                    </button>
                    <button
                      className="secondary btn-compact"
                      onClick={async () => {
                        if (confirm('이 강좌를 삭제할까요?')) {
                          await api.delete(`/courses/${c.id}`);
                          setData((prev) => (prev ? prev.filter((item) => item.id !== c.id) : prev));
                          notify('success', '강좌가 삭제되었습니다.');
                        }
                      }}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button className="secondary" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
          이전
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button className="secondary" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
          다음
        </button>
      </div>
    </>
  );
}

function AttendanceSection({ notify }: { notify: (type: Toast['type'], msg: string) => void }) {
  const { data: courses } = useLoad<Course[]>(async () => (await api.get('/courses')).data, []);
  const [courseId, setCourseId] = useState<number | null>(null);
  const { data: sessions, setData: setSessions } = useLoad<Session[] | null>(
    async () => (courseId ? (await api.get(`/courses/${courseId}/sessions`)).data : []),
    [courseId]
  );
  const { data: students } = useLoad<Student[]>(async () => (await api.get('/students')).data, []);

  const [sessionForm, setSessionForm] = useState({ session_date: '', topic: '' });
  const [attendanceForm, setAttendanceForm] = useState<Record<string, AttendanceRecord['status']>>({});
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const exportAttendance = () => {
    if (!summary) return notify('error', '요약이 없습니다.');
    const rows = [
      ['course_id', 'session_count', 'present', 'late', 'absent', 'excused'],
      [summary.course_id, summary.session_count, summary.present, summary.late, summary.absent, summary.excused],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_summary.csv';
    a.click();
    URL.revokeObjectURL(url);
    notify('success', '출결 요약 CSV를 다운로드했습니다.');
  };

  const createSession = async () => {
    if (!courseId) return;
    const res = await api.post<Session>(`/courses/${courseId}/sessions`, sessionForm);
    setSessionForm({ session_date: '', topic: '' });
    setSessions((prev) => (prev ? [res.data, ...prev] : [res.data]));
  };

  const saveAttendance = async () => {
    if (!selectedSessionId) return;
    const payload = Object.entries(attendanceForm).map(([studentId, status]) => ({
      student_id: Number(studentId),
      status,
    }));
    await api.post(`/sessions/${selectedSessionId}/attendance/bulk`, payload);
    notify('success', '출결 저장 완료');
  };

  const loadSummary = async () => {
    if (!courseId) return;
    const res = await api.get<AttendanceSummary>(`/courses/${courseId}/attendance/summary`);
    setSummary(res.data);
  };

  return (
    <div className="card">
      <h2 className="section-title">출결</h2>
      <StatusLegend
        items={[
          { label: '출석', color: '#16c784' },
          { label: '지각', color: '#fbbf24' },
          { label: '결석', color: '#ef4444' },
          { label: '공결', color: '#38bdf8' },
        ]}
      />

      <div className="section-grid two">
        <div className="panel">
          <div className="panel-title">회차 생성</div>
          <div className="form-row tight">
            <div>
              <label>강좌 선택</label>
              <select value={courseId ?? ''} onChange={(e) => setCourseId(Number(e.target.value))}>
                <option value="">선택</option>
                {courses?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>회차 날짜</label>
              <input
                type="date"
                value={sessionForm.session_date}
                onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })}
              />
            </div>
            <div>
              <label>주제/메모</label>
              <input
                value={sessionForm.topic}
                onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
                placeholder="예: 3단원"
              />
            </div>
            <div className="action-cell">
              <button className="btn-slim" style={{ minWidth: 120 }} onClick={createSession}>
                회차 추가
              </button>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">회차 선택 & 요약</div>
          <div className="form-row tight">
            <div>
              <label>회차 선택</label>
              <select
                value={selectedSessionId ?? ''}
                onChange={(e) => setSelectedSessionId(Number(e.target.value))}
              >
                <option value="">선택</option>
                {sessions?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.session_date} {s.topic ? `(${s.topic})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="action-cell">
              <button className="secondary btn-slim" style={{ minWidth: 140 }} onClick={loadSummary}>
                출결 요약 보기
              </button>
            </div>
            <div className="action-cell">
              <button className="secondary btn-slim" onClick={exportAttendance}>
                요약 CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedSessionId && (
        <div className="grid">
          {students?.map((stu) => (
            <div className="card" key={stu.id}>
              <div className="header">
                <div>
                  <strong>{stu.full_name}</strong>
                  <div style={{ color: '#64748b', fontSize: 12 }}>#{stu.id}</div>
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label>출결</label>
                  <select
                    value={attendanceForm[String(stu.id)] ?? ''}
                    onChange={(e) =>
                      setAttendanceForm({
                        ...attendanceForm,
                        [String(stu.id)]: e.target.value as AttendanceRecord['status'],
                      })
                    }
                  >
                    <option value="">선택</option>
                    {attendanceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSessionId && (
        <div style={{ marginTop: 12 }}>
          <button className="btn-slim" onClick={saveAttendance}>
            출결 저장
          </button>
        </div>
      )}

      {summary && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-title">출결 요약</div>
          <div className="mini-grid">
            <div className="mini-card">세션 수: {summary.session_count}</div>
            <div className="mini-card">출석: {summary.present}</div>
            <div className="mini-card">지각: {summary.late}</div>
            <div className="mini-card">결석: {summary.absent}</div>
            <div className="mini-card">공결: {summary.excused}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function GradeSection({ notify }: { notify: (type: Toast['type'], msg: string) => void }) {
  const { data: students } = useLoad<Student[]>(async () => (await api.get('/students')).data, []);
  const { data: courses } = useLoad<Course[]>(async () => (await api.get('/courses')).data, []);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const { data: assessments, setData: setAssessments } = useLoad<Assessment[] | null>(
    async () => (selectedCourse ? (await api.get(`/courses/${selectedCourse}/assessments`)).data : []),
    [selectedCourse]
  );
  const [assessmentForm, setAssessmentForm] = useState({ name: '', weight: 0.1, max_score: 100 });
  const [scoreForm, setScoreForm] = useState<Record<string, number>>({});
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

    const rows: string[][] = [
      ['course_id', 'course_name', 'weighted_score'],
      ...studentGrade.map((g) => [String(g.course_id), g.course_name, String(g.weighted_score)]),
    ];

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

  const addAssessment = async () => {
    if (!selectedCourse) return;
    const res = await api.post<Assessment>(`/courses/${selectedCourse}/assessments`, assessmentForm);
    setAssessments((prev) => (prev ? [res.data, ...prev] : [res.data]));
    notify('success', '평가가 추가되었습니다.');
  };

  const saveScores = async (assessmentId: number) => {
    const payload = Object.entries(scoreForm).map(([studentId, raw_score]) => ({
      student_id: Number(studentId),
      raw_score,
    }));
    await api.post(`/assessments/${assessmentId}/scores/bulk`, payload);
    notify('success', '점수 저장 완료');
  };

  const loadStudentGrade = async () => {
    if (!selectedStudent) return;
    const res = await api.get<GradeSummary[]>(`/students/${selectedStudent}/grades`);
    setStudentGrade(res.data);
  };

  const loadCourseGrade = async () => {
    if (!selectedCourse) return;
    const res = await api.get<CourseGradeSummary>(`/courses/${selectedCourse}/grades/summary`);
    setCourseGrade(res.data);
  };

  const enrolledStudents = useMemo(() => students || [], [students]);

  return (
    <div className="card">
      <h2 className="section-title">성적</h2>
      <StatusLegend
        title="평가/등급 레전드"
        items={[
          { label: 'A 90~', color: '#10b981' },
          { label: 'B 80~', color: '#22c55e' },
          { label: 'C 70~', color: '#f59e0b' },
          { label: 'D/F <70', color: '#ef4444' },
        ]}
      />
      <div className="form-row tight">
        <div>
          <label>강좌 선택</label>
          <select value={selectedCourse ?? ''} onChange={(e) => setSelectedCourse(Number(e.target.value))}>
            <option value="">선택</option>
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>평가명</label>
          <input value={assessmentForm.name} onChange={(e) => setAssessmentForm({ ...assessmentForm, name: e.target.value })} />
        </div>
        <div>
          <label>가중치</label>
          <input
            type="number"
            step="0.05"
            value={assessmentForm.weight}
            onChange={(e) => setAssessmentForm({ ...assessmentForm, weight: Number(e.target.value) })}
          />
        </div>
        <div>
          <label>만점</label>
          <input
            type="number"
            value={assessmentForm.max_score}
            onChange={(e) => setAssessmentForm({ ...assessmentForm, max_score: Number(e.target.value) })}
          />
        </div>
        <div className="action-cell">
          <button className="btn-compact" style={{ minWidth: 110 }} onClick={addAssessment}>
            평가 추가
          </button>
        </div>
      </div>

      {assessments && assessments.length > 0 && (
        <div>
          <h3>평가별 점수 입력</h3>
          {assessments.map((ass) => (
            <div key={ass.id} className="card" style={{ marginBottom: 12 }}>
              <div className="header">
                <div>
                  <strong>{ass.name}</strong>
                  <div style={{ color: '#64748b', fontSize: 12 }}>
                    weight {ass.weight}, max {ass.max_score}
                  </div>
                </div>
                <button className="secondary btn-slim" onClick={() => saveScores(ass.id)}>
                  점수 저장
                </button>
              </div>
              <div className="grid">
                {enrolledStudents.map((stu) => (
                  <div key={stu.id}>
                    <label>{stu.full_name}</label>
                    <input
                      type="number"
                      placeholder="점수"
                      onChange={(e) => setScoreForm({ ...scoreForm, [stu.id]: Number(e.target.value) })}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="form-row tight" style={{ marginTop: 12 }}>
        <div>
          <label>학생 성적 조회</label>
          <select value={selectedStudent ?? ''} onChange={(e) => setSelectedStudent(Number(e.target.value))}>
            <option value="">학생 선택</option>
            {students?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="action-row" style={{ marginTop: 8 }}>
        <button className="btn-compact primary" style={{ minWidth: 110 }} onClick={loadStudentGrade}>
          학생 성적 보기
        </button>
        <button className="btn-compact primary" style={{ minWidth: 130 }} onClick={loadCourseGrade}>
          강좌 성적 요약 보기
        </button>
        <button className="btn-compact primary" style={{ minWidth: 120 }} onClick={exportCourseGrade} disabled={!courseGrade}>
          강좌 성적 CSV
        </button>
        <button className="btn-compact primary" style={{ minWidth: 120 }} onClick={exportStudentGrades} disabled={!studentGrade}>
          학생 성적 CSV
        </button>
      </div>

      {studentGrade && (
        <div style={{ marginTop: 12 }}>
          <h3>학생별 성적 요약</h3>
          {studentGrade.map((g) => (
            <div key={g.course_id} className="card" style={{ marginBottom: 10 }}>
              <div className="header">
                <div>
                  <strong>{g.course_name}</strong>
                </div>
                <span className="badge">가중합 {g.weighted_score}</span>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>평가</th>
                    <th>점수</th>
                  </tr>
                </thead>
                <tbody>
                  {g.details.map((d: Score) => (
                    <tr key={d.id}>
                      <td>{d.assessment_id}</td>
                      <td>{d.raw_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {courseGrade && (
        <div style={{ marginTop: 12 }}>
          <h3>강좌 성적 요약</h3>
          <div className="card">
            <div className="header">
              <strong>{courseGrade.course_name}</strong>
              <span className="badge">평균 {courseGrade.average_score ?? '-'} 점</span>
            </div>
            <ul>
              {courseGrade.assessments.map((a) => (
                <li key={a.id}>
                  {a.name} (만점 {a.max_score}, 가중치 {a.weight})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function AssignmentSection({ notify }: { notify: (type: Toast['type'], msg: string) => void }) {
  const { data: students } = useLoad<Student[]>(async () => (await api.get('/students')).data, []);
  const { data: courses } = useLoad<Course[]>(async () => (await api.get('/courses')).data, []);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const { data: assignments, setData: setAssignments } = useLoad<Assessment[] | null>(
    async () => (selectedCourse ? (await api.get(`/courses/${selectedCourse}/assessments`)).data : []),
    [selectedCourse]
  );
  const [assignmentForm, setAssignmentForm] = useState({ name: '', weight: 0.1, max_score: 100 });
  const [scoreForm, setScoreForm] = useState<Record<string, number>>({});

  const createAssignment = async () => {
    if (!selectedCourse) return;
    const res = await api.post<Assessment>(`/courses/${selectedCourse}/assessments`, assignmentForm);
    setAssignments((prev) => (prev ? [res.data, ...prev] : [res.data]));
    notify('success', '과제가 추가되었습니다.');
  };

  const saveAssignmentScores = async (assessmentId: number) => {
    const payload = Object.entries(scoreForm).map(([studentId, raw_score]) => ({
      student_id: Number(studentId),
      raw_score,
    }));
    await api.post(`/assessments/${assessmentId}/scores/bulk`, payload);
    notify('success', '과제 점수가 저장되었습니다.');
  };

  return (
    <div className="card">
      <h2 className="section-title">과제 관리</h2>
      <div className="form-row">
        <div>
          <label>강좌 선택</label>
          <select value={selectedCourse ?? ''} onChange={(e) => setSelectedCourse(Number(e.target.value))}>
            <option value="">선택</option>
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>과제명</label>
          <input
            value={assignmentForm.name}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, name: e.target.value })}
            placeholder="예: HW1"
          />
        </div>
        <div>
          <label>가중치</label>
          <input
            type="number"
            step="0.05"
            value={assignmentForm.weight}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, weight: Number(e.target.value) })}
          />
        </div>
        <div>
          <label>만점</label>
          <input
            type="number"
            value={assignmentForm.max_score}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, max_score: Number(e.target.value) })}
          />
        </div>
        <div className="action-cell">
          <button className="btn-slim" style={{ minWidth: 120 }} onClick={createAssignment}>
            과제 추가
          </button>
        </div>
      </div>

      {assignments && assignments.length > 0 ? (
        assignments.map((ass) => (
          <div key={ass.id} className="card" style={{ marginBottom: 12 }}>
            <div className="header">
              <div>
                <strong>{ass.name}</strong>
                <div style={{ color: '#64748b', fontSize: 12 }}>
                  weight {ass.weight}, max {ass.max_score}
                </div>
              </div>
              <button className="secondary btn-slim" onClick={() => saveAssignmentScores(ass.id)}>
                점수 저장
              </button>
            </div>
            <div className="grid">
              {(students || []).map((stu) => (
                <div key={stu.id}>
                  <label>{stu.full_name}</label>
                  <input
                    type="number"
                    placeholder="점수"
                    onChange={(e) => setScoreForm({ ...scoreForm, [stu.id]: Number(e.target.value) })}
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <small>과제가 없습니다. 강좌를 선택해 과제를 추가하세요.</small>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [loggedIn, setLoggedIn] = useState(() => Boolean(localStorage.getItem('token')));
  const [role, setRole] = useState<Role>('admin');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = (type: Toast['type'], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return <LoginCard onSuccess={() => setLoggedIn(true)} />;
  }

  return (
    <div className="app-shell">
      <Sidebar tab={tab} setTab={setTab} onLogout={logout} role={role} onRoleChange={setRole} />
      <main className="main">
        <HeaderBar tab={tab} />
        <Topbar tab={tab} setTab={setTab} role={role} />
        {tab === 'dashboard' && <DashboardSection go={setTab} />}
        {tab === 'students' && role === 'admin' && <StudentSection notify={pushToast} />}
        {tab === 'courses' && role === 'admin' && <CourseSection notify={pushToast} />}
        {tab === 'attendance' && <AttendanceSection notify={pushToast} />}
        {tab === 'grades' && <GradeSection notify={pushToast} />}
        {tab === 'assignments' && <AssignmentSection notify={pushToast} />}
      </main>
      <ToastStack toasts={toasts} />
    </div>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
