import { BaseService } from './base.service';

export interface SkillScore {
  skill_id: string;
  skill_name: string;
  score: number; // 1-10
}

export interface AssessmentRecord {
  id?: string;
  student_id: string;
  assessed_by: string;
  assessment_date: string;
  notes: string | null;
  scores: SkillScore[];
}

/**
 * ProgressService — Quản lý sự tiến bộ và đánh giá kỹ năng học viên.
 */
export class ProgressService extends BaseService {
  constructor(academyId: string) {
    super(academyId);
  }

  /**
   * Lấy danh sách các kỹ năng cần đánh giá (mặc định cho Bóng rổ).
   */
  getAvailableSkills() {
    return [
      { id: 'dribbling', name: 'Nhồi bóng' },
      { id: 'shooting', name: 'Ném rổ' },
      { id: 'fitness', name: 'Thể lực' },
      { id: 'iq', name: 'Tư duy chiến thuật' },
      { id: 'passing', name: 'Chuyền bóng' }
    ];
  }

  /**
   * Ghi nhận một bản đánh giá mới.
   */
  async recordAssessment(input: AssessmentRecord) {
    const { data, error } = await this.from('skill_assessments')
      .insert({
        academy_id: this.academyId,
        student_id: input.student_id,
        assessed_by: input.assessed_by,
        assessment_date: input.assessment_date,
        notes: input.notes,
        scores: input.scores // JSONB column
      })
      .select()
      .single();

    return this.result(data, error);
  }

  /**
   * Lấy bản đánh giá mới nhất của học viên.
   */
  async getLatestAssessment(studentId: string) {
    const { data, error } = await this.from('skill_assessments')
      .select('*')
      .eq('academy_id', this.academyId)
      .eq('student_id', studentId)
      .order('assessment_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    return this.result(data, error);
  }

  /**
   * Lấy lịch sử tiến bộ của học viên.
   */
  async getProgressHistory(studentId: string) {
    const { data, error } = await this.from('skill_assessments')
      .select('assessment_date, scores')
      .eq('academy_id', this.academyId)
      .eq('student_id', studentId)
      .order('assessment_date', { ascending: true });

    return this.result(data, error);
  }
}
