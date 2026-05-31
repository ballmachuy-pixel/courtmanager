import { BaseService } from './base.service';

export interface PaymentRecord {
  id?: string;
  student_id: string;
  total_amount?: number;
  amount: number;
  debt_amount?: number;
  payment_date: string;
  payment_method: 'cash' | 'transfer' | 'other';
  description: string | null;
  status: 'completed' | 'pending' | 'overdue' | 'partial';
  package_id?: string | null;
}

export interface TuitionPackage {
  id?: string;
  name: string;
  price: number;
  package_type?: 'sessions' | 'months';
  sessions_count: number | null;
  duration_days: number | null;
  is_active: boolean;
  description: string | null;
}

/**
 * FinanceService — Quản lý tài chính, học phí và các giao dịch của học viện.
 */
export class FinanceService extends BaseService {
  constructor(academyId: string) {
    super(academyId);
  }

  /**
   * Lấy danh sách phiếu thu của học viện.
   */
  async getPayments(filters?: { studentId?: string; status?: string }) {
    let query = this.from('payments')
      .select('*, students(full_name)')
      .order('payment_date', { ascending: false });

    if (filters?.studentId) query = query.eq('student_id', filters.studentId);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    return this.result(data, error);
  }

  /**
   * Ghi nhận một phiếu thu mới và tự động cộng buổi học nếu có gói.
   */
  async recordPayment(input: PaymentRecord) {
    try {
      // 1. Lưu phiếu thu
      const { data: payment, error: paymentError } = await this.from('payments')
        .insert({
          ...input,
          academy_id: this.academyId
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // 2. Nếu có Gói học phí, tiến hành cộng buổi hoặc hạn sử dụng cho học viên
      if (input.package_id && (input.status === 'completed' || input.status === 'partial')) {
        const { data: pkg } = await this.from('tuition_packages')
          .select('package_type, sessions_count, duration_days')
          .eq('id', input.package_id)
          .single();

        if (pkg) {
          const isSubscription = pkg.package_type === 'months';
          
          if (isSubscription && pkg.duration_days) {
            // Cập nhật Hạn sử dụng (Subscription)
            const { data: student } = await this.from('students')
              .select('subscription_end_date')
              .eq('id', input.student_id)
              .single();

            let baseDate = new Date();
            const currentEndDateStr = (student as { subscription_end_date?: string })?.subscription_end_date;
            if (currentEndDateStr) {
               const currentEndDate = new Date(currentEndDateStr);
               if (currentEndDate > baseDate) {
                 baseDate = currentEndDate;
               }
            }
            baseDate.setDate(baseDate.getDate() + pkg.duration_days);
            
            await this.from('students')
              .update({ subscription_end_date: baseDate.toISOString().split('T')[0] })
              .eq('id', input.student_id);
          } else if (pkg.sessions_count) {
            // Cập nhật Số buổi (Sessions)
            const { data: student } = await this.from('students')
              .select('session_balance')
              .eq('id', input.student_id)
              .single();

            const currentBalance = (student as { session_balance?: number })?.session_balance || 0;
            
            await this.from('students')
              .update({ session_balance: currentBalance + pkg.sessions_count })
              .eq('id', input.student_id);
          }
        }
      }

      // 3. Ghi log Audit
      if (payment) {
        await this.from('audit_logs').insert({
          academy_id: this.academyId,
          action: 'CREATE_PAYMENT',
          target_type: 'payments',
          target_id: payment.id,
          details: { amount: input.amount, debt: input.debt_amount, total: input.total_amount, status: input.status }
        });
      }

      return this.result(payment);
    } catch (err: unknown) {
      return this.result(null, err);
    }
  }

  /**
   * Lấy thống kê doanh thu tổng quan.
   */
  async getFinanceSummary() {
    try {
      const { data: payments } = await this.from('payments')
        .select('amount, status')
        .eq('status', 'completed');

      const totalRevenue = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);

      const { count: overdueCount } = await this.from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'overdue');

      return this.result({
        totalRevenue,
        overdueCount: overdueCount || 0
      });
    } catch (err: unknown) {
      return this.result(null, err);
    }
  }

  /**
   * Lấy danh sách các gói học phí của học viện.
   */
  async getTuitionPackages() {
    const { data, error } = await this.from('tuition_packages')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    return this.result(data as TuitionPackage[], error);
  }

  /**
   * Tạo gói học phí mới.
   */
  async createTuitionPackage(input: TuitionPackage) {
    const { data, error } = await this.from('tuition_packages')
      .insert({
        ...input,
        academy_id: this.academyId
      })
      .select()
      .single();

    return this.result(data, error);
  }

  /**
   * Tổng hợp doanh thu theo từng tháng (6 tháng gần nhất).
   */
  async getMonthlyRevenueStats() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const { data, error } = await this.from('payments')
      .select('amount, payment_date')
      .eq('status', 'completed')
      .gte('payment_date', sixMonthsAgo.toISOString().split('T')[0]);

    if (error) return this.result(null, error);

    // Xử lý gom nhóm theo tháng
    const monthlyData: Record<string, number> = {};
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toLocaleString('vi-VN', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = 0;
      months.push(monthKey);
    }

    data.forEach((p: { amount?: number; payment_date: string }) => {
      const d = new Date(p.payment_date);
      const monthKey = d.toLocaleString('vi-VN', { month: 'short', year: 'numeric' });
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey] += p.amount || 0;
      }
    });

    const result = months.map(m => ({ month: m, revenue: monthlyData[m] }));
    return this.result(result);
  }

  /**
   * Tổng hợp doanh thu theo cơ cấu Gói học phí.
   */
  async getRevenueByPackageStats() {
    const { data, error } = await this.from('payments')
      .select('amount, package_id, tuition_packages(name)')
      .eq('status', 'completed')
      .not('package_id', 'is', null);

    if (error) return this.result(null, error);

    const packageData: Record<string, number> = {};
    data.forEach((p: any) => {
      const pkg = Array.isArray(p.tuition_packages) ? p.tuition_packages[0] : p.tuition_packages;
      const name = pkg?.name || 'Khác';
      packageData[name] = (packageData[name] || 0) + (p.amount || 0);
    });

    const result = Object.entries(packageData).map(([name, value]) => ({ name, value }));
    return this.result(result);
  }
}
