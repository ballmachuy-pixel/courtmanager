import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createAdminClient } from '../src/lib/supabase/service';
import { getICTDateString, getDayOfWeekICT } from '../src/lib/utils';
import { AttendanceService } from '../src/lib/services/attendance.service';

async function main() {
  const supabase = createAdminClient();
  console.log('Bắt đầu kiểm tra luồng điểm danh HLV chéo...');

  // 1. Tìm Academy New Line
  const { data: academy } = await supabase.from('academies').select('id, name').ilike('name', '%New Line%').limit(1).single();
  if (!academy) return console.error('Không tìm thấy Academy nào');
  console.log('1. Academy:', academy.name);

  // 2. Lấy 2 HLV để test
  const { data: coaches } = await supabase
    .from('academy_members')
    .select('id, display_name')
    .eq('academy_id', academy.id)
    .eq('role', 'coach')
    .limit(2);
  
  if (!coaches || coaches.length < 2) return console.error('Cần ít nhất 2 HLV để test');
  const coachA = coaches[0];
  const coachB = coaches[1];
  console.log('2. HLV A (Lead):', coachA.display_name, '| HLV B (Phụ):', coachB.display_name);

  // 3. Tìm 1 lớp học bất kỳ có học sinh
  const { data: classData } = await supabase
    .from('classes')
    .select('id, name')
    .eq('academy_id', academy.id)
    .limit(1)
    .single();

  if (!classData) return console.error('Không tìm thấy Lớp học nào');
  console.log('3. Lớp học test:', classData.name);

  // Tìm học sinh
  const { data: studentClass } = await supabase
    .from('student_classes')
    .select('student_id')
    .eq('class_id', classData.id)
    .limit(1)
    .single();
  
  if (!studentClass) return console.error('Lớp này không có học sinh');
  console.log('   - Học sinh test ID:', studentClass.student_id);

  // 4. Tìm hoặc tạo lịch học hôm nay
  const today = getDayOfWeekICT();
  let { data: schedule } = await supabase
    .from('schedules')
    .select('id')
    .eq('class_id', classData.id)
    .eq('day_of_week', today)
    .limit(1)
    .single();

  if (!schedule) {
    console.log('   - Không có lịch hôm nay, tạo lịch tạm...');
    const { data: newSchedule } = await supabase.from('schedules').insert({
      class_id: classData.id,
      day_of_week: today,
      start_time: '18:00',
      end_time: '19:30',
      assigned_coach_id: coachA.id
    }).select('id').single();
    schedule = newSchedule;
  }
  if (!schedule) return console.error('Không thể tạo lịch học');
  console.log('4. Ca học test ID:', schedule.id);

  // 5. GIẢ LẬP: Thầy A tự Check-in (GPS)
  console.log('\n--- BƯỚC 1: THẦY A CHECK-IN ---');
  await supabase.from('staff_checkins').insert({
    academy_id: academy.id,
    schedule_id: schedule.id,
    coach_id: coachA.id,
    is_valid: true,
    notes: 'Test: Thầy A tự check-in GPS'
  });
  console.log('✅ Đã tạo bản ghi Check-in cho Thầy A');

  // 6. GIẢ LẬP: Thầy A check-in cho Thầy B
  console.log('\n--- BƯỚC 2: THẦY A BẢO LÃNH CHO THẦY B ---');
  await supabase.from('staff_checkins').insert({
    academy_id: academy.id,
    schedule_id: schedule.id,
    coach_id: coachB.id,
    is_valid: true,
    notes: `Được bảo lãnh bởi HLV Trưởng: ${coachA.display_name}`
  });
  console.log('✅ Đã tạo bản ghi Check-in cho Thầy B (bảo lãnh bởi Thầy A)');

  // 7. Xác nhận DB có 2 bản ghi Check-in
  const { data: checkins } = await supabase
    .from('staff_checkins')
    .select('coach_id, notes')
    .eq('schedule_id', schedule.id)
    .order('created_at', { ascending: false })
    .limit(2);
  console.log('   -> Kết quả Check-in DB:', checkins);

  // 8. GIẢ LẬP: Thầy A điểm danh học sinh
  console.log('\n--- BƯỚC 3: THẦY A ĐIỂM DANH HỌC SINH ---');
  const attendanceService = new AttendanceService(academy.id);
  const dateStr = getICTDateString();
  const res = await attendanceService.upsertAttendanceRecord(
    {
      studentId: studentClass.student_id,
      classId: classData.id,
      scheduleId: schedule.id,
      date: dateStr,
      status: 'present'
    },
    coachA.id
  );
  if (res.error) {
    console.error('❌ Lỗi điểm danh học sinh:', res.error);
  } else {
    console.log('✅ Đã điểm danh thành công cho học sinh (Trừ buổi)');
  }

  // 9. Dọn dẹp Test Data (để không ảnh hưởng dữ liệu thật)
  console.log('\n--- DỌN DẸP DỮ LIỆU TEST ---');
  await supabase.from('staff_checkins').delete().in('coach_id', [coachA.id, coachB.id]).eq('schedule_id', schedule.id);
  await attendanceService.upsertAttendanceRecord(
    {
      studentId: studentClass.student_id,
      classId: classData.id,
      scheduleId: schedule.id,
      date: dateStr,
      status: 'absent' // Trả lại buổi
    },
    coachA.id
  );
  await supabase.from('attendances').delete().eq('student_id', studentClass.student_id).eq('schedule_id', schedule.id).eq('date', dateStr);
  console.log('✅ Đã dọn dẹp sạch sẽ!');
}

main().catch(console.error);
