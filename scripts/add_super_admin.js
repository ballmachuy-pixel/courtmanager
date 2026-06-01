const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'd:/CourtManager/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function addSuperAdmin() {
  const email = 'ballmachuy@gmail.com';
  
  // 1. Lấy thông tin user
  const { data: { users }, error: userErr } = await supabase.auth.admin.listUsers();
  if (userErr) {
    console.error("Error fetching users:", userErr.message);
    return;
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    console.error(`Không tìm thấy user với email: ${email}`);
    return;
  }

  console.log(`Tìm thấy user: ${user.id}`);

  // 2. Thêm vào bảng user_roles
  const { error: insertErr } = await supabase
    .from('user_roles')
    .upsert({
      user_id: user.id,
      role: 'super_admin'
    }, { onConflict: 'user_id, role' });

  if (insertErr) {
    console.error("Error inserting role:", insertErr.message);
  } else {
    console.log(`Đã thêm thành công quyền super_admin cho ${email}`);
  }
}

addSuperAdmin();
