'use client';

import { useState } from 'react';
import { bootstrapSuperAdmin } from './actions';
import { ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SetupSuperAdminPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSetup = async () => {
    setLoading(true);
    try {
      const result = await bootstrapSuperAdmin();
      if (result.error) {
        toast.error(result.error);
      } else {
        setSuccess(true);
        toast.success('Khởi tạo quyền Super Admin thành công!');
        // Refresh router so that the layout re-fetches the user and updates the sidebar
        router.refresh();
      }
    } catch (err) {
      toast.error('Có lỗi hệ thống xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-800 rounded-2xl shadow-xl border border-neutral-700 p-8 text-center">
        {success ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="h-20 w-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Thành Công!</h1>
            <p className="text-neutral-400 mb-8">
              Tài khoản của bạn đã được nâng cấp thành Super Admin. Tuy nhiên, bạn cần Đăng xuất và Đăng nhập lại để áp dụng phân quyền.
            </p>
            <button
              onClick={() => router.push('/dang-nhap')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Về trang Đăng nhập
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-6">
              <ShieldAlert className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Khởi Tạo Tháp Điều Khiển</h1>
            <p className="text-neutral-400 mb-8 text-sm">
              Hệ thống phát hiện đây là lần thiết lập đầu tiên. Nếu email của bạn khớp với thông số ROOT_ADMIN_EMAIL, bạn có thể tự động cấp quyền tối cao cho tài khoản của mình.
            </p>
            
            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang khởi tạo...
                </>
              ) : (
                'Kích Hoạt Quyền Root'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
