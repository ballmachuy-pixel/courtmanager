import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cổng Phụ Huynh | CourtManager',
  description: 'Theo dõi điểm danh và học phí của học viên.',
};

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-950 min-h-screen selection:bg-pink-500/30">
      {children}
    </div>
  );
}
