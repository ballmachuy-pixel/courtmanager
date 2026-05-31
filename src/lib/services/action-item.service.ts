import { BaseService, ServiceResult } from './base.service';
import { ActionItem } from '@/types/database';

export class ActionItemService extends BaseService {
  constructor(academyId: string) {
    super(academyId);
  }

  async getPendingItems(): Promise<ServiceResult<ActionItem[]>> {
    try {
      const { data, error } = await this.from('action_items')
        .select(`
          *,
          students ( full_name )
        `)
        .eq('academy_id', this.academyId)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return this.result(data as ActionItem[]);
    } catch (err: unknown) {
      return this.result(null, err);
    }
  }

  async resolveItem(itemId: string, resolvedBy: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.from('action_items')
        .update({
          status: 'RESOLVED',
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy
        })
        .eq('id', itemId)
        .eq('academy_id', this.academyId);

      if (error) throw error;
      return this.result(null);
    } catch (err: unknown) {
      return this.result(null, err);
    }
  }

  /**
   * Called automatically when an attendance is marked as 'absent'.
   * Checks if the student has been absent for the last 3 sessions.
   * If yes, and no pending warning exists, creates an action item.
   */
  async checkAndCreateAbsenteeWarning(studentId: string): Promise<void> {
    try {
      // 1. Check if there's already a PENDING warning for this student
      const { data: existing } = await this.from('action_items')
        .select('id')
        .eq('academy_id', this.academyId)
        .eq('student_id', studentId)
        .eq('status', 'PENDING')
        .eq('type', 'ABSENTEE_WARNING')
        .maybeSingle();
      
      if (existing) return; // Already tracking, no need to create another

      // 2. Fetch the last 3 attendance records for this student
      const { data: last3Attendances } = await this.from('attendances')
        .select('status, date')
        .eq('academy_id', this.academyId)
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(3);

      if (!last3Attendances || last3Attendances.length < 3) return;

      const isConsecutiveAbsent = last3Attendances.every(a => a.status === 'absent');

      if (isConsecutiveAbsent) {
        // Create action item
        await this.from('action_items').insert({
          academy_id: this.academyId,
          student_id: studentId,
          type: 'ABSENTEE_WARNING',
          title: 'Vắng 3 buổi liên tiếp',
          description: 'Học sinh đã vắng mặt 3 buổi học liên tiếp. Vui lòng gọi điện hỏi thăm phụ huynh.',
          status: 'PENDING'
        });
      }
    } catch (error) {
      console.error('[ActionItemService] Error checking absentee warning:', error);
    }
  }
}
