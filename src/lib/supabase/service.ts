import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';

// Khởi tạo Supabase client với Service Role Key để bypass RLS
// Client này được memoize bằng React cache() để tái sử dụng trong cùng 1 request
export const createAdminClient = cache(() => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
});
