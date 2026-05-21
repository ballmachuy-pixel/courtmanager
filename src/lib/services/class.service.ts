import { BaseService, ServiceResult } from './base.service';

export class ClassService extends BaseService {
  constructor(academyId: string) {
    super(academyId);
  }

  /**
   * Lấy danh sách lớp học của học viện.
   */
  async getClasses() {
    const { data, error } = await this.from('classes')
      .select('id, name')
      .order('name');
    return this.result(data, error);
  }

  /**
   * Tạo lớp học mới và gán HLV mặc định.
   */
  async createClass(input: {
    name: string;
    ageGroup?: string;
    skillLevel?: string;
    maxStudents: number;
    coachIds: string[];
  }) {
    try {
      const primaryCoachId = input.coachIds.length > 0 ? input.coachIds[0] : null;

      const { data: clazz, error: classError } = await this.from('classes')
        .insert({
          academy_id: this.academyId,
          name: input.name,
          age_group: input.ageGroup || null,
          skill_level: input.skillLevel || null,
          max_students: input.maxStudents,
          head_coach_id: primaryCoachId,
        })
        .select()
        .single();

      if (classError || !clazz) throw classError || new Error('Không thể tạo lớp học');

      if (input.coachIds.length > 0) {
        const classCoaches = input.coachIds.map(id => ({
          class_id: clazz.id,
          coach_id: id
        }));
        await this.supabase.from('class_default_coaches').insert(classCoaches);
      }

      return this.result(clazz);
    } catch (err: any) {
      return this.result(null, err);
    }
  }

  /**
   * Cập nhật thông tin lớp học.
   */
  async updateClass(classId: string, input: {
    name: string;
    ageGroup?: string;
    skillLevel?: string;
    maxStudents: number;
    coachIds: string[];
  }) {
    try {
      const primaryCoachId = input.coachIds.length > 0 ? input.coachIds[0] : null;

      const { error: updateError } = await this.from('classes')
        .update({
          name: input.name,
          age_group: input.ageGroup || null,
          skill_level: input.skillLevel || null,
          max_students: input.maxStudents,
          head_coach_id: primaryCoachId,
        })
        .eq('id', classId);

      if (updateError) throw updateError;

      // Cập nhật Mapping HLV mặc định
      await this.supabase.from('class_default_coaches').delete().eq('class_id', classId);
      if (input.coachIds.length > 0) {
        const classCoaches = input.coachIds.map(id => ({
          class_id: classId,
          coach_id: id
        }));
        await this.supabase.from('class_default_coaches').insert(classCoaches);
      }

      return this.result(true);
    } catch (err: any) {
      return this.result(false, err);
    }
  }

  /**
   * Ghi danh học viên vào lớp.
   */
  async enrollStudents(studentIds: string[], classId: string) {
    try {
      const inserts = studentIds.map(id => ({
        student_id: id,
        class_id: classId
      }));

      const { error } = await this.supabase.from('student_classes').insert(inserts);
      if (error) {
        if (error.code === '23505') throw new Error('Một số học viên đã ở trong lớp này rồi');
        throw error;
      }
      return this.result(true);
    } catch (err: any) {
      return this.result(false, err);
    }
  }

  /**
   * Thêm lịch học mới.
   */
  async addSchedules(input: {
    classId: string;
    dayOfWeekValues: number[];
    startTime: string;
    endTime: string;
    location: string;
    locationId?: string;
    coachIds: string[];
  }) {
    try {
      const primaryCoachId = input.coachIds.length > 0 ? input.coachIds[0] : null;

      const inserts = input.dayOfWeekValues.map(day => ({
        class_id: input.classId,
        day_of_week: day,
        start_time: input.startTime,
        end_time: input.endTime,
        location: input.location || null,
        location_id: input.locationId || null,
        assigned_coach_id: primaryCoachId
      }));

      const { data: newSchedules, error } = await this.supabase
        .from('schedules')
        .insert(inserts)
        .select('id');

      if (error || !newSchedules) throw error || new Error('Không thể thêm lịch học');

      if (input.coachIds.length > 0) {
        const coachMappings = newSchedules.flatMap(s => 
          input.coachIds.map(coachId => ({
            schedule_id: s.id,
            coach_id: coachId
          }))
        );
        await this.supabase.from('schedule_coaches').insert(coachMappings);
      }

      return this.result(newSchedules);
    } catch (err: any) {
      return this.result(null, err);
    }
  }
}
