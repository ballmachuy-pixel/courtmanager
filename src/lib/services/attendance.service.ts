/**
 * AttendanceService — Core attendance business logic.
 *
 * Extracted from actions/attendance.ts per Architecture Document:
 * "Logic nghiệp vụ không được rò rỉ ra ngoài thư mục services."
 *
 * This service is framework-agnostic and testable without Next.js context.
 */

import { getICTDateString } from '@/lib/utils';
import { BaseService, ServiceResult } from './base.service';
import { NotificationService } from './notification.service';
import { ActionItemService } from './action-item.service';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AttendanceInput {
  studentId: string;
  classId: string;
  scheduleId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  note?: string;
}

export interface AttendanceValidationResult {
  isValid: boolean;
  error?: string;
  finalNote: string | null;
  isBackfill: boolean;
}



/**
 * Validate attendance date:
 *  - Cannot be in the future
 *  - Cannot be more than 7 days in the past
 *  - Auto-tags backfill entries
 */
export function validateAttendanceDate(
  date: string,
  note?: string
): AttendanceValidationResult {
  const todayStr = getICTDateString();

  // Future check
  if (date > todayStr) {
    return {
      isValid: false,
      error: 'Không thể điểm danh cho ngày trong tương lai.',
      finalNote: null,
      isBackfill: false,
    };
  }

  // 7-day limit check (Sử dụng chuỗi ngày để so sánh, tránh lệch múi giờ đối tượng Date)
  const targetTime = new Date(date).getTime();
  const currentTime = new Date(todayStr).getTime();
  const diffTime = Math.abs(currentTime - targetTime);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 7) {
    return {
      isValid: false,
      error: 'Chỉ có thể điểm danh bù trong vòng 7 ngày gần nhất.',
      finalNote: null,
      isBackfill: false,
    };
  }

  // Backfill tagging
  const isBackfill = date < todayStr;
  const finalNote = isBackfill
    ? `[Điểm danh bù] ${note || ''}`.trim()
    : note || null;

  return {
    isValid: true,
    finalNote,
    isBackfill,
  };
}

export class AttendanceService extends BaseService {
  constructor(academyId: string) {
    super(academyId);
  }

// ─── Write Operations ─────────────────────────────────────────────────────────

  /**
   * Common upsert logic for both Admin and Coach portals.
   * Ensures multi-tenant isolation via academyId.
   */
  async upsertAttendanceRecord(
    input: AttendanceInput,
    markedBy: string
  ): Promise<ServiceResult<Record<string, unknown>>> {
    try {
      // 1. Kiểm tra trạng thái cũ để quyết định cộng/trừ buổi học
      const { data: oldRecord } = await this.from('attendances')
        .select('status')
        .eq('academy_id', this.academyId)
        .eq('student_id', input.studentId)
        .eq('schedule_id', input.scheduleId)
        .eq('date', input.date)
        .single();

      // 🛡️ GUARD: Nếu trạng thái không đổi, không làm gì cả để tránh trừ tiền 2 lần
      if (oldRecord?.status === input.status) {
        return this.result({ success: true, message: 'No change' });
      }

      // 2. Thực hiện Upsert bản ghi điểm danh
      const { data, error } = await this.from('attendances')
        .upsert({
          academy_id: this.academyId,
          student_id: input.studentId,
          class_id: input.classId,
          schedule_id: input.scheduleId,
          date: input.date,
          status: input.status,
          note: input.note || null,
          marked_by: markedBy
        }, { onConflict: 'student_id, schedule_id, date' })
        .select()
        .single();

      if (error) throw error;

      // 3. Logic xử lý số dư buổi học (Session Balance)
      const isPresent = (s: string) => ['present', 'late'].includes(s);
      
      // Trường hợp A: Từ CHƯA CÓ MẶT -> CÓ MẶT (Trừ 1 buổi)
      if (isPresent(input.status) && (!oldRecord?.status || !isPresent(oldRecord.status))) {
        const { error: rpcError } = await this.supabase.rpc('decrement_student_balance', { 
          p_student_id: input.studentId, 
          p_amount: 1 
        });

        if (rpcError) {
          console.error('[AttendanceService] RPC Error:', rpcError);
          return this.result(null, rpcError);
        }

        // Tự động gửi thông báo nếu số buổi còn lại thấp
        const { data: updatedStudent } = await this.from('students')
          .select('session_balance')
          .eq('academy_id', this.academyId)
          .eq('id', input.studentId)
          .single();
        
        if (updatedStudent && updatedStudent.session_balance <= 1) {
          const notificationService = new NotificationService(this.academyId);
          await notificationService.triggerLowBalanceAlert(input.studentId, updatedStudent.session_balance);
        }
      } 
      // Trường hợp B: Từ CÓ MẶT -> VẮNG MẶT (Hoàn lại 1 buổi)
      else if (!isPresent(input.status) && oldRecord?.status && isPresent(oldRecord.status)) {
        await this.supabase.rpc('increment_student_balance', { 
          p_student_id: input.studentId, 
          p_amount: 1 
        });
      }

      // 4. Cập nhật nhịp tim Học viện (Dùng cho Control Tower V3)
      // Chỉ update khi lưu thành công, bất kể trạng thái nào.
      await this.supabase
        .from('academies')
        .update({ last_attendance_at: new Date().toISOString() })
        .eq('id', this.academyId);

      // 5. Kiểm tra tự động hóa CSKH: Vắng mặt 3 buổi liên tiếp
      if (input.status === 'absent') {
        const actionService = new ActionItemService(this.academyId);
        // Chạy ngầm (không await) để tránh làm chậm response của API điểm danh
        actionService.checkAndCreateAbsenteeWarning(input.studentId).catch(console.error);
      }

      // 6. Tích hợp Gửi Zalo ZNS thông báo Điểm danh (Phase 2 - Step 3)
      const notificationService = new NotificationService(this.academyId);
      // Chạy ngầm không await để hệ thống trả về response ngay lập tức
      notificationService.triggerAttendanceZaloZNS(input.studentId, input.status, input.date).catch(console.error);

      return this.result(data);
    } catch (err: unknown) {
      return this.result(null, err);
    }
  }

  /**
   * Điểm danh hàng loạt (Bulk) an toàn, đảm bảo chạy qua logic trừ/cộng buổi học.
   */
  async upsertBulkAttendance(
    inputs: Omit<AttendanceInput, 'note'>[],
    markedBy: string
  ): Promise<ServiceResult<{ successCount: number }>> {
    let successCount = 0;
    // Xử lý tuần tự để đảm bảo an toàn cho Transaction/RPC của từng học viên
    // (Có thể tối ưu bằng Promise.all nếu DB pool đủ lớn, nhưng chạy tuần tự an toàn hơn cho logic tính tiền)
    for (const input of inputs) {
      const res = await this.upsertAttendanceRecord({ ...input, note: 'Điểm danh nhanh' }, markedBy);
      if (res.data || res.success) {
        successCount++;
      }
    }
    return this.result({ successCount });
  }

  /**
   * Xử lý Hoàn buổi học khi Hủy Ca (Cancel Session)
   * Quét tất cả các điểm danh 'present'/'late' của ca này và chuyển thành 'excused' để hoàn lại tiền.
   */
  async handleCancelledSession(scheduleId: string, date: string, cancelledBy: string): Promise<ServiceResult<{ refundedCount: number }>> {
    try {
      // 1. Lấy tất cả các học viên đã được điểm danh là CÓ MẶT trong ca này
      const { data: attendances } = await this.from('attendances')
        .select('student_id, class_id')
        .eq('academy_id', this.academyId)
        .eq('schedule_id', scheduleId)
        .eq('date', date)
        .in('status', ['present', 'late']);

      let refundedCount = 0;
      if (attendances && attendances.length > 0) {
        for (const att of attendances) {
          // 2. Gọi hàm upsert để chuyển trạng thái thành 'excused' (hệ thống sẽ tự gọi RPC hoàn buổi)
          await this.upsertAttendanceRecord({
            studentId: att.student_id as string,
            classId: att.class_id as string,
            scheduleId: scheduleId,
            date: date,
            status: 'excused',
            note: 'Hệ thống tự động: Ca học bị hủy'
          }, cancelledBy);
          refundedCount++;
        }
      }
      return this.result({ refundedCount });
    } catch (err: unknown) {
      return this.result(null, err);
    }
  }

// ─── Read Operations ──────────────────────────────────────────────────────────

  /**
   * Lấy dữ liệu điểm danh chi tiết của một buổi học
   */
  async getAttendanceDetails(
    scheduleId: string,
    date: string
  ): Promise<ServiceResult<{ students: Record<string, unknown>[]; attendances: Record<string, unknown>[]; trials?: Record<string, unknown>[] }>> {
    try {
      // 1. Lấy thông tin Class từ Schedule (đảm bảo thuộc academyId)
      const { data: schedule, error: scheduleError } = await this.supabase
        .from('schedules')
        .select('class_id, classes!inner(academy_id)')
        .eq('id', scheduleId)
        .eq('classes.academy_id', this.academyId)
        .single();

      if (scheduleError || !schedule) throw new Error('Không tìm thấy lịch học hoặc không có quyền truy cập');

      // 2. Lấy danh sách học viên của lớp đó kèm số dư buổi học
      const { data: enrolled, error: enrollError } = await this.supabase
        .from('student_classes')
        .select('students(id, full_name, avatar_url, session_balance)')
        .eq('class_id', schedule.class_id);

      if (enrollError) throw enrollError;

      // 3. Lấy dữ liệu điểm danh
      const { data: attendances, error: attendanceError } = await this.supabase
        .from('attendances')
        .select('*')
        .eq('schedule_id', scheduleId)
        .eq('date', date)
        .eq('academy_id', this.academyId);

      if (attendanceError) throw attendanceError;

      // 4. Lấy danh sách bé học thử
      const { data: trialRequests, error: trialError } = await this.supabase
        .from('trial_requests')
        .select('id, trial_date, status, coach_evaluation, leads(id, student_name, parent_phone)')
        .eq('schedule_id', scheduleId)
        .eq('trial_date', date);

      if (trialError) throw trialError;

      return this.result({
        students: (enrolled?.map((e: any) => e.students) || []) as Record<string, unknown>[],
        attendances: (attendances || []) as Record<string, unknown>[],
        trials: (trialRequests || []) as Record<string, unknown>[]
      });
    } catch (err: unknown) {
      return this.result(null, err);
    }
  }

  /**
   * Lấy tóm tắt điểm danh theo danh sách Schedule IDs
   */
  async getSchedulesSummary(
    scheduleIds: string[],
    date: string
  ): Promise<ServiceResult<Record<string, unknown>[]>> {
    try {
      if (!scheduleIds.length) return this.result([]);

      // 1. Lấy danh sách schedule và class_id tương ứng
      const { data: schedules, error: scheduleError } = await this.supabase
        .from('schedules')
        .select('id, class_id, classes!inner(academy_id)')
        .in('id', scheduleIds)
        .eq('classes.academy_id', this.academyId);

      if (scheduleError) throw scheduleError;

      const classIds = schedules?.map(s => s.class_id) || [];

      // 2. Đếm tổng số học viên từng lớp và số đã điểm danh
      const [{ data: enrolled }, { data: marked }] = await Promise.all([
        this.supabase
          .from('student_classes')
          .select('class_id')
          .in('class_id', classIds),
        this.supabase
          .from('attendances')
          .select('schedule_id')
          .in('schedule_id', scheduleIds)
          .eq('date', date)
          .eq('academy_id', this.academyId),
      ]);

      const totalPerClass: Record<string, number> = {};
      for (const row of enrolled || []) {
        totalPerClass[row.class_id] = (totalPerClass[row.class_id] || 0) + 1;
      }

      const markedPerSchedule: Record<string, number> = {};
      for (const row of marked || []) {
        markedPerSchedule[row.schedule_id] = (markedPerSchedule[row.schedule_id] || 0) + 1;
      }

      const result = schedules?.map(s => ({
        scheduleId: s.id,
        total: totalPerClass[s.class_id] || 0,
        marked: markedPerSchedule[s.id] || 0,
      })) || [];

      return this.result(result);
    } catch (err: unknown) {
      return this.result(null, err);
    }
  }

  /**
   * Lấy dữ liệu biểu đồ phân tích điểm danh 7 ngày
   */
  async getAttendanceAnalytics(): Promise<ServiceResult<Record<string, unknown>[]>> {
    try {
      // Lấy dữ liệu 7 ngày gần nhất
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
      }

      const startDate = dates[0];
      const endDate = dates[dates.length - 1];

      const { data: attendances, error } = await this.supabase
        .from('attendances')
        .select('date, status')
        .eq('academy_id', this.academyId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      // Group data by date
      const chartData = dates.map(date => {
        const dayAttendances = attendances.filter(a => a.date === date);
        return {
          date: date.split('-').slice(1).reverse().join('/'), // Format DD/MM
          present: dayAttendances.filter(a => ['present', 'late'].includes(a.status)).length,
          absent: dayAttendances.filter(a => a.status === 'absent').length,
        };
      });

      return this.result(chartData);
    } catch (err: unknown) {
      return this.result(null, err);
    }
  }
}

