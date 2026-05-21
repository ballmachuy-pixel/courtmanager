import { createClient } from '@/lib/supabase/client';

export class AuthService {
  /**
   * Đăng nhập bằng Google (OAuth)
   * @param redirectTo URL callback để xử lý PKCE flow
   */
  static async signInWithGoogle(redirectTo: string) {
    const supabase = createClient();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      throw error;
    }
  }
}
