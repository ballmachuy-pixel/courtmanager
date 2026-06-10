import { BaseService } from './base.service';

export type NotificationChannel = 'sms' | 'zalo' | 'email' | 'system';

export interface NotificationLog {
  id?: string;
  student_id: string;
  parent_id: string;
  type: 'low_balance' | 'attendance' | 'payment_received';
  channel: NotificationChannel;
  content: string;
  status: 'sent' | 'failed' | 'pending';
}

/**
 * NotificationService — Quản lý thông báo tự động.
 */
export class NotificationService extends BaseService {
  constructor(academyId: string) {
    super(academyId);
  }

  /**
   * Kích hoạt cảnh báo số dư thấp gửi cho phụ huynh.
   */
  async triggerLowBalanceAlert(studentId: string, remainingSessions: number) {
    try {
      // 1. Lấy thông tin phụ huynh và học viên
      const { data: student, error: studentError } = await this.from('students')
        .select('full_name, parent_id, parents(full_name, phone)')
        .eq('id', studentId)
        .eq('academy_id', this.academyId)
        .single();

      if (studentError || !student || !student.parent_id) return;

      const parentData = Array.isArray(student.parents) ? student.parents[0] : student.parents;
      const parentName = (parentData as { full_name?: string })?.full_name || 'Phụ huynh';
      const studentName = student.full_name;
      
      // 2. Soạn nội dung (Template)
      let content = '';
      if (remainingSessions === 1) {
        content = `[CourtManager] Chào ${parentName}, con ${studentName} vừa hoàn thành buổi tập. Hiện con chỉ còn 1 buổi học cuối, anh/chị vui lòng gia hạn gói học phí để con không bị gián đoạn nhé. Trân trọng!`;
      } else if (remainingSessions === 0) {
        content = `[CourtManager] Chào ${parentName}, con ${studentName} đã học hết số buổi trong gói. Anh/chị vui lòng đăng ký gói mới để con tiếp tục tập luyện vào buổi tới nhé. Trân trọng!`;
      }

      if (!content) return;

      // 3. Ghi log vào hệ thống (Mô phỏng việc gửi tin)
      const { error: logError } = await this.from('notification_logs')
        .insert({
          academy_id: this.academyId,
          student_id: studentId,
          parent_id: student.parent_id,
          type: 'low_balance',
          channel: 'system',
          content: content,
          status: 'sent'
        });

      if (logError) {
        console.warn('Failed to log notification:', logError.message);
      }

      // MÔ PHỎNG: Gọi API Zalo/SMS thực tế tại đây
      console.log(`[NOTIFICATION SENT to ${(parentData as { phone?: string })?.phone}]: ${content}`);

      return { success: true };
    } catch (err) {
      console.error('Notification Error:', err);
    }
  }

  /**
   * Kích hoạt Zalo ZNS / SMS báo cáo kết quả điểm danh cho phụ huynh
   */
  async triggerAttendanceZaloZNS(studentId: string, status: 'present' | 'absent' | 'late' | 'excused', date: string) {
    try {
      const { data: student, error: studentError } = await this.from('students')
        .select('full_name, parent_id, parents(full_name, phone)')
        .eq('id', studentId)
        .eq('academy_id', this.academyId)
        .single();

      if (studentError || !student || !student.parent_id) return;

      const parentData = Array.isArray(student.parents) ? student.parents[0] : student.parents;
      const parentName = (parentData as { full_name?: string })?.full_name || 'Phụ huynh';
      const studentName = student.full_name;
      
      let statusText = '';
      switch (status) {
        case 'present': statusText = 'ĐÃ CÓ MẶT'; break;
        case 'absent': statusText = 'VẮNG MẶT'; break;
        case 'late': statusText = 'ĐẾN TRỄ'; break;
        case 'excused': statusText = 'VẮNG CÓ PHÉP'; break;
      }

      // Template Zalo ZNS
      const content = `[Zalo ZNS - CourtManager] Chào ${parentName}, hệ thống ghi nhận bé ${studentName} ${statusText} tại buổi học ngày ${date}. Cảm ơn anh/chị đã đồng hành!`;

      // Lưu log hệ thống
      await this.from('notification_logs').insert({
        academy_id: this.academyId,
        student_id: studentId,
        parent_id: student.parent_id,
        type: 'attendance',
        channel: 'zalo',
        content: content,
        status: 'sent'
      });

      console.log(`[ZALO ZNS SENT to ${(parentData as { phone?: string })?.phone}]: ${content}`);
      return { success: true };
    } catch (err) {
      console.error('Zalo Notification Error:', err);
    }
  }

  /**
   * Gửi cảnh báo hệ thống (Telegram/Discord webhook mô phỏng)
   */
  async sendSystemAlert(message: string) {
    try {
      console.log(`[TELEGRAM ALERT]: ${message}`);
      // MÔ PHỎNG: Trong thực tế sẽ gọi API Telegram/Discord tại đây
      return { success: true };
    } catch (err) {
      console.error('Failed to send system alert:', err);
    }
  }
}
