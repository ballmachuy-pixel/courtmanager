import { createAdminClient } from '@/lib/supabase/service';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '../supabase/server';

export interface ServiceResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * BaseService — Lớp cơ sở cho mọi service trong hệ thống.
 * Tự động hóa việc quản lý academy_id và đảm bảo cách ly dữ liệu.
 */
export class BaseService {
  protected supabase: SupabaseClient;
  protected academyId: string;

  constructor(academyId?: string) {
    // Nếu không truyền academyId, chúng ta sẽ mặc định là chưa xác định
    // Lưu ý: academyId thực tế sẽ được kiểm tra ở cấp độ thực thi phương thức hoặc 
    // được tiêm vào từ Controller/Action.
    this.academyId = academyId || '';
    this.supabase = createAdminClient();
  }

  /**
   * Helper để lấy Academy ID hiện tại.
   */
  static async resolveAcademyId(fallbackId?: string): Promise<string> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Trả về academy_id từ metadata của user (hoặc fallback)
    return user?.user_metadata?.academy_id || fallbackId || '';
  }

  /**
   * Tạo một query builder đã được đính kèm sẵn academy_id filter.
   */
  protected from(table: string) {
    return this.supabase.from(table);
  }

  /**
   * Helper để xử lý kết quả trả về đồng nhất.
   */
  protected result<T>(data: T | null, error: any = null) {
    return {
      data,
      error: error ? (error instanceof Error ? error : new Error(error.message || 'Unknown error')) : null,
    };
  }
}
