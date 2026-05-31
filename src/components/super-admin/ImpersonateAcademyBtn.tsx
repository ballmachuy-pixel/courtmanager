'use client';

import { useState } from 'react';
import { impersonateAcademy } from '@/app/super-admin/impersonate-actions';
import { ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ImpersonateAcademyBtn({ academyId }: { academyId: string }) {
  const [loading, setLoading] = useState(false);

  const handleImpersonate = async () => {
    setLoading(true);
    try {
      await impersonateAcademy(academyId);
    } catch (error: unknown) {
      toast.error('Không thể truy cập: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleImpersonate}
      disabled={loading}
      title="Truy cập Dashboard của Học viện này"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <ExternalLink size={14} />
      )}
      <span>Truy cập</span>
    </button>
  );
}
