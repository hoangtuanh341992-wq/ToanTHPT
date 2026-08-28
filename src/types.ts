export type QuestionType = 'mc' | 'tf' | 'short' | 'essay';

export type QuestionLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';

export interface Question {
  id: string;
  type: QuestionType;
  stem?: string; // Đoạn văn dẫn / dữ kiện chung
  image?: string | null; // Hình ảnh đính kèm base64 hoặc URL
  content: string; // Nội dung câu hỏi
  grade: '10' | '11' | '12';
  level: QuestionLevel;
  topic: string;
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer?: string; // e.g. 'A' | 'B' | 'C' | 'D' or short answer string
  statements?: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswers?: {
    a: 'true' | 'false';
    b: 'true' | 'false';
    c: 'true' | 'false';
    d: 'true' | 'false';
  };
  guide?: string; // Hướng dẫn chấm / tự luận
}

export interface Exam {
  id: string;
  code: string;
  title: string;
  duration: number; // minutes
  shuffleQs: boolean;
  shuffleOpts: boolean;
  createdAt: string;
  questions: Question[];
  description?: string;
}

export interface ExamResult {
  id: string;
  studentName: string;
  studentSbd?: string; // Số báo danh thí sinh
  studentClass: string;
  examCode: string;
  examTitle: string;
  score: number;
  tabSwitchCount: number;
  submittedAt: string;
  durationSpentSeconds?: number;
  answers?: Record<string, any>;
  scoreBreakdown?: {
    part1Earned?: number;
    part1Max?: number;
    part2Earned?: number;
    part2Max?: number;
    part3Earned?: number;
    part3Max?: number;
    part4Earned?: number;
    part4Max?: number;
  };
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export type UserRole = 'super_admin' | 'teacher';

export interface UserAccount {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  role: UserRole;
  password?: string; // Mật khẩu định danh
  subject?: string;
  school?: string;
  createdAt: string;
  isActive: boolean;
  lastLoginAt?: string;
}
