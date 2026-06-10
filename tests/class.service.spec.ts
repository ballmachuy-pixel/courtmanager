import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClassService } from '@/lib/services/class.service';
import * as supabaseService from '@/lib/supabase/service';

vi.mock('@/lib/supabase/service', () => ({
  createAdminClient: vi.fn(),
}));

describe('ClassService', () => {
  let classService: ClassService;
  
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Chain setup
    mockEq.mockReturnValue({ order: mockOrder, eq: mockEq });
    mockOrder.mockResolvedValue({ data: [], error: null });
    
    mockSelect.mockReturnValue({ eq: mockEq, order: mockOrder });
    mockUpdate.mockReturnValue({ eq: mockEq });

    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    });

    (supabaseService.createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom,
    });

    classService = new ClassService('test-academy-id');
  });

  describe('getClasses', () => {
    it('MULTI-TENANCY: Phải gọi .eq("academy_id") khi getClasses', async () => {
      await classService.getClasses();
      expect(mockFrom).toHaveBeenCalledWith('classes');
      expect(mockSelect).toHaveBeenCalledWith('id, name');
      expect(mockEq).toHaveBeenCalledWith('academy_id', 'test-academy-id');
    });
  });

  describe('updateClass', () => {
    it('MULTI-TENANCY: Phải gọi .eq("academy_id") khi updateClass', async () => {
      const mockDelete = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
      mockFrom.mockReturnValueOnce({ update: mockUpdate }); // for classes
      mockFrom.mockReturnValueOnce({ delete: mockDelete }); // for class_default_coaches
      
      await classService.updateClass('class-1', {
        name: 'Class A',
        maxStudents: 10,
        coachIds: []
      });

      expect(mockFrom).toHaveBeenCalledWith('classes');
      expect(mockUpdate).toHaveBeenCalledWith({
        name: 'Class A',
        age_group: null,
        skill_level: null,
        max_students: 10,
        head_coach_id: null,
      });
      // The first call to mockEq after update should be for id, the second for academy_id
      expect(mockEq).toHaveBeenCalledWith('id', 'class-1');
      expect(mockEq).toHaveBeenCalledWith('academy_id', 'test-academy-id');
    });
  });
});
