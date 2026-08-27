import React, { useState } from 'react';
import { Question } from '../types';
import { MathText } from '../utils/mathRenderer';
import { Database, X, Plus, Edit2, Trash2, Search, Filter, BookOpen } from 'lucide-react';

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  bank: Question[];
  onAddToDraft: (q: Question) => void;
  onEditInDraft: (q: Question) => void;
  onDelete: (index: number) => void;
  onSaveEntireBankToDraft?: () => void;
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  isOpen,
  onClose,
  bank,
  onAddToDraft,
  onEditInDraft,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  if (!isOpen) return null;

  const filteredQuestions = bank.map((q, originalIndex) => ({ q, originalIndex })).filter(({ q }) => {
    const matchesSearch =
      (q.content && q.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (q.topic && q.topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (q.stem && q.stem.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGrade = selectedGrade === 'all' || q.grade === selectedGrade;
    const matchesType = selectedType === 'all' || q.type === selectedType;

    return matchesSearch && matchesGrade && matchesType;
  });

  const getTypeName = (type: string) => {
    switch (type) {
      case 'mc':
        return 'Trắc nghiệm ABCD';
      case 'tf':
        return 'Đúng / Sai';
      case 'short':
        return 'Trả lời ngắn';
      case 'essay':
        return 'Tự luận';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 max-w-4xl w-full rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] flex flex-col relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Ngân Hàng Câu Hỏi Hệ Thống</h3>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 font-mono font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  {bank.length} câu
                </span>
              </div>
              <p className="text-xs text-slate-400">Kho lưu trữ câu hỏi sẵn sàng đưa vào các đề kiểm tra</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm kiếm nội dung, chủ đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Tất cả khối lớp</option>
              <option value="10">Khối Lớp 10</option>
              <option value="11">Khối Lớp 11</option>
              <option value="12">Khối Lớp 12</option>
            </select>
          </div>
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Tất cả dạng câu hỏi</option>
              <option value="mc">Trắc nghiệm ABCD</option>
              <option value="tf">Trắc nghiệm Đúng/Sai</option>
              <option value="short">Trả lời ngắn</option>
              <option value="essay">Tự luận</option>
            </select>
          </div>
        </div>

        {/* List of questions */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 min-h-[300px]">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-16 text-slate-500 font-semibold text-xs border border-dashed border-slate-800 rounded-2xl">
              <BookOpen className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
              <span>Không tìm thấy câu hỏi nào phù hợp với bộ lọc.</span>
            </div>
          ) : (
            filteredQuestions.map(({ q, originalIndex }) => (
              <div
                key={q.id || originalIndex}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 hover:border-slate-700/80 transition-all space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="bg-indigo-600/30 text-indigo-300 font-bold text-[10px] px-2.5 py-0.5 rounded-lg uppercase tracking-wider border border-indigo-500/30">
                      {getTypeName(q.type)}
                    </span>
                    <span className="bg-slate-800 text-slate-300 font-semibold text-[10px] px-2 py-0.5 rounded-lg">
                      Lớp {q.grade}
                    </span>
                    <span className="bg-slate-800 text-slate-300 font-semibold text-[10px] px-2 py-0.5 rounded-lg">
                      {q.level}
                    </span>
                    <span className="text-slate-400 text-xs font-semibold ml-1">
                      • {q.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onAddToDraft(q)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Vào Đề</span>
                    </button>
                    <button
                      onClick={() => onEditInDraft(q)}
                      className="bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/40 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1"
                      title="Nạp vào form để sửa"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(originalIndex)}
                      className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1"
                      title="Xóa khỏi ngân hàng"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 1. Stem */}
                {q.stem && (
                  <div className="text-xs text-slate-400 italic bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/60">
                    <MathText text={q.stem} />
                  </div>
                )}

                {/* 2. Image */}
                {q.image && (
                  <div>
                    <img
                      src={q.image}
                      alt="Question illustration"
                      className="max-h-40 max-w-full rounded-xl border border-slate-800 object-contain my-1"
                    />
                  </div>
                )}

                {/* 3. Main Question Content */}
                <div className="text-xs font-semibold text-white">
                  <MathText text={q.content} />
                </div>

                {/* Options display */}
                {q.type === 'mc' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {Object.entries(q.options).map(([optKey, optVal]) => {
                      const isCorrect = q.correctAnswer === optKey;
                      return (
                        <div
                          key={optKey}
                          className={`p-2 rounded-xl border text-xs ${
                            isCorrect
                              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 font-semibold'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="font-bold text-indigo-400 mr-1.5">{optKey}.</span>
                          <MathText text={optVal} className="inline" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === 'tf' && q.statements && (
                  <div className="space-y-1 text-xs pt-1">
                    {Object.entries(q.statements).map(([stKey, stVal]) => {
                      const ansVal = q.correctAnswers?.[stKey as 'a' | 'b' | 'c' | 'd'];
                      return (
                        <div
                          key={stKey}
                          className="flex items-center justify-between bg-slate-900/60 p-2 rounded-xl border border-slate-800"
                        >
                          <div className="flex items-center gap-1 text-slate-200">
                            <span className="font-bold text-indigo-400 uppercase w-4">{stKey})</span>
                            <MathText text={stVal} className="inline" />
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              ansVal === 'true'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {ansVal === 'true' ? 'Đúng' : 'Sai'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === 'short' && (
                  <div className="text-xs text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <span>Đáp án chuẩn: </span>
                    <strong className="text-emerald-400 font-mono">{q.correctAnswer || '--'}</strong>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
