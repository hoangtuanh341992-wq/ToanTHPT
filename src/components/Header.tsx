import React from 'react';
import {
  Database,
  Lock,
  GraduationCap,
  UserCheck,
  Wifi,
  WifiOff,
  ShieldCheck,
  Cloud,
  Users,
  Shield,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { UserAccount } from '../types';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: 'take' | 'create' | 'manage' | 'results') => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  bankCount: number;
  onOpenBank: () => void;
  isOnline?: boolean;
  currentUser?: UserAccount | null;
  onOpenTeacherManagement?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  isAdmin,
  onToggleAdmin,
  bankCount,
  onOpenBank,
  isOnline = true,
  currentUser = null,
  onOpenTeacherManagement,
  onLogout,
}) => {
  const isSuperAdmin = currentUser?.role === 'super_admin';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none group"
          onClick={() => onTabChange('take')}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg bg-gradient-to-r from-indigo-300 via-indigo-100 to-purple-300 bg-clip-text text-transparent tracking-tight">
                DORETA&apos;S EXAM
              </h1>
              {!isOnline ? (
                <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <WifiOff className="w-2.5 h-2.5" />
                  <span>Ngoại tuyến (Offline)</span>
                </span>
              ) : (
                <span className="hidden lg:inline-flex items-center gap-1 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm" title="Dữ liệu được đồng bộ trực tuyến thời gian thực qua Cloud Firestore">
                  <Cloud className="w-3 h-3 text-indigo-400 animate-pulse" />
                  <span>Cloud Đồng Bộ Trực Tuyến</span>
                </span>
              )}
            </div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest hidden sm:block">
              Hệ Thống Quản Lý &amp; Thi Trực Tuyến
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800/90 shadow-inner">
          <button
            onClick={() => onTabChange('take')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'take'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Phòng Thi
          </button>

          <button
            onClick={() => onTabChange('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'create'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>Soạn Đề Thi</span>
            {!isAdmin && <Lock className="w-3 h-3 text-amber-400/80" />}
          </button>

          <button
            onClick={() => onTabChange('manage')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'manage'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>Quản Lý Đề</span>
            {!isAdmin && <Lock className="w-3 h-3 text-amber-400/80" />}
          </button>

          <button
            onClick={() => onTabChange('results')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentTab === 'results'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>Báo Cáo &amp; Điểm</span>
            {!isAdmin && <Lock className="w-3 h-3 text-amber-400/80" />}
          </button>
        </nav>

        {/* Actions (Bank & Role Toggle / User Profile) */}
        <div className="flex items-center gap-2">
          {/* Question Bank Trigger */}
          <button
            onClick={onOpenBank}
            className="relative bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:border-indigo-500/50"
            title="Mở Ngân hàng câu hỏi"
          >
            <Database className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Ngân Hàng Đề</span>
            <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {bankCount}
            </span>
          </button>

          {/* Super Admin Manage Teachers Button */}
          {isAdmin && isSuperAdmin && onOpenTeacherManagement && (
            <button
              onClick={onOpenTeacherManagement}
              className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Quản lý danh sách giáo viên, phân quyền và cấp mật khẩu riêng"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline">DS Giáo Viên</span>
            </button>
          )}

          {/* Admin Role Toggle / User Profile Button */}
          <button
            onClick={onToggleAdmin}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 border ${
              isAdmin
                ? isSuperAdmin
                  ? 'bg-amber-950/50 border-amber-500/40 text-amber-300 hover:bg-amber-900/60 shadow-md shadow-amber-950/40'
                  : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60 shadow-md shadow-indigo-950/50'
                : 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800 hover:border-slate-700'
            }`}
            title={isAdmin ? (currentUser ? `Đang đăng nhập: ${currentUser.displayName} (@${currentUser.username})` : 'Tài khoản Giáo viên') : 'Chuyển sang chế độ Giáo viên'}
          >
            {isAdmin ? (
              <>
                {isSuperAdmin ? (
                  <Shield className="w-4 h-4 text-amber-400" />
                ) : (
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                )}
                <span className="font-extrabold max-w-[100px] truncate sm:max-w-none">
                  {currentUser ? currentUser.displayName.split(' ').slice(-1)[0] : 'Giáo Viên'}
                </span>
                {isSuperAdmin && (
                  <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded font-black hidden sm:inline">
                    ADMIN
                  </span>
                )}
              </>
            ) : (
              <>
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span className="font-extrabold">Học Sinh</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-950/90 border-t border-slate-800 px-2 py-1.5 text-[11px] font-bold">
        <button
          onClick={() => onTabChange('take')}
          className={`py-1.5 px-2.5 rounded-lg transition-colors ${
            currentTab === 'take' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          Phòng Thi
        </button>
        <button
          onClick={() => onTabChange('create')}
          className={`py-1.5 px-2.5 rounded-lg flex items-center gap-1 transition-colors ${
            currentTab === 'create' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <span>Soạn Đề</span>
          {!isAdmin && <Lock className="w-2.5 h-2.5 text-amber-400" />}
        </button>
        <button
          onClick={() => onTabChange('manage')}
          className={`py-1.5 px-2.5 rounded-lg flex items-center gap-1 transition-colors ${
            currentTab === 'manage' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <span>Quản Lý</span>
          {!isAdmin && <Lock className="w-2.5 h-2.5 text-amber-400" />}
        </button>
        <button
          onClick={() => onTabChange('results')}
          className={`py-1.5 px-2.5 rounded-lg flex items-center gap-1 transition-colors ${
            currentTab === 'results' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <span>Kết Quả</span>
          {!isAdmin && <Lock className="w-2.5 h-2.5 text-amber-400" />}
        </button>
      </div>
    </header>
  );
};
