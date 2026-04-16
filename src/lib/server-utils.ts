import { createClient } from '@/lib/supabase/server';
import { verifyCoachSession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

/**
 * Lấy academy_id hiện tại dựa vào phiên đăng nhập (Admin hoặc Coach)
 */
export async function getCurrentAcademyId(): Promise<string | null> {
  try {
    // 1. Thử lấy từ Coach session cookie trước
    const cookieStore = await cookies();
    const token = cookieStore.get('coach_session')?.value;
    
    if (token) {
      const session = await verifyCoachSession(token);
      if (session && session.academy_id) {
        return session.academy_id;
      }
    }

    // 2. Không có coach session -> Kiểm tra Supabase Auth (Admin)
    let supabase;
    try {
      supabase = await createClient();
    } catch (err) {
      console.error('[getCurrentAcademyId] createClient failed:', err);
      return null;
    }

    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data?.user?.id) {
      return null;
    }
    const user = data.user;
    
    const preferredAcademyId = cookieStore.get('cm_selected_academy')?.value;

    if (preferredAcademyId) {
      // Xác minh quyền sở hữu hoặc tư cách thành viên đối với ID này
      const [{ data: owned }, { data: memberOf }] = await Promise.all([
        supabase.from('academies').select('id').eq('id', preferredAcademyId).eq('owner_id', user.id).maybeSingle(),
        supabase.from('academy_members').select('id').eq('academy_id', preferredAcademyId).eq('user_id', user.id).maybeSingle()
      ]);
      if (owned || memberOf) {
        return preferredAcademyId;
      }
    }

    // Tìm academy mà user là owner (Lấy thằng đầu tiên để tránh lỗi crash)
    const { data: academy } = await supabase
      .from('academies')
      .select('id')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
      
    if (academy) {
      return academy.id;
    }
    
    // Nếu không phải owner, tìm trong academy_members
    const { data: member } = await supabase
      .from('academy_members')
      .select('academy_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
      
    if (member) return member.academy_id;

    return null;
  } catch (err) {
    console.error('[getCurrentAcademyId] Unexpected error:', err);
    return null;
  }
}
