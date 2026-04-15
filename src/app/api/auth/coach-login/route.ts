import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase/service';
import { signCoachSession } from '@/lib/auth-utils';
import { type CoachSession } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { employee_code, pin } = await request.json();

    if (!employee_code || !pin) {
      return NextResponse.json(
        { error: 'Mã nhân viên và PIN là bắt buộc' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Tìm HLV bằng employee_code
    const { data: member, error } = await supabase
      .from('academy_members')
      .select('id, academy_id, role, pin_hash, display_name, must_change_pin, is_active')
      .ilike('employee_code', employee_code)
      .single();

    if (error || !member) {
      return NextResponse.json(
        { error: 'Mã nhân viên hoặc PIN không đúng' },
        { status: 401 }
      );
    }

    if (!member.is_active) {
      return NextResponse.json(
        { error: 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ Admin.' },
        { status: 403 }
      );
    }

    // 2. Kiểm tra mã PIN bằng bcrypt
    const isValid = await bcrypt.compare(pin, member.pin_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Mã nhân viên hoặc PIN không đúng' },
        { status: 401 }
      );
    }

    // 3. Tạo session token (JWT)
    const sessionPayload: CoachSession = {
      member_id: member.id,
      academy_id: member.academy_id,
      role: member.role,
      display_name: member.display_name,
      employee_code,
      must_change_pin: member.must_change_pin,
    };

    const token = await signCoachSession(sessionPayload);

    // 4. Set cookie
    const cookieStore = await cookies();
    cookieStore.set('coach_session', token, {
      httpOnly: true,
      secure: true, // Bạo lực ép buộc 100% Secure để vượt rào iOS/Android
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Coach login error:', err);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi hệ thống' },
      { status: 500 }
    );
  }
}
