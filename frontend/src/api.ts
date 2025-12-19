import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type Student = {
  id: number;
  full_name: string;
  email?: string;
  grade_level?: string;
};

export type Course = {
  id: number;
  name: string;
  subject?: string;
  class_name?: string;
  teacher_name?: string;
};

export type Session = {
  id: number;
  course_id: number;
  session_date: string;
  topic?: string;
};

export type AttendanceRecord = {
  id: number;
  student_id: number;
  session_id: number;
  status: 'present' | 'late' | 'absent' | 'excused';
  memo?: string;
};

export type Assessment = {
  id: number;
  course_id: number;
  name: string;
  weight: number;
  max_score: number;
};

export type Score = {
  id: number;
  student_id: number;
  assessment_id: number;
  raw_score: number;
  adjusted_score?: number;
};

export type AttendanceSummary = {
  course_id: number;
  session_count: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
};

export type GradeSummary = {
  course_id: number;
  course_name: string;
  total_weight: number;
  weighted_score: number;
  details: Score[];
};

export type CourseGradeSummary = {
  course_id: number;
  course_name: string;
  average_score?: number;
  assessments: Assessment[];
};

export const login = async (username: string, password: string) => {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);
  params.append('grant_type', 'password');
  const res = await api.post('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const token = res.data.access_token;
  localStorage.setItem('token', token);
  return token;
};
