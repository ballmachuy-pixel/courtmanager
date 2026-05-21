'use client';

import { useState } from 'react';
import { toggleAcademyStatusAction } from '@/app/actions/super-admin';
import { Power, ShieldAlert } from 'lucide-react';

export default function ToggleAcademyStatus({ 
  academyId, 
  currentStatus, 
  academyName 
}: { 
  academyId: string; 
  currentStatus: string;
  academyName: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isActive = currentStatus === 'active';

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await toggleAcademyStatusAction(
        academyId, 
        currentStatus, 
        isActive ? 'Super Admin Suspended' : undefined
      );
      setShowConfirm(false);
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi thay đổi trạng thái.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        className={`p-2 rounded-lg transition-colors border ${
          isActive 
            ? 'text-red-400 border-red-500/20 hover:bg-red-500/10' 
            : 'text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'
        }`}
        title={isActive ? "Khóa Học Viện" : "Mở Khóa Học Viện"}
      >
        <Power size={16} />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${isActive ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isActive ? 'Khóa Học Viện?' : 'Mở Khóa Học Viện?'}
                </h3>
                <p className="text-sm text-white/50">{academyName}</p>
              </div>
            </div>

            <p className="text-white/70 text-sm mb-6 leading-relaxed">
              {isActive 
                ? 'Bạn có chắc muốn tạm ngưng học viện này? Phụ huynh, HLV và Quản lý sẽ không thể sử dụng ứng dụng cho đến khi được mở lại.'
                : 'Bạn có chắc muốn mở lại học viện này? Tất cả người dùng của học viện sẽ có thể truy cập lại hệ thống.'}
            </p>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5"
              >
                Hủy
              </button>
              <button 
                onClick={handleToggle}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                }`}
              >
                {isLoading ? 'Đang xử lý...' : (isActive ? 'Chấp nhận Khóa' : 'Chấp nhận Mở')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
