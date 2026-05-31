import { BaseService, ServiceResult } from './base.service';
import { getICTStartOfDayUTC } from '@/lib/utils';

export class StaffService extends BaseService {
  constructor(academyId: string) {
    super(academyId);
  }

  /**
   * Tạo nhân viên mới (HLV, Admin, v.v.)
   */
  async createStaff(input: {
    displayName: string;
    phone?: string;
    role: string;
  }) {
    const { data, error } = await this.from('academy_members')
      .insert({
        academy_id: this.academyId,
        display_name: input.displayName,
        phone: input.phone || null,
        role: input.role,
        is_active: true
      })
      .select()
      .single();

    return this.result(data, error);
  }

  /**
   * Lấy ID thành viên của Coach từ User ID hoặc Session Token.
   */
  async resolveMemberId(userId?: string): Promise<string | null> {
    if (!userId) return null;
    
    const { data } = await this.from('academy_members')
      .select('id')
      .eq('user_id', userId)
      .eq('academy_id', this.academyId)
      .single();
    
    return data?.id || null;
  }

  /**
   * Xử lý Check-in cho nhân viên/HLV.
   */
  async processCheckin(input: {
    memberId: string;
    scheduleId?: string;
    latitude: number | null;
    longitude: number | null;
    isValid: boolean;
    distance?: number | null;
    notes?: string;
  }) {
    try {
      // Chống trùng lặp trong cùng một ngày cho cùng một ca học
      const todayStart = getICTStartOfDayUTC();
      const { data: existing } = await this.supabase
        .from('staff_checkins')
        .select('id')
        .eq('coach_id', input.memberId)
        .eq('schedule_id', input.scheduleId || null)
        .gte('created_at', todayStart.toISOString())
        .single();

      if (existing) return this.result({ alreadyExists: true });

      const { data, error } = await this.supabase
        .from('staff_checkins')
        .insert({
          academy_id: this.academyId,
          schedule_id: input.scheduleId || null,
          coach_id: input.memberId,
          latitude: input.latitude,
          longitude: input.longitude,
          distance_m: input.distance ? Math.round(input.distance) : null,
          is_valid: input.isValid,
          notes: input.notes
        })
        .select()
        .single();

      return this.result(data, error);
    } catch (err: unknown) {
      return this.result(null, err);
    }
  }

  /**
   * Lấy danh sách nhân viên của học viện.
   */
  async getStaffList() {
    const { data, error } = await this.from('academy_members')
      .select('*')
      .eq('academy_id', this.academyId)
      .neq('is_active', false)
      .order('display_name');
    return this.result(data, error);
  }
}
