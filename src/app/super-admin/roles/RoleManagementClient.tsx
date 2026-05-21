'use client';

import { useState } from 'react';
import { addSuperAdmin, removeSuperAdmin } from './actions';
import { toast } from 'sonner';
import { Shield, Trash2, UserPlus, Loader2, AlertTriangle } from 'lucide-react';

interface AdminUser {
  id: string;
  email?: string;
  created_at: string;
  granted_by?: string;
}

export default function RoleManagementClient({ 
  admins, 
  currentUserId 
}: { 
  admins: AdminUser[];
  currentUserId: string;
}) {
  const [email, setEmail] = useState('');
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingRemoveId, setLoadingRemoveId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoadingAdd(true);
    try {
      const result = await addSuperAdmin(email);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Đã cấp quyền Super Admin thành công!');
        setEmail('');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra.');
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleRemove = async (id: string) => {
    setLoadingRemoveId(id);
    try {
      const result = await removeSuperAdmin(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Đã thu hồi quyền thành công!');
        setConfirmRemoveId(null);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra.');
    } finally {
      setLoadingRemoveId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Admin Form */}
      <div className="bg-neutral-800 rounded-2xl border border-neutral-700/50 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
          <UserPlus className="h-5 w-5 text-indigo-400" />
          Cấp Quyền Quản Trị
        </h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của người dùng (họ phải đăng nhập ít nhất 1 lần)..."
            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            required
          />
          <button
            type="submit"
            disabled={loadingAdd || !email}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loadingAdd ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Cấp Quyền'}
          </button>
        </form>
      </div>

      {/* Admin List */}
      <div className="bg-neutral-800 rounded-2xl border border-neutral-700/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-700/50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            Danh Sách Super Admin
          </h2>
          <span className="bg-neutral-900 text-neutral-400 px-3 py-1 rounded-full text-sm font-medium">
            {admins.length} thành viên
          </span>
        </div>
        
        <div className="divide-y divide-neutral-700/50">
          {admins.map((admin) => {
            const isMe = admin.id === currentUserId;
            const isLast = admins.length === 1;
            const canRemove = !isMe && !isLast;

            return (
              <div key={admin.id} className="p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors">
                <div>
                  <p className="text-white font-medium text-lg flex items-center gap-2">
                    {admin.email}
                    {isMe && <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Bạn</span>}
                  </p>
                  <p className="text-neutral-500 text-sm mt-1">
                    Cấp ngày: {new Date(admin.created_at).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {confirmRemoveId === admin.id ? (
                    <div className="flex items-center gap-2 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                      <span className="text-rose-400 text-sm font-medium px-2 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" /> Xác nhận xóa?
                      </span>
                      <button
                        onClick={() => setConfirmRemoveId(null)}
                        className="px-3 py-1.5 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleRemove(admin.id)}
                        disabled={loadingRemoveId === admin.id}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        {loadingRemoveId === admin.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Chắc chắn xóa'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRemoveId(admin.id)}
                      disabled={!canRemove}
                      title={!canRemove ? "Không thể tự xóa bản thân hoặc admin cuối cùng" : "Thu hồi quyền"}
                      className={`p-2 rounded-xl transition-all ${
                        canRemove 
                          ? 'text-neutral-400 hover:bg-rose-500/10 hover:text-rose-400' 
                          : 'text-neutral-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
