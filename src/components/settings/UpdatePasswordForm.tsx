'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lock, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';

export default function UpdatePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu nhập lại không khớp' });
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'Cập nhật mật khẩu thành công!' });
      setFormData({ password: '', confirmPassword: '' });
    } catch (err: unknown) {
      const error = err as { message?: string };
      setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra khi đổi mật khẩu' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message.text}
        </div>
      )}

      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pink-500 transition-colors">
          <Lock size={18} />
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Mật khẩu mới"
          required
          minLength={6}
          className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-3 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pink-500 transition-colors">
          <KeyRound size={18} />
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Nhập lại mật khẩu mới"
          required
          minLength={6}
          className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-3 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-3 font-bold flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all text-sm disabled:opacity-50 disabled:active:scale-100"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : 'Cập nhật mật khẩu'}
        </button>
      </div>
    </form>
  );
}
