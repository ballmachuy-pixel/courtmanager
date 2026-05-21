import { BaseService, ServiceResult } from './base.service';

export interface StudentInput {
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  skillLevel: string;
  healthNotes?: string;
  avatarUrl: string | null;
  parentRelationship: string;
}

export interface ParentInput {
  fullName: string;
  phone: string;
}


export class StudentService extends BaseService {
  constructor(academyId: string) {
    super(academyId);
  }

  /**
   * Tìm hoặc tạo Phụ huynh dựa trên SĐT và academyId (Deduplication)
   */
  async getOrCreateParent(input: ParentInput): Promise<ServiceResult<string>> {
    try {
      const { data: existingParent } = await this.supabase
        .from('parents')
        .select('id')
        .eq('academy_id', this.academyId)
        .eq('phone', input.phone)
        .single();

      if (existingParent) {
        // Cập nhật tên nếu có thay đổi
        await this.supabase
          .from('parents')
          .update({ full_name: input.fullName })
          .eq('id', existingParent.id)
          .eq('academy_id', this.academyId);
        return this.result(existingParent.id);
      }

      const { data: newParent, error } = await this.supabase
        .from('parents')
        .insert({
          academy_id: this.academyId,
          full_name: input.fullName,
          phone: input.phone,
        })
        .select('id')
        .single();

      if (error || !newParent) throw error || new Error('Không thể tạo hồ sơ phụ huynh');
      return this.result(newParent.id);
    } catch (err: any) {
      return this.result(null, err);
    }
  }

  /**
   * Xử lý tạo mới học viên kèm ghi danh
   */
  async registerStudent(
    parentId: string,
    studentInput: StudentInput,
    classId?: string
  ): Promise<ServiceResult<any>> {
    try {
      // 1. Tạo học viên (Sử dụng insert thuần túy, không dùng upsert trên tên để tránh ghi đè)
      const { data: student, error: studentError } = await this.supabase
        .from('students')
        .insert({
          academy_id: this.academyId,
          parent_id: parentId,
          parent_relationship: studentInput.parentRelationship,
          full_name: studentInput.fullName,
          date_of_birth: studentInput.dateOfBirth || null,
          gender: studentInput.gender || null,
          skill_level: studentInput.skillLevel,
          health_notes: studentInput.healthNotes || null,
          avatar_url: studentInput.avatarUrl,
        })
        .select()
        .single();

      if (studentError || !student) throw studentError || new Error('Không thể thêm học viên');

      // 2. Ghi danh vào lớp (nếu có)
      if (classId) {
        const { error: enrollError } = await this.supabase
          .from('student_classes')
          .insert({
            student_id: student.id,
            class_id: classId
          });
        if (enrollError) console.error('Enrollment error:', enrollError);
      }

      return this.result(student);
    } catch (err: any) {
      return this.result(null, err);
    }
  }

  /**
   * Cập nhật hồ sơ học viên với đầy đủ bảo mật
   */
  async updateStudentProfile(
    studentId: string,
    updateData: Partial<StudentInput & { isActive: boolean; parentId: string }>
  ): Promise<ServiceResult<boolean>> {
    try {
      const dbData: any = {};
      if (updateData.fullName) dbData.full_name = updateData.fullName;
      if (updateData.parentId) dbData.parent_id = updateData.parentId;
      if (updateData.parentRelationship) dbData.parent_relationship = updateData.parentRelationship;
      if (updateData.dateOfBirth !== undefined) dbData.date_of_birth = updateData.dateOfBirth;
      if (updateData.gender !== undefined) dbData.gender = updateData.gender;
      if (updateData.skillLevel) dbData.skill_level = updateData.skillLevel;
      if (updateData.healthNotes !== undefined) dbData.health_notes = updateData.healthNotes;
      if (updateData.avatarUrl !== undefined) dbData.avatar_url = updateData.avatarUrl;
      if (typeof updateData.isActive === 'boolean') dbData.is_active = updateData.isActive;

      const { error } = await this.supabase
        .from('students')
        .update(dbData)
        .eq('id', studentId)
        .eq('academy_id', this.academyId);

      if (error) throw error;
      return this.result(true);
    } catch (err: any) {
      return this.result(false, err);
    }
  }

  /**
   * [V2] Logic xác định trạng thái VIP của học viên (Centralized Business Rule)
   * Dựa trên: total_enrollments >= 3 (Đăng ký từ 3 khóa học trở lên)
   */
  static calculateVIPStatus(totalEnrollments: number): { isVIP: boolean; score: number } {
    const score = totalEnrollments * 10; // Giả lập điểm số nếu cần sorting
    const isVIP = totalEnrollments >= 3;
    return { isVIP, score };
  }

  /**
   * Lấy danh sách học viên VIP (Dành cho anh Hưng)
   * Sử dụng cột Cache tĩnh `total_enrollments` thay vì N+1 queries.
   */
  async getTopVIPStudents(limit: number = 5): Promise<ServiceResult<any[]>> {
    try {
      const { data, error } = await this.supabase
        .from('students')
        .select(`
          id,
          full_name,
          avatar_url,
          total_enrollments
        `)
        .eq('academy_id', this.academyId)
        .eq('is_active', true)
        .gte('total_enrollments', 3) // Lọc VIP trực tiếp ở Database Level
        .order('total_enrollments', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const rankedStudents = (data || []).map(student => {
        const { isVIP, score } = StudentService.calculateVIPStatus(student.total_enrollments || 0);
        
        return {
          id: student.id,
          full_name: student.full_name,
          avatar_url: student.avatar_url,
          totalEnrollments: student.total_enrollments || 0,
          vipScore: score,
          isVIP
        };
      });

      return this.result(rankedStudents);
    } catch (err: any) {
      return this.result(null, err);
    }
  }

  /**
   * Lấy toàn bộ danh sách học viên của học viện.
   */
  async getAllStudents() {
    const { data, error } = await this.from('students')
      .select('*')
      .eq('academy_id', this.academyId)
      .order('full_name', { ascending: true });
    
    return this.result(data, error);
  }

  /**
   * Tìm kiếm học viên theo tên.
   */
  async searchStudents(query: string) {
    const { data, error } = await this.from('students')
      .select('*')
      .eq('academy_id', this.academyId)
      .ilike('full_name', `%${query}%`)
      .order('full_name', { ascending: true });

    return this.result(data, error);
  }
}
