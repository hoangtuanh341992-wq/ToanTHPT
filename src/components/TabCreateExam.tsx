import React, { useState, useEffect, useRef } from 'react';
import { Question, QuestionType, QuestionLevel } from '../types';
import { MathText } from '../utils/mathRenderer';
import { getExamParts, sortQuestionsByMOETStructure } from '../utils/examStructure';
import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
} from '../utils/storage';
import {
  FileText,
  Sparkles,
  Plus,
  BookmarkPlus,
  RotateCcw,
  Image as ImageIcon,
  Trash2,
  Edit3,
  Copy,
  ArrowUp,
  ArrowDown,
  Rocket,
  Layers,
  HelpCircle,
  CheckCircle2,
  ShieldCheck,
  ListOrdered,
} from 'lucide-react';

interface TabCreateExamProps {
  draftingQuestions: Question[];
  onDraftQuestionsChange: (qs: Question[]) => void;
  onSaveQuestionToBank: (q: Question) => void;
  onSaveAllToBank: () => void;
  onOpenPublishModal: () => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
  editingDraftIndex: number;
  setEditingDraftIndex: (idx: number) => void;
}

export const TabCreateExam: React.FC<TabCreateExamProps> = ({
  draftingQuestions,
  onDraftQuestionsChange,
  onSaveQuestionToBank,
  onSaveAllToBank,
  onOpenPublishModal,
  showToast,
  editingDraftIndex,
  setEditingDraftIndex,
}) => {
  // Load saved draft form if available (prevents loss on reload or network drops)
  const savedDraftForm = getStorageItem<any>(STORAGE_KEYS.DRAFT_FORM, null);

  const [createMode, setCreateMode] = useState<'form' | 'raw'>(() => {
    return savedDraftForm?.createMode || 'form';
  });

  // Form states
  const [currentFmType, setCurrentFmType] = useState<QuestionType>(() => {
    return savedDraftForm?.currentFmType || 'mc';
  });
  const [fmGrade, setFmGrade] = useState<'10' | '11' | '12'>(() => {
    return savedDraftForm?.fmGrade || '12';
  });
  const [fmLevel, setFmLevel] = useState<QuestionLevel>(() => {
    return savedDraftForm?.fmLevel || 'Nhận biết';
  });
  const [fmTopic, setFmTopic] = useState<string>(() => {
    return savedDraftForm?.fmTopic || 'Hàm số & Đồ thị';
  });
  const [fmStem, setFmStem] = useState<string>(() => {
    return savedDraftForm?.fmStem || '';
  });
  const [fmImage, setFmImage] = useState<string | null>(() => {
    return savedDraftForm?.fmImage || null;
  });
  const [fmContent, setFmContent] = useState<string>(() => {
    return savedDraftForm?.fmContent || '';
  });

  // MC Options
  const [fmMcOptions, setFmMcOptions] = useState(() => {
    return savedDraftForm?.fmMcOptions || {
      A: '',
      B: '',
      C: '',
      D: '',
    };
  });
  const [fmMcCorrect, setFmMcCorrect] = useState<'A' | 'B' | 'C' | 'D'>(() => {
    return savedDraftForm?.fmMcCorrect || 'A';
  });

  // TF Statements
  const [fmTfStatements, setFmTfStatements] = useState(() => {
    return savedDraftForm?.fmTfStatements || {
      a: '',
      b: '',
      c: '',
      d: '',
    };
  });
  const [fmTfCorrects, setFmTfCorrects] = useState<{
    a: 'true' | 'false';
    b: 'true' | 'false';
    c: 'true' | 'false';
    d: 'true' | 'false';
  }>(() => {
    return savedDraftForm?.fmTfCorrects || {
      a: 'true',
      b: 'true',
      c: 'true',
      d: 'false',
    };
  });

  // Short answer
  const [fmShortAnswer, setFmShortAnswer] = useState<string>(() => {
    return savedDraftForm?.fmShortAnswer || '';
  });

  // Essay guide
  const [fmEssayGuide, setFmEssayGuide] = useState<string>(() => {
    return savedDraftForm?.fmEssayGuide || '';
  });

  // Raw text state
  const [rawText, setRawText] = useState<string>(() => {
    return savedDraftForm?.rawText || '';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save form draft so reloading or network cuts never lose work
  useEffect(() => {
    if (editingDraftIndex === -1) {
      setStorageItem(STORAGE_KEYS.DRAFT_FORM, {
        createMode,
        currentFmType,
        fmGrade,
        fmLevel,
        fmTopic,
        fmStem,
        fmImage,
        fmContent,
        fmMcOptions,
        fmMcCorrect,
        fmTfStatements,
        fmTfCorrects,
        fmShortAnswer,
        fmEssayGuide,
        rawText,
      });
    }
  }, [
    createMode,
    currentFmType,
    fmGrade,
    fmLevel,
    fmTopic,
    fmStem,
    fmImage,
    fmContent,
    fmMcOptions,
    fmMcCorrect,
    fmTfStatements,
    fmTfCorrects,
    fmShortAnswer,
    fmEssayGuide,
    rawText,
    editingDraftIndex,
  ]);

  const resetForm = () => {
    setFmStem('');
    setFmImage(null);
    setFmContent('');
    setFmMcOptions({ A: '', B: '', C: '', D: '' });
    setFmMcCorrect('A');
    setFmTfStatements({ a: '', b: '', c: '', d: '' });
    setFmTfCorrects({ a: 'true', b: 'true', c: 'true', d: 'false' });
    setFmShortAnswer('');
    setFmEssayGuide('');
    setRawText('');
    setEditingDraftIndex(-1);
    removeStorageItem(STORAGE_KEYS.DRAFT_FORM);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadQuestionToForm = (q: Question, index: number) => {
    setCurrentFmType(q.type);
    setFmGrade(q.grade);
    setFmLevel(q.level);
    setFmTopic(q.topic || '');
    setFmStem(q.stem || '');
    setFmImage(q.image || null);
    setFmContent(q.content || '');

    if (q.type === 'mc' && q.options) {
      setFmMcOptions({
        A: q.options.A || '',
        B: q.options.B || '',
        C: q.options.C || '',
        D: q.options.D || '',
      });
      setFmMcCorrect((q.correctAnswer as 'A' | 'B' | 'C' | 'D') || 'A');
    } else if (q.type === 'tf' && q.statements) {
      setFmTfStatements({
        a: q.statements.a || '',
        b: q.statements.b || '',
        c: q.statements.c || '',
        d: q.statements.d || '',
      });
      setFmTfCorrects({
        a: q.correctAnswers?.a || 'true',
        b: q.correctAnswers?.b || 'true',
        c: q.correctAnswers?.c || 'true',
        d: q.correctAnswers?.d || 'false',
      });
    } else if (q.type === 'short') {
      setFmShortAnswer(q.correctAnswer || '');
    } else if (q.type === 'essay') {
      setFmEssayGuide(q.guide || '');
    }

    setEditingDraftIndex(index);
    setCreateMode('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Đang chỉnh sửa câu số ${index + 1}`, 'info');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('Kích thước ảnh không được vượt quá 3MB!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFmImage(event.target?.result as string);
      showToast('Đã tải ảnh đính kèm thành công!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const collectFormData = (): Question | null => {
    if (!fmContent.trim()) {
      showToast('Vui lòng nhập nội dung câu hỏi!', 'error');
      return null;
    }

    const newQ: Question = {
      id: 'q-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      type: currentFmType,
      stem: fmStem.trim(),
      image: fmImage,
      content: fmContent.trim(),
      grade: fmGrade,
      level: fmLevel,
      topic: fmTopic.trim() || 'Tổng hợp',
    };

    if (currentFmType === 'mc') {
      newQ.options = {
        A: fmMcOptions.A.trim() || 'Phương án A',
        B: fmMcOptions.B.trim() || 'Phương án B',
        C: fmMcOptions.C.trim() || 'Phương án C',
        D: fmMcOptions.D.trim() || 'Phương án D',
      };
      newQ.correctAnswer = fmMcCorrect;
    } else if (currentFmType === 'tf') {
      newQ.statements = {
        a: fmTfStatements.a.trim() || 'Mệnh đề a',
        b: fmTfStatements.b.trim() || 'Mệnh đề b',
        c: fmTfStatements.c.trim() || 'Mệnh đề c',
        d: fmTfStatements.d.trim() || 'Mệnh đề d',
      };
      newQ.correctAnswers = { ...fmTfCorrects };
    } else if (currentFmType === 'short') {
      newQ.correctAnswer = fmShortAnswer.trim();
    } else if (currentFmType === 'essay') {
      newQ.guide = fmEssayGuide.trim();
    }

    return newQ;
  };

  const handleSaveQuestion = () => {
    const q = collectFormData();
    if (!q) return;

    if (editingDraftIndex >= 0) {
      const updated = [...draftingQuestions];
      updated[editingDraftIndex] = q;
      onDraftQuestionsChange(updated);
      showToast('Đã cập nhật câu hỏi thành công!', 'success');
    } else {
      onDraftQuestionsChange([...draftingQuestions, q]);
      showToast('Đã thêm câu hỏi vào đề thi!', 'success');
    }

    resetForm();
  };

  const handleSaveToBankDirectly = () => {
    const q = collectFormData();
    if (!q) return;

    onSaveQuestionToBank(q);
    resetForm();
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= draftingQuestions.length) return;

    const copy = [...draftingQuestions];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    onDraftQuestionsChange(copy);
  };

  const handleDuplicateQuestion = (index: number) => {
    const q = draftingQuestions[index];
    const duplicated: Question = {
      ...JSON.parse(JSON.stringify(q)),
      id: 'q-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    };
    const copy = [...draftingQuestions];
    copy.splice(index + 1, 0, duplicated);
    onDraftQuestionsChange(copy);
    showToast('Đã nhân bản câu hỏi!', 'info');
  };

  const handleDeleteQuestion = (index: number) => {
    const copy = draftingQuestions.filter((_, i) => i !== index);
    onDraftQuestionsChange(copy);
    if (editingDraftIndex === index) {
      resetForm();
    }
    showToast('Đã xóa câu hỏi khỏi bản nháp', 'info');
  };

  const handleAutoSortMOET = () => {
    if (draftingQuestions.length === 0) return;
    const sorted = sortQuestionsByMOETStructure(draftingQuestions);
    onDraftQuestionsChange(sorted);
    showToast('Đã tự động sắp xếp cấu trúc 3 phần (Phần I -> Phần II -> Phần III)!', 'success');
  };

  const handleParseRawText = () => {
    if (!rawText.trim()) {
      showToast('Vui lòng dán nội dung văn bản đề thi!', 'error');
      return;
    }

    // Split by Câu \d+:
    const blocks = rawText.split(/\n(?=Câu\s+\d+[:\.])/i);
    const parsedList: Question[] = [];

    blocks.forEach((block) => {
      if (!block.trim()) return;
      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      if (lines.length === 0) return;

      const firstLine = lines[0];
      const contentStr = firstLine.replace(/^Câu\s+\d+[:\.]\s*/i, '');

      const isTfBlock = lines.some((l) => /^[\(]?[a-d][\)\.]/i.test(l.trim()));

      if (isTfBlock) {
        // True/False question
        const statements = { a: '', b: '', c: '', d: '' };
        const corrects = {
          a: 'true' as 'true' | 'false',
          b: 'true' as 'true' | 'false',
          c: 'true' as 'true' | 'false',
          d: 'false' as 'true' | 'false',
        };

        lines.slice(1).forEach((l) => {
          const match = l.trim().match(/^[\(]?([a-d])[\)\.]\s*(.*)/i);
          if (match) {
            const key = match[1].toLowerCase() as 'a' | 'b' | 'c' | 'd';
            let text = match[2].trim();
            if (/\b(sai|false|s)\b/i.test(text)) {
              corrects[key] = 'false';
              text = text.replace(/[-:\*]\s*(sai|false|s)\s*$/i, '').trim();
            } else if (/\b(đúng|true|đ)\b/i.test(text)) {
              corrects[key] = 'true';
              text = text.replace(/[-:\*]\s*(đúng|true|đ)\s*$/i, '').trim();
            }
            statements[key] = text;
          }
        });

        parsedList.push({
          id: 'q-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
          type: 'tf',
          stem: '',
          content: contentStr,
          grade: '12',
          level: 'Thông hiểu',
          topic: 'Tổng hợp',
          statements,
          correctAnswers: corrects,
        });
      } else {
        // Multiple choice question
        const options = { A: '', B: '', C: '', D: '' };
        let correctAnswer = 'A';

        lines.slice(1).forEach((l) => {
          const trimmed = l.trim();
          const match = trimmed.match(/^[\(]?([A-D])[\)\.\:\-]\s*(.*)/i);
          if (match) {
            const key = match[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
            options[key] = match[2].trim();
          }
          if (/^\*?Đáp\s*án\s*[:\.]?\s*([A-D])/i.test(trimmed)) {
            const m = trimmed.match(/^\*?Đáp\s*án\s*[:\.]?\s*([A-D])/i);
            if (m) correctAnswer = m[1].toUpperCase();
          }
        });

        parsedList.push({
          id: 'q-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
          type: 'mc',
          stem: '',
          content: contentStr,
          grade: '12',
          level: 'Nhận biết',
          topic: 'Tổng hợp',
          options,
          correctAnswer,
        });
      }
    });

    if (parsedList.length === 0) {
      showToast('Không thể nhận diện câu hỏi từ văn bản. Vui lòng kiểm tra định dạng!', 'error');
      return;
    }

    onDraftQuestionsChange([...draftingQuestions, ...parsedList]);
    setRawText('');
    showToast(`Đã phân tích và thêm thành công ${parsedList.length} câu hỏi!`, 'success');
  };

  const insertSampleRaw = () => {
    setRawText(`Câu 1: Cho hàm số $y = f(x)$ có bảng biến thiên như sau. Mệnh đề nào dưới đây đúng?
A. Hàm số đồng biến trên khoảng $(-\\infty; 1)$
B. Hàm số nghịch biến trên khoảng $(1; +\\infty)$
C. Giá trị cực đại của hàm số bằng $3$
D. Hàm số đạt cực tiểu tại $x = 2$
*Đáp án: C

Câu 2: Một vật chuyển động thẳng với gia tốc $a(t) = 3t^2 + 2t$ (m/s²). Tìm vận tốc tại thời điểm $t = 2\\text{s}$ biết $v(0) = 4\\text{ m/s}$.
A. $v = 16\\text{ m/s}$
B. $v = 20\\text{ m/s}$
C. $v = 24\\text{ m/s}$
D. $v = 12\\text{ m/s}$
*Đáp án: A

Câu 3: Các khẳng định sau đây về số phức $z = 3 - 4i$ là Đúng hay Sai?
a) Phần thực của $z$ bằng $3$ - Đúng
b) Phần ảo của $z$ bằng $4$ - Sai
c) Mô đun của $z$ bằng $|z| = 5$ - Đúng
d) Số phức liên hợp là $\\bar{z} = -3 + 4i$ - Sai`);
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="w-5 h-5" />
            </span>
            <span>Soạn Thảo &amp; Tạo Đề Thi</span>
            <span className="text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full">
              Quyền Giáo Viên
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">
            Tạo câu hỏi thủ công hoặc Phân tích văn bản tự động, hỗ trợ công thức Toán LaTeX ($...$ và $$...$$).
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setCreateMode('form')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              createMode === 'form'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tạo Theo Form
          </button>
          <button
            onClick={() => setCreateMode('raw')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              createMode === 'raw'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Phân Tích Văn Bản
          </button>
        </div>
      </div>

      {/* FORM MODE */}
      {createMode === 'form' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
          {/* Question Type selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Dạng Câu Hỏi &amp; Phần Thi Tương Ứng
              </label>
              <span className="text-[11px] font-medium text-indigo-400">
                Đề thi chuẩn cấu trúc 3 phần: Phần I &rarr; Phần II &rarr; Phần III
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[
                { type: 'mc', part: 'PHẦN I', label: 'Trắc nghiệm ABCD', sub: 'Xáo trộn câu & phương án (A,B,C,D)' },
                { type: 'tf', part: 'PHẦN II', label: 'Trắc nghiệm Đúng/Sai', sub: 'Xáo trộn câu, KHÔNG xáo trộn ý a,b,c,d' },
                { type: 'short', part: 'PHẦN III', label: 'Trả lời ngắn', sub: 'Xáo trộn thứ tự các câu' },
                { type: 'essay', part: 'MỞ RỘNG', label: 'Tự luận', sub: 'Dàn ý & chấm điểm giáo viên' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setCurrentFmType(item.type as QuestionType)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    currentFmType === item.type
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-indigo-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      currentFmType === item.type
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-950 text-indigo-400 border border-indigo-500/30'
                    }`}>
                      {item.part}
                    </span>
                    {currentFmType === item.type && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="text-xs font-black">{item.label}</div>
                  <div className={`text-[10px] mt-0.5 leading-tight line-clamp-1 ${
                    currentFmType === item.type ? 'text-indigo-100' : 'text-slate-500'
                  }`}>
                    {item.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Meta Grade, Level, Topic */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Khối Lớp
              </label>
              <div className="flex gap-2">
                {(['10', '11', '12'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFmGrade(g)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                      fmGrade === g
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    Lớp {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Mức Độ Nhận Thức
              </label>
              <div className="flex gap-1.5">
                {(['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFmLevel(lvl)}
                    className={`flex-1 py-2 rounded-xl border text-[11px] font-bold transition-all ${
                      fmLevel === lvl
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {lvl.replace('Vận dụng cao', 'VDC')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Chủ Đề / Bài Học
              </label>
              <input
                type="text"
                value={fmTopic}
                onChange={(e) => setFmTopic(e.target.value)}
                placeholder="Ví dụ: Khảo Sát Hàm Số, Sóng Cơ..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Stem, Image, and Main Content - STRICT ORDER: 1. STEM -> 2. IMAGE -> 3. CONTENT */}
          <div className="space-y-4">
            {/* 1. Stem */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>1. Đoạn Văn Dẫn / Dữ Kiện Chung (Tùy chọn)</span>
                <span className="text-[10px] text-slate-500">Ngữ cảnh hoặc bảng biểu chung</span>
              </label>
              <textarea
                rows={2}
                value={fmStem}
                onChange={(e) => setFmStem(e.target.value)}
                placeholder="Ví dụ: Cho hàm số bậc ba $y = f(x)$ có bảng biến thiên như sau..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* 2. Image Attachment */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                2. Hình Ảnh Đính Kèm (Nếu có)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all">
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  <span>Chọn Ảnh Từ Máy</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />
                </label>

                {fmImage && (
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <img
                      src={fmImage}
                      alt="Uploaded preview"
                      className="h-10 w-10 object-cover rounded-lg border border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFmImage(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Main Question Content */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>3. Nội Dung Câu Hỏi * (Hỗ trợ $...$ LaTeX)</span>
                <span className="text-[10px] text-indigo-400">{"VD: $\\int_0^1 x^2 dx$ hoặc $\\sqrt{x-1}$"}</span>
              </label>
              <textarea
                rows={3}
                required
                value={fmContent}
                onChange={(e) => setFmContent(e.target.value)}
                placeholder="Nhập nội dung chính của câu hỏi... VD: Tìm tập xác định của hàm số $y = \sqrt{x-1}$"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Live LaTeX preview for question */}
            {fmContent && (
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Xem trước công thức:</p>
                <div className="text-sm font-semibold text-white">
                  <MathText text={fmContent} />
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Answer Inputs Container */}
          <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800/90 space-y-3">
            {currentFmType === 'mc' && (
              <>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  4 Tùy Chọn Lựa Chọn (Tích chọn phương án đúng)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <div
                      key={opt}
                      className={`flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border transition-all ${
                        fmMcCorrect === opt ? 'border-indigo-500/80 bg-indigo-950/20' : 'border-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="fmMcCorrect"
                        id={`optRadio_${opt}`}
                        value={opt}
                        checked={fmMcCorrect === opt}
                        onChange={() => setFmMcCorrect(opt)}
                        className="w-4 h-4 text-indigo-600 bg-slate-950 border-slate-700 cursor-pointer"
                      />
                      <label htmlFor={`optRadio_${opt}`} className="text-xs font-black text-indigo-400 cursor-pointer w-4">
                        {opt}.
                      </label>
                      <input
                        type="text"
                        value={fmMcOptions[opt]}
                        onChange={(e) =>
                          setFmMcOptions({ ...fmMcOptions, [opt]: e.target.value })
                        }
                        placeholder={`Nội dung phương án ${opt}`}
                        className="flex-1 bg-transparent text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {currentFmType === 'tf' && (
              <>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  4 Ý Khẳng Định (Chọn Đúng / Sai cho từng mệnh đề theo chuẩn Bộ GD&amp;ĐT)
                </label>
                <div className="space-y-2.5">
                  {(['a', 'b', 'c', 'd'] as const).map((opt) => (
                    <div
                      key={opt}
                      className="flex items-center gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800"
                    >
                      <span className="text-xs font-black text-indigo-400 uppercase w-5">{opt})</span>
                      <input
                        type="text"
                        value={fmTfStatements[opt]}
                        onChange={(e) =>
                          setFmTfStatements({ ...fmTfStatements, [opt]: e.target.value })
                        }
                        placeholder={`Nội dung mệnh đề ${opt}`}
                        className="flex-1 bg-transparent text-xs text-white focus:outline-none font-mono"
                      />
                      <select
                        value={fmTfCorrects[opt]}
                        onChange={(e) =>
                          setFmTfCorrects({
                            ...fmTfCorrects,
                            [opt]: e.target.value as 'true' | 'false',
                          })
                        }
                        className={`border rounded-xl px-3 py-1.5 text-xs font-black transition-colors ${
                          fmTfCorrects[opt] === 'true'
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                            : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                        }`}
                      >
                        <option value="true">Đúng</option>
                        <option value="false">Sai</option>
                      </select>
                    </div>
                  ))}
                </div>
              </>
            )}

            {currentFmType === 'short' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Đáp Án Chuẩn Của Câu Hỏi Trả Lời Ngắn
                </label>
                <input
                  type="text"
                  value={fmShortAnswer}
                  onChange={(e) => setFmShortAnswer(e.target.value)}
                  placeholder="Nhập giá trị hoặc từ khóa đáp án đúng... VD: 20 hoặc 3sqrt(2)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            )}

            {currentFmType === 'essay' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Hướng Dẫn Chấm / Gợi Ý Tự Luận
                </label>
                <textarea
                  rows={2}
                  value={fmEssayGuide}
                  onChange={(e) => setFmEssayGuide(e.target.value)}
                  placeholder="Nhập dàn ý chấm điểm chi tiết..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveQuestion}
              className="flex-1 min-w-[200px] bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3.5 px-6 rounded-2xl text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>{editingDraftIndex >= 0 ? 'CẬP NHẬT CÂU HỎI' : 'THÊM CÂU HỎI VÀO ĐỀ'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveToBankDirectly}
              className="flex-1 min-w-[220px] bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-6 rounded-2xl text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>LƯU VÀO NGÂN HÀNG HỆ THỐNG</span>
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>HỦY</span>
            </button>
          </div>
        </div>
      )}

      {/* RAW PARSER MODE */}
      {createMode === 'raw' && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Dán Văn Bản Đề Thi Đã Định Dạng
              </label>
              <p className="text-[11px] text-slate-500">
                Tự động nhận diện cú pháp: Câu 1, Câu 2..., A. B. C. D. hoặc mệnh đề a) b) c) d)
              </p>
            </div>
            <button
              type="button"
              onClick={insertSampleRaw}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold bg-indigo-950/40 border border-indigo-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mẫu Thử Nghiệm</span>
            </button>
          </div>

          <textarea
            rows={10}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`Câu 1: Mệnh đề nào sau đây đúng?
A. $1 + 1 = 2$
B. $2 + 2 = 5$
C. $3 + 3 = 7$
D. $4 + 4 = 9$
*Đáp án: A

Câu 2: Các khẳng định sau Đúng hay Sai?
a) $1 + 1 = 2$ - Đúng
b) $2 + 2 = 5$ - Sai`}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 custom-scrollbar leading-relaxed"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleParseRawText}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3.5 px-6 rounded-2xl text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 uppercase tracking-wide"
            >
              <Sparkles className="w-4 h-4" />
              <span>Phân Tích &amp; Thêm Vào Đề</span>
            </button>
          </div>
        </div>
      )}

      {/* DRAFTING QUESTIONS PREVIEW LIST */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Cấu Trúc &amp; Danh Sách Câu Hỏi Đang Soạn</span>
              <span className="text-xs font-bold bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/30 font-mono">
                Tổng {draftingQuestions.length} câu
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Đề thi tuân thủ cấu trúc 3 phần từ trên xuống dưới theo quy chuẩn Bộ GD&amp;ĐT.
            </p>
          </div>

          {draftingQuestions.length > 0 && (
            <button
              type="button"
              onClick={handleAutoSortMOET}
              className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white border border-indigo-500/40 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 shadow-sm"
              title="Tự động xếp Phần I (Trắc nghiệm ABCD) -> Phần II (Đúng/Sai) -> Phần III (Trả lời ngắn)"
            >
              <ListOrdered className="w-4 h-4 text-indigo-400" />
              <span>Sắp Xếp Chuẩn 3 Phần</span>
            </button>
          )}
        </div>

        {/* 3-Part Summary Badges */}
        {draftingQuestions.length > 0 && (() => {
          const { part1, part2, part3, part4 } = getExamParts(draftingQuestions);
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">PHẦN I: Trắc nghiệm ABCD</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Xáo câu &amp; xáo phương án (A,B,C,D)</div>
                </div>
                <span className="text-sm font-black font-mono bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2.5 py-1 rounded-xl">
                  {part1.length} câu
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">PHẦN II: Đúng / Sai</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Xáo câu, KHÔNG xáo ý a,b,c,d</div>
                </div>
                <span className="text-sm font-black font-mono bg-amber-950 text-amber-300 border border-amber-800/60 px-2.5 py-1 rounded-xl">
                  {part2.length} câu
                </span>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">PHẦN III: Trả lời ngắn</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Xáo trộn thứ tự các câu</div>
                </div>
                <span className="text-sm font-black font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2.5 py-1 rounded-xl">
                  {part3.length} câu
                </span>
              </div>
            </div>
          );
        })()}

        {draftingQuestions.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800 space-y-2">
            <HelpCircle className="w-8 h-8 text-slate-600 mx-auto opacity-50" />
            <p className="text-sm font-bold text-slate-400">Chưa có câu hỏi nào trong danh sách soạn thảo.</p>
            <p className="text-xs text-slate-500">
              Hãy nhập câu hỏi ở form phía trên hoặc dán văn bản để phân tích tự động.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {draftingQuestions.map((q, idx) => {
              // Check if this question starts a new part
              const prevQ = idx > 0 ? draftingQuestions[idx - 1] : null;
              const isFirstOfPart = !prevQ || prevQ.type !== q.type;

              let partHeader = null;
              if (isFirstOfPart) {
                if (q.type === 'mc') {
                  partHeader = (
                    <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 mt-6 first:mt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-black text-indigo-400 uppercase tracking-wider">
                          PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN (A, B, C, D)
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          Thí sinh chọn một phương án đúng duy nhất. Cho phép xáo trộn câu và xáo trộn 4 phương án (trình tự luôn giữ A, B, C, D).
                        </div>
                      </div>
                      <span className="text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2.5 py-1 rounded-lg self-start sm:self-auto font-mono">
                        0.25đ / câu
                      </span>
                    </div>
                  );
                } else if (q.type === 'tf') {
                  partHeader = (
                    <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-black text-amber-400 uppercase tracking-wider">
                          PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG / SAI (4 Ý a, b, c, d)
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          Trong mỗi ý a), b), c), d) chọn Đúng hoặc Sai. Cho phép xáo trộn câu, <strong className="text-amber-300">TUYỆT ĐỐI KHÔNG xáo trộn các ý trong mỗi câu</strong> (luôn giữ nguyên a, b, c, d).
                        </div>
                      </div>
                      <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg self-start sm:self-auto font-mono">
                        Tối đa 1.0đ / câu
                      </span>
                    </div>
                  );
                } else if (q.type === 'short') {
                  partHeader = (
                    <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                          PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          Thí sinh điền kết quả vào ô trống tương ứng. Cho phép xáo trộn thứ tự các câu hỏi.
                        </div>
                      </div>
                      <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg self-start sm:self-auto font-mono">
                        0.50đ / câu
                      </span>
                    </div>
                  );
                } else if (q.type === 'essay') {
                  partHeader = (
                    <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-4 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-black text-purple-400 uppercase tracking-wider">
                          PHẦN IV. CÂU HỎI TỰ LUẬN
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          Thí sinh làm bài tự luận theo yêu cầu.
                        </div>
                      </div>
                      <span className="text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded-lg self-start sm:self-auto font-mono">
                        Tự luận
                      </span>
                    </div>
                  );
                }
              }

              return (
                <React.Fragment key={q.id || idx}>
                  {partHeader}
                  <div
                    className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-3 relative hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-indigo-600 text-white font-black text-xs px-3 py-1 rounded-xl">
                          Câu {idx + 1}
                        </span>
                        <span className="text-[11px] font-bold bg-slate-800 text-indigo-300 px-2.5 py-1 rounded-xl uppercase">
                          {q.type === 'mc' ? 'Phần I (ABCD)' : q.type === 'tf' ? 'Phần II (Đ/S)' : q.type === 'short' ? 'Phần III (Ngắn)' : 'Tự luận'}
                        </span>
                        <span className="text-[11px] font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-xl">
                          {q.level}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">• {q.topic}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleMoveQuestion(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30"
                          title="Di chuyển lên"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveQuestion(idx, 'down')}
                          disabled={idx === draftingQuestions.length - 1}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30"
                          title="Di chuyển xuống"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicateQuestion(idx)}
                          className="p-1.5 rounded-lg bg-slate-800 text-indigo-300 hover:text-white"
                          title="Nhân bản câu này"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => loadQuestionToForm(q, idx)}
                          className="text-xs font-bold text-amber-400 px-2.5 py-1 bg-amber-950/40 hover:bg-amber-900/60 rounded-xl border border-amber-800/40 transition-all flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(idx)}
                          className="text-xs font-bold text-rose-400 px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 rounded-xl border border-rose-800/40 transition-all flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>

                    {/* STRICT ORDER: 1. STEM -> 2. IMAGE -> 3. CONTENT */}
                    {q.stem && (
                      <div className="text-xs text-slate-400 italic bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                        <MathText text={q.stem} />
                      </div>
                    )}

                    {q.image && (
                      <div>
                        <img
                          src={q.image}
                          alt="Question attachment"
                          className="max-h-48 rounded-xl border border-slate-800 my-1 object-contain"
                        />
                      </div>
                    )}

                    <div className="text-sm font-semibold text-white leading-relaxed">
                      <MathText text={q.content} />
                    </div>

                    {/* Multiple choice options */}
                    {q.type === 'mc' && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                          const optVal =
                            q.options?.[optKey] ?? (q.options as any)?.[optKey.toLowerCase()];
                          if (optVal === undefined || optVal === null) return null;
                          const isCorrect = q.correctAnswer === optKey;
                          return (
                            <div
                              key={optKey}
                              className={`p-2.5 rounded-xl border ${
                                isCorrect
                                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold'
                                  : 'bg-slate-950 border-slate-800 text-slate-300'
                              }`}
                            >
                              <span className="font-black text-indigo-400 mr-1.5">{optKey}.</span>
                              <MathText text={optVal} className="inline" />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* True/False statements */}
                    {q.type === 'tf' && q.statements && (
                      <div className="space-y-1.5 text-xs pt-1">
                        {(['a', 'b', 'c', 'd'] as const).map((stKey) => {
                          const stVal =
                            q.statements?.[stKey] ?? (q.statements as any)?.[stKey.toUpperCase()];
                          if (stVal === undefined || stVal === null) return null;
                          const isTrue =
                            (q.correctAnswers?.[stKey] ??
                              (q.correctAnswers as any)?.[stKey.toUpperCase()]) === 'true';
                          return (
                            <div
                              key={stKey}
                              className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800"
                            >
                              <div className="flex items-center gap-1.5 text-slate-200">
                                <strong className="text-indigo-400 lowercase w-4">{stKey})</strong>
                                <MathText text={stVal} className="inline" />
                              </div>
                              <span
                                className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                  isTrue
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {isTrue ? 'Đúng' : 'Sai'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'short' && (
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                        <span className="text-slate-400 font-bold">Đáp án đúng chuẩn: </span>
                        <strong className="text-emerald-400 font-mono font-bold">
                          {q.correctAnswer || '--'}
                        </strong>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}

            {/* BOTTOM PUBLISH & SAVE ACTIONS */}
            <div className="space-y-3 pt-4">
              <button
                type="button"
                onClick={onSaveAllToBank}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl text-sm transition-all shadow-xl shadow-emerald-600/20 uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <BookmarkPlus className="w-5 h-5" />
                <span>LƯU NGUYÊN ĐỀ VÀO NGÂN HÀNG HỆ THỐNG</span>
              </button>

              <button
                type="button"
                onClick={onOpenPublishModal}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black py-4 rounded-2xl text-base transition-all shadow-xl shadow-indigo-600/30 uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Rocket className="w-5 h-5" />
                <span>XUẤT BẢN ĐỀ THI</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
