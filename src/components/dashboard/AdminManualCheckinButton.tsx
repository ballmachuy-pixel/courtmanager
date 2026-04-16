'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import AdminManualCheckinModal from './AdminManualCheckinModal';

interface AdminManualCheckinButtonProps {
  schedule: any;
  coaches: any[];
}

export default function AdminManualCheckinButton({ schedule, coaches }: AdminManualCheckinButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 px-4 py-2 sm:py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
        title="Chấm công hộ (Admin)"
      >
        <ShieldCheck size={14} />
        Chấm công hộ
      </button>

      {showModal && (
        <AdminManualCheckinModal 
          schedule={schedule}
          coaches={coaches}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
