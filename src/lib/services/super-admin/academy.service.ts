import { BaseService } from '../base.service';

/**
 * AcademyService (Super Admin) — Quản lý danh sách và cấp phát học viện.
 * Chạy với quyền Admin (Bypass RLS) để quản trị toàn hệ thống.
 */
export class AcademyService extends BaseService {
  constructor() {
    // Super Admin Service không bị giới hạn bởi academyId của chính nó
    // Nhưng vẫn kế thừa BaseService để dùng các helper.
    super('SYSTEM'); 
  }

  /**
   * Lấy danh sách tất cả học viện trong hệ thống (Control Tower V3).
   */
  async getAllAcademies() {
    const { data, error } = await this.supabase
      .from('academies')
      // Lấy thông tin cơ bản, bỏ các subquery nặng nếu không cần thiết
      .select('*, students(count), classes(count)')
      .order('created_at', { ascending: false });
    
    const formattedData = data?.map(academy => ({
      ...academy,
      _stats: {
        studentsCount: academy.students?.[0]?.count || 0,
        classesCount: academy.classes?.[0]?.count || 0,
      }
    }));

    return this.result(formattedData, error);
  }

  /**
   * Thay đổi trạng thái khóa/mở khóa học viện (Suspend/Active).
   */
  async toggleAcademyStatus(academyId: string, currentStatus: string, reason?: string) {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      const { data, error } = await this.supabase
        .from('academies')
        .update({ 
          access_status: newStatus,
          suspended_at: newStatus === 'suspended' ? new Date().toISOString() : null,
          suspended_reason: newStatus === 'suspended' ? (reason || 'Admin suspended') : null
        })
        .eq('id', academyId)
        .select()
        .single();

      if (error) throw error;
      return this.result(data);
    } catch (err: unknown) {
      return this.result(null, err);
    }
  }

  /**
   * Lấy số liệu thống kê tổng quan toàn hệ thống.
   */
  async getSystemStats() {
    try {
      // Chạy các truy vấn đếm song song để tối ưu hiệu suất
      const [academies, students, classes] = await Promise.all([
        this.supabase.from('academies').select('*', { count: 'exact', head: true }),
        this.supabase.from('students').select('*', { count: 'exact', head: true }),
        this.supabase.from('classes').select('*', { count: 'exact', head: true })
      ]);

      return this.result({
        totalAcademies: academies.count || 0,
        totalStudents: students.count || 0,
        totalClasses: classes.count || 0,
        activeRate: 100 // Tạm thời để 100%, có thể tính toán thêm sau
      });
    } catch (err: unknown) {
      return this.result(null, err);
    }
  }

  /**
   * Khởi tạo một học viện mới (Provisioning).
   */
  async createAcademy(input: { name: string; slug: string; ownerEmail: string }) {
    try {
      // 1. Tạo bản ghi Academy
      const { data: academy, error: academyError } = await this.supabase
        .from('academies')
        .insert({
          name: input.name,
          slug: input.slug,
          settings: {
            onboarding_completed: false,
            timezone: 'Asia/Ho_Chi_Minh'
          }
        })
        .select()
        .single();

      if (academyError) throw academyError;

      // 2. (Optional) Gán quyền cho Owner hoặc khởi tạo dữ liệu mẫu
      // Ở đây chúng ta có thể thêm các bước khởi tạo Role/Permission nếu cần.

      return this.result(academy);
    } catch (err: any) {
      return this.result(null, err);
    }
  }
}
