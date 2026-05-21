import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-10 h-10 text-amber-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-800">Dịch vụ tạm ngưng</h1>
          <p className="text-slate-600 leading-relaxed">
            Hệ thống hiện tạm thời không khả dụng. Vui lòng liên hệ Hotline Học viện của bạn để được hỗ trợ.
          </p>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
            Quay lại trang Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
