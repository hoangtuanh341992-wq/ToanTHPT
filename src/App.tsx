import { useState, useEffect } from 'react';
import { Exam, ExamResult, Question, ToastMessage } from './types';
import { initialExams, initialQuestionBank } from './data/sampleData';
import { Header } from './components/Header';
import { TabTakeExam } from './components/TabTakeExam';
import { TabCreateExam } from './components/TabCreateExam';
import { TabManageExams } from './components/TabManageExams';
import { TabResults } from './components/TabResults';
import { AdminAuthModal } from './components/AdminAuthModal';
import { PublishModal } from './components/PublishModal';
import { EditExamModal } from './components/EditExamModal';
import { QuestionBankModal } from './components/QuestionBankModal';
import { ToastContainer } from './components/ToastContainer';

export default function App() {
  // Navigation & Role State
  const [currentTab, setCurrentTab] = useState<'take' | 'create' | 'manage' | 'results'>('take');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [systemPin, setSystemPin] = useState<string>(() => {
    return localStorage.getItem('doreta_pin') || '123456';
  });

  // Modal States
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<'create' | 'manage' | 'results' | null>(null);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Data States with LocalStorage Persistence
  const [questionBank, setQuestionBank] = useState<Question[]>(() => {
    try {
      const stored = localStorage.getItem('doreta_qbank');
      if (stored) return JSON.parse(stored);
    } catch {}
    return initialQuestionBank;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const stored = localStorage.getItem('doreta_exams');
      if (stored) return JSON.parse(stored);
    } catch {}
    return initialExams;
  });

  const [results, setResults] = useState<ExamResult[]>(() => {
    try {
      const stored = localStorage.getItem('doreta_results');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // Authoring Draft State
  const [draftingQuestions, setDraftingQuestions] = useState<Question[]>([]);
  const [editingDraftIndex, setEditingDraftIndex] = useState<number>(-1);

  // Preset code for taking exam
  const [presetExamCode, setPresetExamCode] = useState<string | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('doreta_qbank', JSON.stringify(questionBank));
  }, [questionBank]);

  useEffect(() => {
    localStorage.setItem('doreta_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('doreta_results', JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem('doreta_pin', systemPin);
  }, [systemPin]);

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
      setIsAdminAuthOpen(true);
    } else {
      setCurrentTab(tab);
    }
  };

  const handleToggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      showToast('Đã chuyển sang chế độ Học Sinh', 'info');
      setCurrentTab('take');
    } else {
      setIsAdminAuthOpen(true);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdmin(true);
    setIsAdminAuthOpen(false);
    showToast('Đã xác thực quyền Giáo Viên thành công!', 'success');
    if (pendingTab) {
      setCurrentTab(pendingTab);
      setPendingTab(null);
    }
  };

  const handleOpenBank = () => {
    if (!isAdmin) {
      setIsAdminAuthOpen(true);
    } else {
      setIsBankOpen(true);
    }
  };

  const handleSaveQuestionToBank = (q: Question) => {
    setQuestionBank((prev) => [q, ...prev]);
    showToast('Đã lưu câu hỏi vào Ngân hàng hệ thống!', 'success');
  };

  const handleSaveAllToBank = () => {
    if (draftingQuestions.length === 0) return;
    setQuestionBank((prev) => [...draftingQuestions, ...prev]);
    showToast(`Đã lưu toàn bộ ${draftingQuestions.length} câu hỏi vào Ngân hàng!`, 'success');
  };

  const handleConfirmPublish = (data: {
    title: string;
    code: string;
    duration: number;
    shuffleQs: boolean;
    shuffleOpts: boolean;
    description: string;
  }) => {
    if (draftingQuestions.length === 0) {
      showToast('Cần ít nhất 1 câu hỏi để xuất bản đề thi!', 'error');
      return;
    }

    // Check duplicate code
    if (exams.some((e) => e.code.toUpperCase() === data.code.toUpperCase())) {
      showToast(`Mã đề "${data.code}" đã tồn tại! Vui lòng chọn mã khác.`, 'error');
      return;
    }

    const newExam: Exam = {
      id: 'exam-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      title: data.title,
      code: data.code,
      duration: data.duration,
      shuffleQs: data.shuffleQs,
      shuffleOpts: data.shuffleOpts,
      description: data.description,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      questions: [...draftingQuestions],
    };

    setExams((prev) => [newExam, ...prev]);
    setDraftingQuestions([]);
    setIsPublishOpen(false);
    showToast(`Xuất bản đề thi "${data.title}" thành công!`, 'success');
    setCurrentTab('manage');
  };

  const handleSaveExamEdits = (updated: Partial<Exam>) => {
    if (!editingExam) return;
    setExams((prev) =>
      prev.map((e) => (e.id === editingExam.id ? { ...e, ...updated } : e))
    );
    setEditingExam(null);
    showToast('Đã cập nhật thông tin đề thi!', 'success');
  };

  const handleDeleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    showToast('Đã xóa đề thi khỏi hệ thống', 'info');
  };

  const handleQuickStartExam = (code: string) => {
    setPresetExamCode(code);
    setCurrentTab('take');
  };

  const handleExportSystemData = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      pin: systemPin,
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
        if (data.bank && Array.isArray(data.bank)) setQuestionBank(data.bank);
        if (data.exams && Array.isArray(data.exams)) setExams(data.exams);
        if (data.results && Array.isArray(data.results)) setResults(data.results);
        if (data.pin && typeof data.pin === 'string') setSystemPin(data.pin);

        showToast('Đã khôi phục dữ liệu hệ thống thành công!', 'success');
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
        onToggleAdmin={handleToggleAdmin}
        bankCount={questionBank.length}
        onOpenBank={handleOpenBank}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'take' && (
          <TabTakeExam
            exams={exams}
            onExamSubmitted={(res) => setResults((prev) => [res, ...prev])}
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
            onOpenEditExam={(ex) => setEditingExam(ex)}
            onDeleteExam={handleDeleteExam}
            onQuickStartExam={handleQuickStartExam}
            onOpenPinChange={() => setIsAdminAuthOpen(true)}
            onExportSystemData={handleExportSystemData}
            onImportSystemData={handleImportSystemData}
            onGoToCreate={() => setCurrentTab('create')}
            showToast={showToast}
          />
        )}

        {currentTab === 'results' && (
          <TabResults
            results={results}
            onClearResults={() => setResults([])}
            onDeleteResult={(id) => setResults((prev) => prev.filter((r) => r.id !== id))}
            showToast={showToast}
          />
        )}
      </main>

      {/* Admin Auth / PIN modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => {
          setIsAdminAuthOpen(false);
          setPendingTab(null);
        }}
        onSuccess={handleAdminAuthSuccess}
        systemPin={systemPin}
        onChangePin={(newPin) => {
          setSystemPin(newPin);
          showToast('Cập nhật mã PIN quản trị thành công!', 'success');
        }}
      />

      {/* Question Bank Modal */}
      <QuestionBankModal
        isOpen={isBankOpen}
        onClose={() => setIsBankOpen(false)}
        bank={questionBank}
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
          setQuestionBank((prev) => prev.filter((_, i) => i !== index));
          showToast('Đã xóa câu hỏi khỏi ngân hàng', 'info');
        }}
      />

      {/* Publish Exam Modal */}
      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onConfirm={handleConfirmPublish}
        defaultQuestionCount={draftingQuestions.length}
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
