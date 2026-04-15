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
    
    // Tìm academy mà user là owner
    const { data: academy } = await supabase
      .from('academies')
      .select('id')
      .eq('owner_id', user.id)
      .single();
      
    if (academy) {
      return academy.id;
    }
    
    // Nếu không phải owner, tìm trong academy_members (vd admin do user tự đăng nhập supabase auth map sang, mặc dù ta ko build luồng này cho MVP nhưng để phòng hờ)
    const { data: member } = await supabase
      .from('academy_members')
      .select('academy_id')
      .eq('user_id', user.id)
      .single();
      
    if (member) return member.academy_id;

    return null;
  } catch (err) {
    console.error('[getCurrentAcademyId] Unexpected error:', err);
    return null;
  }
}
