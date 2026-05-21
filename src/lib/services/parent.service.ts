import { BaseService } from './base.service';

/**
 * ParentService — Xử lý các nghiệp vụ dành riêng cho Phụ huynh (Public/Token-based).
 */
export class ParentService extends BaseService {
  constructor() {
    // Không cần academyId vì truy vấn dựa trên Token toàn cục
    super('');
  }

  /**
   * Lấy danh sách con em dựa trên mã truy cập bí mật của phụ huynh.
   */
  async getChildrenByToken(token: string) {
    const { data: parent, error: parentError } = await this.supabase
      .from('parents')
      .select('id, full_name, academy_id')
      .eq('access_token', token)
      .single();

    if (parentError || !parent) return this.result(null, new Error('Mã truy cập không hợp lệ.'));

    const { data: students, error: studentError } = await this.supabase
      .from('students')
      .select('*, academy_members(role)')
      .eq('parent_id', parent.id)
      .eq('academy_id', parent.academy_id);

    if (studentError) return this.result(null, studentError);

    return this.result({
      parent,
      students
    });
  }

  /**
   * Lấy thông tin chi tiết một học viên (dành cho phụ huynh xem).
   */
  async getChildDetail(token: string, studentId: string) {
    const { data: parent } = await this.supabase
      .from('parents')
      .select('id')
      .eq('access_token', token)
      .single();

    if (!parent) return this.result(null, new Error('Unauthorized'));

    const { data: student, error } = await this.supabase
      .from('students')
      .select(`
        *,
        academies(name, logo_url, settings),
        skill_assessments(*)
      `)
      .eq('id', studentId)
      .eq('parent_id', parent.id) // 🛡️ BẢO MẬT: Chỉ cho phép xem nếu học viên thuộc về phụ huynh này
      .single();

    return this.result(student, error);
  }
}
