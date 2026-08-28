import { useState, useEffect } from 'react';
import { Exam, ExamResult, Question, ToastMessage, UserAccount } from './types';
import { initialExams, initialQuestionBank } from './data/sampleData';
import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
} from './utils/storage';
import {
  fetchSystemPin,
  updateSystemPin,
  subscribeSystemPin,
  subscribeExams,
  saveExamToCloud,
  deleteExamFromCloud,
  subscribeQuestionBank,
  saveQuestionToCloud,
  deleteQuestionFromCloud,
  subscribeExamResults,
  submitExamResultToCloud,
  deleteExamResultFromCloud,
  subscribeUsers,
  saveUserToCloud,
  deleteUserFromCloud,
  DEFAULT_ROOT_ADMIN,
} from './lib/firebase';
import { Header } from './components/Header';
import { TabTakeExam } from './components/TabTakeExam';
import { TabCreateExam } from './components/TabCreateExam';
import { TabManageExams } from './components/TabManageExams';
import { TabResults } from './components/TabResults';
import { AuthModal } from './components/AuthModal';
import { TeacherManagementModal } from './components/TeacherManagementModal';
import { PublishModal, PublishConfirmData } from './components/PublishModal';
import { EditExamModal } from './components/EditExamModal';
import { QuestionBankModal } from './components/QuestionBankModal';
import { ToastContainer } from './components/ToastContainer';
import { generateExamVariants } from './utils/examStructure';

export default function App() {
  // Navigation & Role State
  const [currentTab, setCurrentTab] = useState<'take' | 'create' | 'manage' | 'results'>('take');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return getStorageItem<boolean>(STORAGE_KEYS.IS_ADMIN, false);
  });
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return getStorageItem<UserAccount | null>(STORAGE_KEYS.CURRENT_USER, null);
  });
  const [systemPin, setSystemPin] = useState<string>(() => {
    return getStorageItem<string>(STORAGE_KEYS.PIN, '123456');
  });

  // Users Accounts (Teachers & Super Admin)
  const [users, setUsers] = useState<UserAccount[]>(() => {
    return getStorageItem<UserAccount[]>(STORAGE_KEYS.USERS, [DEFAULT_ROOT_ADMIN]);
  });

  // Modal States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTeacherMgmtOpen, setIsTeacherMgmtOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<'create' | 'manage' | 'results' | null>(null);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Data States with LocalStorage Cache + Cloud Firestore Sync
  const [questionBank, setQuestionBank] = useState<Question[]>(() => {
    return getStorageItem<Question[]>(STORAGE_KEYS.QBANK, initialQuestionBank);
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    return getStorageItem<Exam[]>(STORAGE_KEYS.EXAMS, initialExams);
  });

  const [results, setResults] = useState<ExamResult[]>(() => {
    return getStorageItem<ExamResult[]>(STORAGE_KEYS.RESULTS, []);
  });

  // Authoring Draft State (now fully persisted!)
  const [draftingQuestions, setDraftingQuestions] = useState<Question[]>(() => {
    return getStorageItem<Question[]>(STORAGE_KEYS.DRAFT_QUESTIONS, []);
  });
  const [editingDraftIndex, setEditingDraftIndex] = useState<number>(-1);

  // Network Status
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Preset code for taking exam
  const [presetExamCode, setPresetExamCode] = useState<string | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Synchronize localStorage reliably as local cache
  useEffect(() => {
    setStorageItem(STORAGE_KEYS.QBANK, questionBank);
  }, [questionBank]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.EXAMS, exams);
  }, [exams]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.RESULTS, results);
  }, [results]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.DRAFT_QUESTIONS, draftingQuestions);
  }, [draftingQuestions]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.PIN, systemPin);
  }, [systemPin]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.IS_ADMIN, isAdmin);
  }, [isAdmin]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.CURRENT_USER, currentUser);
  }, [currentUser]);

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.USERS, users);
  }, [users]);

  // Firebase Real-Time Cloud Listeners (Subscribes to Exams, Bank, Results, PIN, Users)
  useEffect(() => {
    // 1. Subscribe to Cloud PIN
    const unsubPin = subscribeSystemPin((cloudPin) => {
      if (cloudPin && cloudPin !== systemPin) {
        setSystemPin(cloudPin);
      }
    });

    // 2. Subscribe to Cloud Exams
    const unsubExams = subscribeExams((cloudExams) => {
      if (cloudExams && Array.isArray(cloudExams)) {
        setExams(cloudExams);
      }
    });

    // 3. Subscribe to Cloud Question Bank
    const unsubBank = subscribeQuestionBank((cloudBank) => {
      if (cloudBank && Array.isArray(cloudBank)) {
        setQuestionBank(cloudBank);
      }
    });

    // 4. Subscribe to Cloud Exam Results (Real-time student submissions)
    const unsubResults = subscribeExamResults((cloudResults) => {
      if (cloudResults && Array.isArray(cloudResults)) {
        setResults(cloudResults);
      }
    });

    // 5. Subscribe to Cloud Users
    const unsubUsers = subscribeUsers((cloudUsers) => {
      if (cloudUsers && Array.isArray(cloudUsers) && cloudUsers.length > 0) {
        setUsers(cloudUsers);
      }
    });

    // Initial PIN fetch
    fetchSystemPin().then((pin) => {
      if (pin) setSystemPin(pin);
    });

    return () => {
      unsubPin();
      unsubExams();
      unsubBank();
      unsubResults();
      unsubUsers();
    };
  }, []);

  // Network online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Đã kết nối Internet! Dữ liệu đang được đồng bộ đám mây.', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast(
        'Đang ở chế độ Ngoại Tuyến (Offline): Toàn bộ dữ liệu được lưu an toàn trên máy của bạn.',
        'info'
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Multi-tab sync listener
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.EXAMS && e.newValue) {
        try {
          setExams(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === STORAGE_KEYS.QBANK && e.newValue) {
        try {
          setQuestionBank(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === STORAGE_KEYS.RESULTS && e.newValue) {
        try {
          setResults(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === STORAGE_KEYS.DRAFT_QUESTIONS && e.newValue) {
        try {
          setDraftingQuestions(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === STORAGE_KEYS.USERS && e.newValue) {
        try {
          setUsers(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const showToast = (
    message: string,
    type: 'info' | 'success' | 'error' | 'warning' = 'info'
  ) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleTabChange = (tab: 'take' | 'create' | 'manage' | 'results') => {
    if (tab === 'take') {
      setCurrentTab(tab);
      return;
    }

    if (!isAdmin) {
      setPendingTab(tab);
      setIsAuthOpen(true);
    } else {
      setCurrentTab(tab);
    }
  };

  const handleToggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setCurrentUser(null);
      removeStorageItem(STORAGE_KEYS.CURRENT_USER);
      showToast('Đã chuyển sang chế độ Học Sinh', 'info');
      setCurrentTab('take');
    } else {
      setIsAuthOpen(true);
    }
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setIsAdmin(true);
    setCurrentUser(user);
    setIsAuthOpen(false);
    showToast(`Chào mừng thầy/cô ${user.displayName} đã đăng nhập hệ thống!`, 'success');
    if (pendingTab) {
      setCurrentTab(pendingTab);
      setPendingTab(null);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentUser(null);
    removeStorageItem(STORAGE_KEYS.CURRENT_USER);
    showToast('Đã đăng xuất khỏi tài khoản giáo viên.', 'info');
    setCurrentTab('take');
  };

  const handleOpenBank = () => {
    if (!isAdmin) {
      setIsAuthOpen(true);
    } else {
      setIsBankOpen(true);
    }
  };

  const handleSaveQuestionToBank = (q: Question) => {
    const stampedQ: Question = {
      ...q,
      authorId: q.authorId || currentUser?.id || 'admin',
      authorName: q.authorName || currentUser?.displayName || 'Quản trị viên',
      authorUsername: q.authorUsername || currentUser?.username || 'admin',
    };
    setQuestionBank((prev) => [stampedQ, ...prev]);
    saveQuestionToCloud(stampedQ);
    showToast('Đã lưu câu hỏi vào Ngân hàng đám mây hệ thống!', 'success');
  };

  const handleSaveAllToBank = () => {
    if (draftingQuestions.length === 0) return;
    const stampedQs = draftingQuestions.map((q) => ({
      ...q,
      authorId: q.authorId || currentUser?.id || 'admin',
      authorName: q.authorName || currentUser?.displayName || 'Quản trị viên',
      authorUsername: q.authorUsername || currentUser?.username || 'admin',
    }));
    setQuestionBank((prev) => [...stampedQs, ...prev]);
    stampedQs.forEach((q) => saveQuestionToCloud(q));
    showToast(`Đã đồng bộ toàn bộ ${draftingQuestions.length} câu hỏi lên Ngân hàng đám mây!`, 'success');
  };

  const handleConfirmPublish = (data: PublishConfirmData) => {
    if (draftingQuestions.length === 0) {
      showToast('Cần ít nhất 1 câu hỏi để xuất bản đề thi!', 'error');
      return;
    }

    const count = Math.min(4, Math.max(1, data.variantCount || 1));
    const activeCodes = data.variantCodes.slice(0, count);

    // Check duplicate codes
    const existingCodeSet = new Set(exams.map((e) => e.code.toUpperCase()));
    const duplicates = activeCodes.filter((c) => existingCodeSet.has(c.toUpperCase()));
    if (duplicates.length > 0) {
      showToast(`Mã đề "${duplicates.join(', ')}" đã tồn tại trên hệ thống! Vui lòng chọn mã khác.`, 'error');
      return;
    }

    // Generate variants
    const generatedVariants = generateExamVariants(draftingQuestions, {
      variantCount: count,
      baseTitle: data.title,
      baseCode: data.code,
      duration: data.duration,
      description: data.description,
      shuffleQs: data.shuffleQs,
      shuffleOpts: data.shuffleOpts,
      variantCodes: activeCodes,
      keepMasterAsFirst: data.keepMasterAsFirst,
      authorId: currentUser?.id || 'admin',
      authorName: currentUser?.displayName || 'Quản trị viên',
      authorUsername: currentUser?.username || 'admin',
    });

    setExams((prev) => [...generatedVariants, ...prev]);
    generatedVariants.forEach((exam) => saveExamToCloud(exam));

    setDraftingQuestions([]);
    setIsPublishOpen(false);

    if (count === 1) {
      showToast(`Xuất bản đề thi "${data.title}" lên Đám mây thành công! Học sinh có thể nhập mã ${data.code} để thi.`, 'success');
    } else {
      const codeList = activeCodes.join(', ');
      showToast(`Đã tạo và xuất bản trọn bộ ${count} mã đề (${codeList}) lên Đám mây thành công!`, 'success');
    }

    setCurrentTab('manage');
  };

  const handleSaveExamEdits = (updated: Partial<Exam>) => {
    if (!editingExam) return;
    const updatedExam = { ...editingExam, ...updated };
    setExams((prev) =>
      prev.map((e) => (e.id === editingExam.id ? updatedExam : e))
    );
    saveExamToCloud(updatedExam);
    setEditingExam(null);
    showToast('Đã cập nhật thông tin đề thi lên Đám mây!', 'success');
  };

  const handleDeleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    deleteExamFromCloud(id);
    showToast('Đã xóa đề thi khỏi hệ thống đám mây', 'info');
  };

  const handleQuickStartExam = (code: string) => {
    setPresetExamCode(code);
    setCurrentTab('take');
  };

  const handleSaveUserAccount = (user: UserAccount) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      if (exists) {
        return prev.map((u) => (u.id === user.id ? user : u));
      }
      return [user, ...prev];
    });
    saveUserToCloud(user);
  };

  const handleDeleteUserAccount = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    deleteUserFromCloud(userId);
  };

  const handleExportSystemData = () => {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      pin: systemPin,
      users: users,
      bank: questionBank,
      exams: exams,
      results: results,
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `DoretaExam_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    showToast('Đã xuất tệp sao lưu JSON thành công!', 'success');
  };

  const handleImportSystemData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.bank && Array.isArray(data.bank)) {
          setQuestionBank(data.bank);
          data.bank.forEach((q: Question) => saveQuestionToCloud(q));
        }
        if (data.exams && Array.isArray(data.exams)) {
          setExams(data.exams);
          data.exams.forEach((ex: Exam) => saveExamToCloud(ex));
        }
        if (data.results && Array.isArray(data.results)) {
          setResults(data.results);
          data.results.forEach((r: ExamResult) => submitExamResultToCloud(r));
        }
        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
          data.users.forEach((u: UserAccount) => saveUserToCloud(u));
        }
        if (data.pin && typeof data.pin === 'string') {
          setSystemPin(data.pin);
          updateSystemPin(data.pin);
        }

        showToast('Đã khôi phục và đồng bộ toàn bộ dữ liệu lên Đám mây thành công!', 'success');
      } catch {
        showToast('Tệp JSON sao lưu không hợp lệ!', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        onTabChange={handleTabChange}
        isAdmin={isAdmin}
        currentUser={currentUser}
        onToggleAdmin={handleToggleAdmin}
        bankCount={questionBank.length}
        onOpenBank={handleOpenBank}
        onOpenTeacherManagement={() => setIsTeacherMgmtOpen(true)}
        onLogout={handleLogout}
        isOnline={isOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'take' && (
          <TabTakeExam
            exams={exams}
            onExamSubmitted={(res) => {
              const matchedExam = exams.find(
                (e) => e.code.toUpperCase() === res.examCode.toUpperCase()
              );
              const stampedRes: ExamResult = {
                ...res,
                examAuthorId: res.examAuthorId || matchedExam?.authorId,
                examAuthorName: res.examAuthorName || matchedExam?.authorName,
              };
              setResults((prev) => [stampedRes, ...prev]);
              submitExamResultToCloud(stampedRes);
            }}
            showToast={showToast}
            presetExamCode={presetExamCode}
            onClearPresetCode={() => setPresetExamCode(null)}
          />
        )}

        {currentTab === 'create' && (
          <TabCreateExam
            draftingQuestions={draftingQuestions}
            onDraftQuestionsChange={setDraftingQuestions}
            onSaveQuestionToBank={handleSaveQuestionToBank}
            onSaveAllToBank={handleSaveAllToBank}
            onOpenPublishModal={() => setIsPublishOpen(true)}
            showToast={showToast}
            editingDraftIndex={editingDraftIndex}
            setEditingDraftIndex={setEditingDraftIndex}
          />
        )}

        {currentTab === 'manage' && (
          <TabManageExams
            exams={exams}
            questionBankCount={questionBank.length}
            resultsCount={results.length}
            usersCount={users.length}
            currentUser={currentUser}
            onOpenTeacherManagement={() => setIsTeacherMgmtOpen(true)}
            onOpenEditExam={(ex) => setEditingExam(ex)}
            onDeleteExam={handleDeleteExam}
            onQuickStartExam={handleQuickStartExam}
            onOpenPinChange={() => setIsAuthOpen(true)}
            onExportSystemData={handleExportSystemData}
            onImportSystemData={handleImportSystemData}
            onGoToCreate={() => setCurrentTab('create')}
            showToast={showToast}
          />
        )}

        {currentTab === 'results' && (
          <TabResults
            results={results}
            exams={exams}
            currentUser={currentUser}
            onClearResults={() => {
              const isSuperAdmin = currentUser?.role === 'super_admin';
              if (isSuperAdmin) {
                results.forEach((r) => deleteExamResultFromCloud(r.id));
                setResults([]);
              } else if (currentUser) {
                const myResultIds = new Set<string>(
                  results
                    .filter((r) => {
                      if (r.examAuthorId && r.examAuthorId === currentUser.id) return true;
                      const matched = exams.find((e) => e.code.toUpperCase() === r.examCode.toUpperCase());
                      return Boolean(matched && (matched.authorId === currentUser.id || matched.authorUsername === currentUser.username));
                    })
                    .map((r) => r.id)
                );
                myResultIds.forEach((id: string) => deleteExamResultFromCloud(id));
                setResults((prev) => prev.filter((r) => !myResultIds.has(r.id)));
              }
            }}
            onDeleteResult={(id) => {
              setResults((prev) => prev.filter((r) => r.id !== id));
              deleteExamResultFromCloud(id);
            }}
            showToast={showToast}
          />
        )}
      </main>

      {/* Multi-user Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setPendingTab(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        users={users}
        systemPin={systemPin}
        onChangePin={(newPin) => {
          setSystemPin(newPin);
          updateSystemPin(newPin);
          showToast('Đã cập nhật mã PIN hệ thống lên Đám mây thành công!', 'success');
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Teacher Account Management Modal */}
      <TeacherManagementModal
        isOpen={isTeacherMgmtOpen}
        onClose={() => setIsTeacherMgmtOpen(false)}
        users={users}
        currentUser={currentUser}
        onSaveUser={handleSaveUserAccount}
        onDeleteUser={handleDeleteUserAccount}
        showToast={showToast}
      />

      {/* Question Bank Modal */}
      <QuestionBankModal
        isOpen={isBankOpen}
        onClose={() => setIsBankOpen(false)}
        bank={questionBank}
        currentUser={currentUser}
        onAddToDraft={(q) => {
          setDraftingQuestions((prev) => [...prev, { ...q, id: 'q-' + Date.now() }]);
          showToast('Đã thêm câu hỏi vào danh sách soạn thảo!', 'success');
        }}
        onEditInDraft={(q) => {
          setIsBankOpen(false);
          setDraftingQuestions((prev) => [...prev, { ...q, id: 'q-' + Date.now() }]);
          setEditingDraftIndex(draftingQuestions.length);
          setCurrentTab('create');
        }}
        onDelete={(index) => {
          const target = questionBank[index];
          if (target) {
            deleteQuestionFromCloud(target.id);
          }
          setQuestionBank((prev) => prev.filter((_, i) => i !== index));
          showToast('Đã xóa câu hỏi khỏi ngân hàng đám mây', 'info');
        }}
      />

      {/* Publish Exam Modal */}
      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onConfirm={handleConfirmPublish}
        defaultQuestionCount={draftingQuestions.length}
        masterQuestions={draftingQuestions}
      />

      {/* Edit Exam Metadata Modal */}
      <EditExamModal
        isOpen={!!editingExam}
        exam={editingExam}
        onClose={() => setEditingExam(null)}
        onSave={handleSaveExamEdits}
      />
    </div>
  );
}
