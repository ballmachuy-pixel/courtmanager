import { BaseService, ServiceResult } from './base.service';
import { AcademyLocation } from '@/types/database';

export interface AcademyProfile {
  name: string;
  slug: string;
  logo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  allowed_radius_m: number | null;
  settings: any;
}

/**
 * AcademyService — Quản lý thông tin cấu hình của từng học viện.
 * Scope: Tenant-level (Academy Admin/Owner).
 */
export class AcademyService extends BaseService {
  constructor(academyId: string) {
    super(academyId);
  }

  /**
   * Lấy thông tin chi tiết của học viện hiện tại.
   */
  async getProfile() {
    const { data, error } = await this.from('academies')
      .select('*')
      .eq('id', this.academyId)
      .single();
    
    return this.result(data as AcademyProfile, error);
  }

  /**
   * Cập nhật thông tin cấu hình học viện.
   */
  async updateProfile(updates: Partial<AcademyProfile>) {
    const { data, error } = await this.from('academies')
      .update(updates)
      .eq('id', this.academyId)
      .select()
      .single();

    return this.result(data, error);
  }

  /**
   * Lấy danh sách tất cả các sân tập của học viện.
   */
  async getLocations(): Promise<ServiceResult<AcademyLocation[]>> {
    const { data, error } = await this.from('academy_locations')
      .select('*')
      .eq('academy_id', this.academyId)
      .order('name', { ascending: true });

    return this.result(data as AcademyLocation[], error);
  }

  /**
   * Thêm hoặc cập nhật một sân tập.
   */
  async upsertLocation(location: Partial<AcademyLocation>): Promise<ServiceResult<AcademyLocation>> {
    const { data, error } = await this.from('academy_locations')
      .upsert({
        ...location,
        academy_id: this.academyId
      })
      .select()
      .single();

    return this.result(data as AcademyLocation, error);
  }

  /**
   * Xóa một sân tập.
   */
  async deleteLocation(locationId: string): Promise<ServiceResult<void>> {
    const { error } = await this.from('academy_locations')
      .delete()
      .eq('id', locationId)
      .eq('academy_id', this.academyId);

    return this.result(undefined, error);
  }

  /**
   * Kiểm tra tiến độ thiết lập học viện (Onboarding Checklist).
   */
  async getOnboardingProgress() {
    try {
      const { data: academy } = await this.getProfile();
      
      const [members, classes, schedules] = await Promise.all([
        this.supabase.from('academy_members').select('id', { count: 'exact', head: true }).eq('academy_id', this.academyId),
        this.supabase.from('classes').select('id', { count: 'exact', head: true }).eq('academy_id', this.academyId),
        this.supabase.from('schedules').select('id', { count: 'exact', head: true }).eq('class_id', this.supabase.from('classes').select('id').eq('academy_id', this.academyId))
      ]);

      const tasks = [
        {
          id: 'branding',
          title: 'Thiết lập thương hiệu',
          description: 'Cập nhật logo và thông tin học viện',
          completed: !!(academy?.logo_url && academy?.name),
          link: '/settings'
        },
        {
          id: 'geofencing',
          title: 'Cấu hình vị trí sân',
          description: 'Thiết lập tọa độ GPS để giới hạn điểm danh',
          completed: !!(academy?.latitude && academy?.longitude),
          link: '/settings'
        },
        {
          id: 'staff',
          title: 'Thêm nhân sự/HLV',
          description: 'Mời các huấn luyện viên tham gia hệ thống',
          completed: (members.count || 0) > 1, // Ít nhất có 1 người khác ngoài Owner
          link: '/staff'
        },
        {
          id: 'classes',
          title: 'Tạo lớp học đầu tiên',
          description: 'Thiết lập các lớp học và lịch dạy',
          completed: (classes.count || 0) > 0,
          link: '/classes'
        }
      ];

      const completedCount = tasks.filter(t => t.completed).length;
      const progressPercent = Math.round((completedCount / tasks.length) * 100);

      return this.result({
        tasks,
        progressPercent,
        isCompleted: progressPercent === 100
      });
    } catch (err: any) {
      return this.result(null, err);
    }
  }
}
