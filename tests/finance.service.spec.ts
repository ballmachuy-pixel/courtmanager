import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinanceService } from '@/lib/services/finance.service';
import * as supabaseService from '@/lib/supabase/service';

// Mock module supabase/service
vi.mock('@/lib/supabase/service', () => ({
  createAdminClient: vi.fn(),
}));

describe('FinanceService', () => {
  let financeService: FinanceService;
  
  const mockInsert = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockUpdate = vi.fn();
  const mockUpdateEq = vi.fn(); // Mới: tách riêng eq của update

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup chuỗi mock
    const mockFrom = vi.fn().mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
    });
    
    // Chaining setup
    mockInsert.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ single: mockSingle, eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle }); // eq sau select
    mockUpdate.mockReturnValue({ eq: mockUpdateEq }); // eq sau update

    (supabaseService.createAdminClient as any).mockReturnValue({
      from: mockFrom,
    });

    financeService = new FinanceService('test-academy');
  });

  describe('recordPayment', () => {
    it('HAPPY_PATH: Nên cộng đúng session_balance khi thanh toán gói học phí thành công', async () => {
      // 1. Mock insert payment -> select -> single
      mockSingle.mockResolvedValueOnce({
        data: { id: 'pay_1', student_id: 'stu_1', amount: 1000, status: 'completed' },
        error: null,
      });

      // 2. Mock lấy gói học phí -> select -> eq -> single
      mockSingle.mockResolvedValueOnce({
        data: { sessions_count: 10 },
        error: null,
      });

      // 3. Mock lấy student hiện tại -> select -> eq -> single
      mockSingle.mockResolvedValueOnce({
        data: { session_balance: 2 },
        error: null,
      });

      // 4. Mock update -> eq
      mockUpdateEq.mockResolvedValueOnce({ data: {}, error: null });

      const input = {
        student_id: 'stu_1',
        amount: 1000,
        payment_date: '2026-05-21',
        payment_method: 'transfer' as const,
        description: null,
        status: 'completed' as const,
        package_id: 'pkg_1',
      };

      const result = await financeService.recordPayment(input);

      expect(result.error).toBeNull();
      expect(result.data).toHaveProperty('id', 'pay_1');
      expect(mockUpdate).toHaveBeenCalledWith({ session_balance: 12 });
      expect(mockUpdateEq).toHaveBeenCalledWith('id', 'stu_1');
    });

    it('ERROR_CASE: Nên văng lỗi (trả về result.error) nếu insert payment thất bại', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: new Error('Database connection failed'),
      });

      const input = {
        student_id: 'stu_1',
        amount: 1000,
        payment_date: '2026-05-21',
        payment_method: 'transfer' as const,
        description: null,
        status: 'completed' as const,
        package_id: 'pkg_1',
      };

      const result = await financeService.recordPayment(input);

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Database connection failed');
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('EDGE_CASE: Nên cộng dồn chuẩn xác khi học viên đang bị âm số dư buổi', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: 'pay_1', student_id: 'stu_2', amount: 1000, status: 'completed' },
        error: null,
      });
      mockSingle.mockResolvedValueOnce({
        data: { sessions_count: 10 },
        error: null,
      });
      mockSingle.mockResolvedValueOnce({
        data: { session_balance: -2 },
        error: null,
      });
      
      mockUpdateEq.mockResolvedValueOnce({ data: {}, error: null });

      const input = {
        student_id: 'stu_2',
        amount: 1000,
        payment_date: '2026-05-21',
        payment_method: 'cash' as const,
        description: null,
        status: 'completed' as const,
        package_id: 'pkg_2',
      };

      await financeService.recordPayment(input);

      expect(mockUpdate).toHaveBeenCalledWith({ session_balance: 8 });
      expect(mockUpdateEq).toHaveBeenCalledWith('id', 'stu_2');
    });
  });
});
