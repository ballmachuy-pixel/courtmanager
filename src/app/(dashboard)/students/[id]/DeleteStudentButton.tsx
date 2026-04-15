'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteStudent } from '@/app/actions/student';
import { useRouter } from 'next/navigation';

export default function DeleteStudentButton({ studentId }: { studentId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa học viên này? Thao tác này không thể hoàn tác.')) {
      return;
    }

    setLoading(true);
    const res = await deleteStudent(studentId);
    
    if (res?.error) {
      alert(res.error);
      setLoading(false);
    } else {
      router.push('/students');
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-3 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-lg shadow-red-500/5 disabled:opacity-50"
      title="Xóa học viên"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
      <span className="hidden sm:inline">Xóa</span>
    </button>
  );
}
