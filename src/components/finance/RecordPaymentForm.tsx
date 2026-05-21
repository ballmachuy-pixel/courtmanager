'use client';

import { useState } from 'react';
import { recordPaymentAction } from '@/app/actions/finance';

interface Student {
  id: string;
  display_name: string;
}

interface TuitionPackage {
  id: string;
  name: string;
  price: number;
}

interface RecordPaymentFormProps {
  students: Student[];
  packages: TuitionPackage[];
}

export default function RecordPaymentForm({ students, packages }: RecordPaymentFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [amount, setAmount] = useState(0);

  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pkgId = e.target.value;
    setSelectedPackageId(pkgId);
    const pkg = packages.find(p => p.id === pkgId);
    if (pkg) setAmount(pkg.price);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="rounded-xl bg-purple-600 px-6 py-3 font-bold text-white shadow-xl shadow-purple-500/20 transition-all hover:bg-purple-500 hover:scale-105 active:scale-95"
      >
        + Lập phiếu thu
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg animate-in zoom-in-95 duration-200 rounded-3xl border border-white/10 bg-[#0f0f0f] p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Lập phiếu thu mới</h2>
          <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white text-2xl">&times;</button>
        </div>

        <form action={async (formData) => {
          const res = await recordPaymentAction(formData);
          if (res.success) {
            setIsOpen(false);
            alert('Đã ghi nhận phiếu thu thành công!');
          } else {
            alert(res.error);
          }
        }} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/40">Chọn học viên</label>
            <select name="studentId" required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-purple-500/50">
              <option value="">-- Chọn học viên --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.display_name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">Gói học phí</label>
              <select 
                name="packageId" 
                value={selectedPackageId}
                onChange={handlePackageChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-purple-500/50"
              >
                <option value="">-- Thu lẻ / Khác --</option>
                {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">Số tiền (VNĐ)</label>
              <input 
                name="amount" 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                required 
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-purple-500/50 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">Ngày thu</label>
              <input 
                name="paymentDate" 
                type="date" 
                defaultValue={new Date().toISOString().split('T')[0]}
                required 
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-purple-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">Hình thức</label>
              <select name="paymentMethod" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-purple-500/50">
                <option value="transfer">Chuyển khoản</option>
                <option value="cash">Tiền mặt</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/40">Ghi chú</label>
            <textarea name="description" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-purple-500/50 h-20 resize-none" />
          </div>

          <button type="submit" className="w-full rounded-2xl bg-purple-600 py-4 font-bold text-white shadow-xl shadow-purple-500/20 transition-all hover:bg-purple-500">
            Xác nhận thu tiền
          </button>
        </form>
      </div>
    </div>
  );
}
