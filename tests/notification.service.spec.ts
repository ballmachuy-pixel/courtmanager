import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from '@/lib/services/notification.service';
import * as supabaseService from '@/lib/supabase/service';

vi.mock('@/lib/supabase/service', () => ({
  createAdminClient: vi.fn(),
}));

describe('NotificationService', () => {
  let notificationService: NotificationService;
  
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockInsert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockEq.mockReturnValue({ eq: mockEq, single: mockSingle });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockInsert.mockResolvedValue({ error: null });

    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    });

    (supabaseService.createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom,
    });

    notificationService = new NotificationService('test-academy-id');
  });

  describe('triggerAttendanceZaloZNS', () => {
    it('MULTI-TENANCY: Phải gọi .eq("academy_id") khi truy vấn student', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { full_name: 'Test Student', parent_id: 'p1', parents: { full_name: 'Parent 1', phone: '0123' } },
        error: null
      });

      await notificationService.triggerAttendanceZaloZNS('stu-1', 'present', '2026-05-21');

      expect(mockFrom).toHaveBeenCalledWith('students');
      expect(mockSelect).toHaveBeenCalledWith('full_name, parent_id, parents(full_name, phone)');
      expect(mockEq).toHaveBeenCalledWith('id', 'stu-1');
      expect(mockEq).toHaveBeenCalledWith('academy_id', 'test-academy-id');
      
      // Ensure it attempts to log the notification
      expect(mockFrom).toHaveBeenCalledWith('notification_logs');
      expect(mockInsert).toHaveBeenCalled();
    });
  });
});
