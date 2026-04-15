/**
 * ============================================================
 * [BMAD QA Team] — Token Utils Test Suite
 * Coverage: generateParentPortalToken, verifyParentPortalToken
 * ============================================================
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  generateParentPortalToken,
  verifyParentPortalToken,
} from '../src/lib/token-utils';

afterEach(() => {
  vi.useRealTimers();
});

const MOCK_STUDENT_ID = 'student-uuid-abc123';

describe('generateParentPortalToken', () => {
  it('returns a string with two parts separated by a period', () => {
    const token = generateParentPortalToken(MOCK_STUDENT_ID);
    const parts = token.split('.');
    expect(parts).toHaveLength(2);
  });

  it('generates a different token on each call (due to timestamp)', async () => {
    const token1 = generateParentPortalToken(MOCK_STUDENT_ID);
    // Introduce 1ms delay so timestamps differ
    await new Promise(r => setTimeout(r, 1));
    const token2 = generateParentPortalToken(MOCK_STUDENT_ID);
    expect(token1).not.toBe(token2);
  });

  it('accepts custom daysValid', () => {
    const token = generateParentPortalToken(MOCK_STUDENT_ID, 7);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);
  });
});

describe('verifyParentPortalToken', () => {
  it('returns isValid=true and correct studentId for a fresh token', () => {
    const token = generateParentPortalToken(MOCK_STUDENT_ID, 30);
    const result = verifyParentPortalToken(token);
    expect(result.isValid).toBe(true);
    expect(result.studentId).toBe(MOCK_STUDENT_ID);
    expect(result.error).toBeUndefined();
  });

  it('returns isValid=false for a tampered signature', () => {
    const token = generateParentPortalToken(MOCK_STUDENT_ID);
    const [payload] = token.split('.');
    const tamperedToken = `${payload}.invalidsignature`;
    const result = verifyParentPortalToken(tamperedToken);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Token signature mismatch');
  });

  it('returns isValid=false for a completely garbage token', () => {
    const result = verifyParentPortalToken('garbage.token');
    expect(result.isValid).toBe(false);
  });

  it('returns isValid=false and error for wrong format (no period)', () => {
    const result = verifyParentPortalToken('onlyonepart');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid token format');
  });

  it('returns isValid=false for expired token', async () => {
    // Generate a token that expires in 0 days (effectively already expired)
    const pastTimestamp = Date.now() - 1000; // 1 second in the past
    // We need to manually craft an expired token to test this
    const crypto = await import('crypto');
    const SECRET_KEY = 'CM_TEMP_SECRET_KEY_1234567890'; // matches token-utils fallback
    const payload = `${MOCK_STUDENT_ID}:${pastTimestamp}`;
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(payload);
    const signature = hmac.digest('base64url');
    const encodedPayload = Buffer.from(payload).toString('base64url');
    const expiredToken = `${encodedPayload}.${signature}`;

    const result = verifyParentPortalToken(expiredToken);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Token expired');
    expect(result.studentId).toBe(MOCK_STUDENT_ID); // studentId still returned
  });
});
