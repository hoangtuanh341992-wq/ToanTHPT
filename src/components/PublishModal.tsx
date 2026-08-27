import React, { useState, useEffect } from 'react';
import { Rocket, X, Shuffle, Clock, FileText, Sparkles } from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    title: string;
    code: string;
    duration: number;
    shuffleQs: boolean;
    shuffleOpts: boolean;
    description: string;
  }) => void;
  defaultQuestionCount: number;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  defaultQuestionCount,
}) => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [duration, setDuration] = useState(45);
  const [shuffleQs, setShuffleQs] = useState(true);
  const [shuffleOpts, setShuffleOpts] = useState(true);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setCode('EX-' + Math.floor(1000 + Math.random() * 9000));
      setDuration(45);
      setShuffleQs(true);
      setShuffleOpts(true);
      setDescription('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;

    onConfirm({
      title: title.trim(),
      code: code.trim().toUpperCase(),
      duration: Number(duration) || 45,
      shuffleQs,
      shuffleOpts,
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Xuất Bản Đề Thi Mới</h3>
              <p className="text-[11px] text-slate-400">Đang bao gồm {defaultQuestionCount} câu hỏi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-400 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tên Đề Thi *</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Đề Kiểm Tra Giữa Kỳ I - Toán 12"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 flex items-center justify-between">
                <span>Mã Đề Thi *</span>
                <button
                  type="button"
                  onClick={() => setCode('EX-' + Math.floor(1000 + Math.random() * 9000))}
                  className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  <Sparkles className="w-2.5 h-2.5" /> Tạo lại
                </button>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="EX-1234"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono font-bold uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Thời Gian (Phút)</span>
              </label>
              <input
                type="number"
                min="1"
                max="300"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Mô tả hoặc hướng dẫn làm bài</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Không sử dụng tài liệu, máy tính cầm tay được phép..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="space-y-2 pt-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={shuffleQs}
                onChange={(e) => setShuffleQs(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
              />
              <div className="flex items-center gap-1.5">
                <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Xáo trộn thứ tự câu hỏi cho mỗi học sinh</span>
              </div>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={shuffleOpts}
                onChange={(e) => setShuffleOpts(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>Xáo trộn thứ tự lựa chọn đáp án (A, B, C, D)</span>
            </label>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black py-3.5 rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              <Rocket className="w-4 h-4" />
              <span>XUẤT BẢN NGAY</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
            >
              HỦY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
