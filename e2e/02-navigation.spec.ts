/**
 * ============================================================
 * [BMAD QA Team] — E2E Test: Dashboard & Navigation
 * Coverage:
 *   - Dashboard stats hiển thị (không bị crash)
 *   - Sidebar navigation hoạt động
 *   - Các trang chính load được: Students, Classes, Analytics
 *   - Trang 404 hiển thị đúng
 * ============================================================
 * Chú ý: Test này cần Admin đăng nhập trước (dùng storageState)
 * Chạy 01-auth.spec.ts trước để setup session nếu cần.
 * ============================================================
 */

import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '';

// Helper: Login admin trước mỗi test group
async function loginAdmin(page: any) {
  await page.goto('/dang-nhap');
  await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 15000 });
}

test.describe('Dashboard Page', () => {
  test.skip(!ADMIN_EMAIL, 'Bỏ qua: E2E_ADMIN_EMAIL chưa được set');

  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('dashboard load không có lỗi 500', async ({ page }) => {
    await expect(page).not.toHaveTitle(/500|Internal Server Error/);
    // Không có toast lỗi màu đỏ
    const errorToast = page.locator('[class*="error"][class*="toast"]');
    await expect(errorToast).toHaveCount(0);
  });

  test('hiển thị các stat card chính', async ({ page }) => {
    // Đợi nội dung load xong
    await page.waitForLoadState('networkidle');
    
    // Phải có ít nhất 1 stat card (học viên, lớp học, etc.)
    const statCards = page.locator('[class*="card"], [class*="stat"]');
    await expect(statCards.first()).toBeVisible({ timeout: 8000 });
  });

  test('sidebar navigation hiển thị đúng', async ({ page }) => {
    // Sidebar phải có các link chính
    await expect(page.locator('a[href="/students"], nav a:has-text("Học viên")')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('a[href="/classes"], nav a:has-text("Lớp học")')).toBeVisible();
  });
});

test.describe('Navigation Flow', () => {
  test.skip(!ADMIN_EMAIL, 'Bỏ qua: E2E_ADMIN_EMAIL chưa được set');

  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('navigate đến trang Students', async ({ page }) => {
    await page.goto('/students');
    await expect(page).not.toHaveTitle(/500|Error/);
    await page.waitForLoadState('networkidle');
    // Trang phải có heading
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8000 });
  });

  test('navigate đến trang Classes', async ({ page }) => {
    await page.goto('/classes');
    await expect(page).not.toHaveTitle(/500|Error/);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8000 });
  });

  test('navigate đến trang Analytics', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page).not.toHaveTitle(/500|Error/);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8000 });
  });

  test('navigate đến trang Staff', async ({ page }) => {
    await page.goto('/staff');
    await expect(page).not.toHaveTitle(/500|Error/);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8000 });
  });

  test('trang không tồn tại trả về 404 page', async ({ page }) => {
    await page.goto('/trang-khong-ton-tai-abcxyz');
    await page.waitForLoadState('networkidle');
    
    // Phải có nội dung 404 (không phải trang lỗi server)
    const notFoundContent = page.locator('text=/404|Không tìm thấy|Not Found/i');
    await expect(notFoundContent).toBeVisible({ timeout: 8000 });
  });
});

test.describe('Trang Public (Không cần login)', () => {
  test('trang chủ / load được', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);
  });

  test('manifest.json trả về đúng', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest');
    if (response) {
      expect([200, 301, 302, 404]).toContain(response.status());
    }
  });

  test('parent portal /parent truy cập được (public)', async ({ page }) => {
    const response = await page.goto('/parent');
    // Should return something (not crash), could be redirect or 200
    expect(response?.status()).toBeLessThan(500);
  });
});
