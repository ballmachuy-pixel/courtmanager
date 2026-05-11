import crypto from 'crypto';

// [AUDIT FIX] No hardcoded fallback — must crash early if key is missing
// to prevent token forgery in production.
const getSecretKey = () => {
  const key = process.env.HMAC_SECRET_KEY;
  if (!key) {
    throw new Error(
      '[CourtManager] HMAC_SECRET_KEY is not set. ' +
      'Add HMAC_SECRET_KEY to your .env.local file. ' +
      'Without this key, Parent Portal tokens cannot be securely signed.'
    );
  }
  return key;
};

export function generateParentPortalToken(studentId: string, daysValid = 30): string {
  const expiresAt = Date.now() + daysValid * 24 * 60 * 60 * 1000;
  const payload = `${studentId}:${expiresAt}`;
  
  const hmac = crypto.createHmac('sha256', getSecretKey());
  hmac.update(payload);
  const signature = hmac.digest('base64url');
  
  const encodedPayload = Buffer.from(payload).toString('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyParentPortalToken(token: string): { studentId: string | null; isValid: boolean; error?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return { studentId: null, isValid: false, error: 'Invalid token format' };

    const [encodedPayload, signature] = parts;
    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', getSecretKey());
    hmac.update(payload);
    const expectedSignature = hmac.digest('base64url');
    
    if (signature !== expectedSignature) {
      return { studentId: null, isValid: false, error: 'Token signature mismatch' };
    }

    // Verify expiration
    const [studentId, expiresAtStr] = payload.split(':');
    const expiresAt = parseInt(expiresAtStr, 10);
    
    if (Date.now() > expiresAt) {
      return { studentId, isValid: false, error: 'Token expired' };
    }

    return { studentId, isValid: true };
  } catch {
    return { studentId: null, isValid: false, error: 'Token validation error' };
  }
}
