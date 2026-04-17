import { getParentPortalData } from '@/app/actions/parent';
import { XCircle } from 'lucide-react';
import Link from 'next/link';
import ParentHubContent from './ParentHubContent';

export default async function ParentPortalPage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const data = await getParentPortalData(params.token);

  if ('error' in data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
           <XCircle size={48} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-white mb-4">Liên kết không khả dụng</h1>
        <p className="text-slate-400 max-w-sm mb-10 leading-relaxed">
          {data.error}
        </p>
        <Link href="/" className="btn btn-secondary px-8 py-4 rounded-2xl font-bold">
           Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const { parent, students, attendances, academy } = data;

  return (
    <ParentHubContent 
      parent={parent}
      students={students}
      attendances={attendances}
      academy={academy}
    />
  );
}
