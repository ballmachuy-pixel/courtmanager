import { SignJWT, jwtVerify } from 'jose';
import { type CoachSession } from '@/lib/types';

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    // SECURITY: Do NOT fall back to NEXT_PUBLIC_ keys. They are exposed in the browser
    // and would allow anyone to forge valid coach session tokens.
    throw new Error(
      '[CourtManager] JWT_SECRET_KEY is not set. ' +
      'Add JWT_SECRET_KEY to your .env.local file. ' +
      'Never use NEXT_PUBLIC_ keys as JWT secrets.'
    );
  }
  return new TextEncoder().encode(secret);
};

export async function signCoachSession(payload: CoachSession): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 7; // 7 days

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(getSecretKey());
}

export async function verifyCoachSession(token: string): Promise<CoachSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as CoachSession;
  } catch (error) {
    // Chỉ trả về null để bắt buộc user đăng nhập lại (nếu token hết hạn hoặc sai key)
    // Bỏ console.error để tránh Next.js Dev phát hiện và hiển thị lỗi overlay đỏ cản trở test.
    return null;
  }
}
