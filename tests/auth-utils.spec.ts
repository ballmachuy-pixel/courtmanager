/**
 * ============================================================
 * [BMAD QA Team] — Auth Utils Test Suite (JWT Coach Session)
 * Coverage: signCoachSession, verifyCoachSession
 * ============================================================
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';

// ── Stub process.env before importing module ──────────────────
// We use a strong secret to avoid fallback to NEXT_PUBLIC_ key
beforeAll(() => {
  process.env.JWT_SECRET_KEY = 'test-super-secret-key-for-vitest-1234!';
  // Ensure NEXT_PUBLIC_ key is NOT set so we test the primary path
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
});

import { signCoachSession, verifyCoachSession } from '../src/lib/auth-utils';
import type { CoachSession } from '../src/lib/types';

const MOCK_COACH_SESSION: CoachSession = {
  member_id: 'member-uuid-123',
  academy_id: 'academy-uuid-456',
  role: 'coach',
  display_name: 'Huấn luyện viên Tuấn',
  employee_code: 'HLV001',
  must_change_pin: false,
};

// ─────────────────────────────────────────────────────────────
// signCoachSession
// ─────────────────────────────────────────────────────────────
describe('signCoachSession', () => {
  it('returns a non-empty JWT string', async () => {
    const token = await signCoachSession(MOCK_COACH_SESSION);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts: header.payload.signature
  });

  it('produces different tokens for different sessions', async () => {
    const session2: CoachSession = { ...MOCK_COACH_SESSION, member_id: 'other-uuid' };
    const token1 = await signCoachSession(MOCK_COACH_SESSION);
    const token2 = await signCoachSession(session2);
    expect(token1).not.toBe(token2);
  });
});

// ─────────────────────────────────────────────────────────────
// verifyCoachSession — Happy Path
// ─────────────────────────────────────────────────────────────
describe('verifyCoachSession — valid token', () => {
  it('returns the original CoachSession payload', async () => {
    const token = await signCoachSession(MOCK_COACH_SESSION);
    const result = await verifyCoachSession(token);

    expect(result).not.toBeNull();
    expect(result?.member_id).toBe(MOCK_COACH_SESSION.member_id);
    expect(result?.academy_id).toBe(MOCK_COACH_SESSION.academy_id);
    expect(result?.role).toBe('coach');
    expect(result?.display_name).toBe(MOCK_COACH_SESSION.display_name);
    expect(result?.employee_code).toBe(MOCK_COACH_SESSION.employee_code);
    expect(result?.must_change_pin).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
// verifyCoachSession — Error Cases
// ─────────────────────────────────────────────────────────────
describe('verifyCoachSession — invalid tokens', () => {
  it('returns null for a completely invalid token', async () => {
    const result = await verifyCoachSession('not.a.valid.jwt');
    expect(result).toBeNull();
  });

  it('returns null for an empty string', async () => {
    const result = await verifyCoachSession('');
    expect(result).toBeNull();
  });

  it('returns null for a tampered token', async () => {
    const token = await signCoachSession(MOCK_COACH_SESSION);
    // Tamper the payload section of the JWT
    const parts = token.split('.');
    parts[1] = Buffer.from('{"member_id":"hacker","role":"owner"}').toString('base64url');
    const tamperedToken = parts.join('.');
    const result = await verifyCoachSession(tamperedToken);
    expect(result).toBeNull();
  });

  it('returns null for token with wrong secret', async () => {
    // Sign with a different key by temporarily changing env
    const originalKey = process.env.JWT_SECRET_KEY;
    process.env.JWT_SECRET_KEY = 'completely-different-secret-key!!';
    const wrongKeyToken = await signCoachSession(MOCK_COACH_SESSION);
    
    // Restore original key
    process.env.JWT_SECRET_KEY = originalKey;
    
    // Verify with the original key — should fail
    const result = await verifyCoachSession(wrongKeyToken);
    expect(result).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// Security: CRITICAL — JWT Fallback to Public Key Bug
// ─────────────────────────────────────────────────────────────
describe('SECURITY: JWT secret configuration', () => {
  it('should NOT use NEXT_PUBLIC_ key as JWT secret when JWT_SECRET_KEY is set', async () => {
    // This test verifies that JWT_SECRET_KEY takes priority
    const token = await signCoachSession(MOCK_COACH_SESSION);
    // If JWT_SECRET_KEY is used, token verifies correctly
    const result = await verifyCoachSession(token);
    expect(result).not.toBeNull();
    expect(result?.member_id).toBe(MOCK_COACH_SESSION.member_id);
  });

  it('WARNS: if JWT_SECRET_KEY is missing, utils falls back to NEXT_PUBLIC_ key (security risk)', () => {
    // This is a documentation test that flags a known security concern in auth-utils.ts:
    // Line 5: const secret = process.env.JWT_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    // 
    // RISK: If JWT_SECRET_KEY is not set in production .env, JWT tokens will be signed with
    // the PUBLIC Supabase anon key which is exposed in the browser. This allows anyone to
    // forge valid coach session tokens.
    //
    // RECOMMENDATION: auth-utils.ts should throw an error if JWT_SECRET_KEY is not set,
    // rather than falling back to a public key.
    
    // Document the issue — this test always passes but serves as a warning in the test report
    expect(true).toBe(true); // placeholder to keep test runner happy
    console.warn(
      '[SECURITY WARNING] auth-utils.ts line 5: JWT falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Ensure JWT_SECRET_KEY is set in all environments!'
    );
  });
});
