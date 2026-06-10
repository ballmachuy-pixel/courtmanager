import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinanceService } from '@/lib/services/finance.service';
import * as supabaseService from '@/lib/supabase/service';

vi.mock('@/lib/supabase/service', () => ({
  createAdminClient: vi.fn(),
}));

describe('FinanceService', () => {
  let financeService: FinanceService;
  
  const mockFrom = vi.fn();
  const mockInsert = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockUpdate = vi.fn();
  const mockUpdateEq = vi.fn();
  const mockOrder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a chainable mock that also has then/catch
    const createChainableMock = () => {
      const mock: any = vi.fn();
      mock.eq = vi.fn().mockReturnValue(mock);
      mock.order = vi.fn().mockReturnValue(mock);
      mock.single = vi.fn().mockReturnValue(mock);
      mock.select = vi.fn().mockReturnValue(mock); // Fix: Add select for chaining
      // Allows awaiting the mock directly
      mock.then = (resolve: any) => Promise.resolve(mock._resolvedValue).then(resolve);
      return mock;
    };

    const selectMock = createChainableMock();
    const insertMock = createChainableMock();
    const updateMock = createChainableMock();

    mockInsert.mockImplementation(() => insertMock);
    mockSelect.mockImplementation(() => selectMock);
    mockUpdate.mockImplementation(() => updateMock);

    mockFrom.mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
    });

    (supabaseService.createAdminClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom,
    });

    financeService = new FinanceService('test-academy');
    
    // Attach these to the test scope to modify resolved values per test
    (financeService as any)._selectMock = selectMock;
    (financeService as any)._updateMock = updateMock;
    (financeService as any)._insertMock = insertMock;
  });

  describe('recordPayment', () => {
    it('HAPPY_PATH: Nên cộng đúng session_balance khi thanh toán gói học phí thành công', async () => {
      const selectMock = (financeService as any)._selectMock;
      const updateMock = (financeService as any)._updateMock;
      const insertMock = (financeService as any)._insertMock;

      // Setup sequence of resolves for selectMock.single()
      selectMock.single
        .mockResolvedValueOnce({
          data: { sessions_count: 10 },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { session_balance: 2 },
          error: null,
        });

      insertMock._resolvedValue = { data: { id: 'pay_1', student_id: 'stu_1', amount: 1000, status: 'completed' }, error: null };
      updateMock._resolvedValue = { data: {}, error: null };

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
      expect(updateMock.eq).toHaveBeenCalledWith('id', 'stu_1');
      expect(updateMock.eq).toHaveBeenCalledWith('academy_id', 'test-academy'); // Mới: Phải kiểm tra academy_id
    });
  });

  describe('getPayments', () => {
    it('MULTI-TENANCY: Phải gọi .eq("academy_id") khi getPayments', async () => {
      const selectMock = (financeService as any)._selectMock;
      selectMock._resolvedValue = { data: [], error: null };
      
      await financeService.getPayments();

      expect(mockFrom).toHaveBeenCalledWith('payments');
      expect(mockSelect).toHaveBeenCalledWith('*, students(full_name)');
      expect(selectMock.eq).toHaveBeenCalledWith('academy_id', 'test-academy');
      expect(selectMock.order).toHaveBeenCalled();
    });
  });
});
