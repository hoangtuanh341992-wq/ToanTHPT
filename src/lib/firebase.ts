import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { Exam, ExamResult, Question, UserAccount } from '../types';
import { initialExams, initialQuestionBank } from '../data/sampleData';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfigData) : getApp();

// Initialize Firestore with custom databaseId if present
export const db: Firestore = firebaseConfigData.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

// Firestore Collection Names
export const COLLECTIONS = {
  SETTINGS: 'system_settings',
  EXAMS: 'exams',
  QBANK: 'question_bank',
  RESULTS: 'exam_results',
  USERS: 'users',
} as const;

// -------------------------------------------------------------
// SYSTEM SETTINGS (Admin PIN & Global Config)
// -------------------------------------------------------------

export async function fetchSystemPin(): Promise<string> {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'global');
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data()?.adminPin) {
      return snap.data().adminPin;
    }
    // If not exists, initialize with default PIN '123456'
    await setDoc(docRef, { adminPin: '123456', updatedAt: new Date().toISOString() });
    return '123456';
  } catch (error) {
    console.warn('[Firebase] fetchSystemPin fallback:', error);
    return '123456';
  }
}

export async function updateSystemPin(newPin: string): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'global');
    await setDoc(docRef, {
      adminPin: newPin,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('[Firebase] updateSystemPin error:', error);
    return false;
  }
}

export function subscribeSystemPin(callback: (pin: string) => void): () => void {
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'global');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists() && snap.data()?.adminPin) {
        callback(snap.data().adminPin);
      }
    },
    (err) => {
      console.warn('[Firebase] subscribeSystemPin error:', err);
    }
  );
}

// -------------------------------------------------------------
// EXAMS (Real-time Cloud Sync)
// -------------------------------------------------------------

export function subscribeExams(callback: (exams: Exam[]) => void): () => void {
  const colRef = collection(db, COLLECTIONS.EXAMS);
  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial sample exams if cloud is completely empty
        try {
          for (const exam of initialExams) {
            await setDoc(doc(db, COLLECTIONS.EXAMS, exam.id), exam);
          }
        } catch (e) {
          console.warn('[Firebase] Seeding initial exams error:', e);
        }
        callback(initialExams);
        return;
      }

      const list: Exam[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Exam);
      });
      // Sort newest created first
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(list);
    },
    (error) => {
      console.warn('[Firebase] subscribeExams error:', error);
    }
  );
}

export async function saveExamToCloud(exam: Exam): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.EXAMS, exam.id);
    await setDoc(docRef, exam, { merge: true });
    return true;
  } catch (error) {
    console.error('[Firebase] saveExamToCloud error:', error);
    return false;
  }
}

export async function deleteExamFromCloud(examId: string): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.EXAMS, examId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('[Firebase] deleteExamFromCloud error:', error);
    return false;
  }
}

// -------------------------------------------------------------
// QUESTION BANK (Real-time Cloud Sync)
// -------------------------------------------------------------

export function subscribeQuestionBank(callback: (questions: Question[]) => void): () => void {
  const colRef = collection(db, COLLECTIONS.QBANK);
  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial sample question bank
        try {
          for (const q of initialQuestionBank) {
            await setDoc(doc(db, COLLECTIONS.QBANK, q.id), q);
          }
        } catch (e) {
          console.warn('[Firebase] Seeding initial qbank error:', e);
        }
        callback(initialQuestionBank);
        return;
      }

      const list: Question[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Question);
      });
      callback(list);
    },
    (error) => {
      console.warn('[Firebase] subscribeQuestionBank error:', error);
    }
  );
}

export async function saveQuestionToCloud(question: Question): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.QBANK, question.id);
    await setDoc(docRef, question, { merge: true });
    return true;
  } catch (error) {
    console.error('[Firebase] saveQuestionToCloud error:', error);
    return false;
  }
}

export async function deleteQuestionFromCloud(questionId: string): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.QBANK, questionId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('[Firebase] deleteQuestionFromCloud error:', error);
    return false;
  }
}

// -------------------------------------------------------------
// EXAM RESULTS (Submissions Real-time Sync)
// -------------------------------------------------------------

export function subscribeExamResults(callback: (results: ExamResult[]) => void): () => void {
  const colRef = collection(db, COLLECTIONS.RESULTS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: ExamResult[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as ExamResult);
      });
      // Sort newest submission first
      list.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
      callback(list);
    },
    (error) => {
      console.warn('[Firebase] subscribeExamResults error:', error);
    }
  );
}

export async function submitExamResultToCloud(result: ExamResult): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.RESULTS, result.id);
    await setDoc(docRef, result, { merge: true });
    return true;
  } catch (error) {
    console.error('[Firebase] submitExamResultToCloud error:', error);
    return false;
  }
}

export async function deleteExamResultFromCloud(resultId: string): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.RESULTS, resultId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('[Firebase] deleteExamResultFromCloud error:', error);
    return false;
  }
}

// -------------------------------------------------------------
// USER ACCOUNTS & RBAC MANAGEMENT
// -------------------------------------------------------------

export const DEFAULT_ROOT_ADMIN: UserAccount = {
  id: 'user-admin-root',
  username: 'admin',
  displayName: 'Quản Trị Viên Tối Cao',
  email: 'hoangtuanh341992@gmail.com',
  role: 'super_admin',
  password: '123',
  subject: 'Toán Học - Quản Trị',
  school: 'Hệ Thống DoretaExam',
  createdAt: '2026-08-28',
  isActive: true,
  lastLoginAt: new Date().toISOString(),
};

export function subscribeUsers(callback: (users: UserAccount[]) => void): () => void {
  const colRef = collection(db, COLLECTIONS.USERS);
  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed default super admin account
        try {
          await setDoc(doc(db, COLLECTIONS.USERS, DEFAULT_ROOT_ADMIN.id), DEFAULT_ROOT_ADMIN);
          callback([DEFAULT_ROOT_ADMIN]);
          return;
        } catch (e) {
          console.warn('[Firebase] Seed root admin error:', e);
          callback([DEFAULT_ROOT_ADMIN]);
          return;
        }
      }

      const list: UserAccount[] = [];
      let hasAdmin = false;
      snapshot.forEach((docSnap) => {
        const u = docSnap.data() as UserAccount;
        list.push(u);
        if (u.role === 'super_admin' || u.username === 'admin') {
          hasAdmin = true;
        }
      });

      // Ensure root admin exists
      if (!hasAdmin) {
        try {
          await setDoc(doc(db, COLLECTIONS.USERS, DEFAULT_ROOT_ADMIN.id), DEFAULT_ROOT_ADMIN);
          list.unshift(DEFAULT_ROOT_ADMIN);
        } catch {}
      }

      callback(list);
    },
    (error) => {
      console.warn('[Firebase] subscribeUsers error:', error);
      callback([DEFAULT_ROOT_ADMIN]);
    }
  );
}

export async function saveUserToCloud(user: UserAccount): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, user.id);
    await setDoc(docRef, user, { merge: true });
    return true;
  } catch (error) {
    console.error('[Firebase] saveUserToCloud error:', error);
    return false;
  }
}

export async function deleteUserFromCloud(userId: string): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('[Firebase] deleteUserFromCloud error:', error);
    return false;
  }
}
