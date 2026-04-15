import { createAdminClient } from '@/lib/supabase/service';
import { getCurrentAcademyId } from '@/lib/server-utils';
import { redirect } from 'next/navigation';
import { Info } from 'lucide-react';
import AttendanceManager from '@/components/attendance/AttendanceManager';

export default async function AttendancePage() {
  const academyId = await getCurrentAcademyId();
  if (!academyId) return redirect('/dang-nhap');

  const supabase = createAdminClient();

  const { data: classes, error } = await supabase
    .from('classes')
    .select(`
      id, 
      name,
      schedules ( day_of_week )
    `)
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching classes:', error);
  }

  return (
    <div className="animate-in flex flex-col gap-8 attendance-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Điểm danh</h1>
          <p className="text-slate-500 mt-1">Lưu ý: Bạn chỉ có thể điểm danh trong vòng 7 ngày gần nhất.</p>
        </div>
      </div>

      {(!classes || classes.length === 0) && (
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-xl text-sm flex gap-3 items-start animate-in fade-in">
          <Info size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">💡 Hướng dẫn dành cho người mới:</p>
            <p>Trang Điểm danh hoạt động hoàn toàn tự động! Để bắt đầu, bạn cần phải <strong>Tạo Lớp học</strong> và thêm học viên vào đó trước. Khi có lớp học, danh sách sẽ tự động xuất hiện ở đây.</p>
          </div>
        </div>
      )}

      <AttendanceManager classes={classes || []} />
    </div>
  );
}
