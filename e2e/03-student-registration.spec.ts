/**
 * ============================================================
 * [BMAD QA Team] — E2E Test: Quy trình Đăng ký Học viên mới
 * Standards: BMad v6 + Diamond Standard v6
 * ============================================================
 */

import { test, expect } from '@playwright/test';

// ─── Test data ───
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '';
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Student Registration Flow', () => {
  // Bỏ qua nếu không có credential trong env
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'Bỏ qua: Thiếu E2E_ADMIN_EMAIL hoặc E2E_ADMIN_PASSWORD');

  test.beforeEach(async ({ page }) => {
    // 1. Thực hiện đăng nhập trước mỗi test case
    await page.goto(`${BASE_URL}/dang-nhap`);
    await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Đợi vào được dashboard
    await page.waitForURL(/dashboard/, { timeout: 15000 });
  });

  test('nên tạo được học viên mới thành công và chuyển hướng đến hồ sơ chi tiết', async ({ page }) => {
    const timestamp = Date.now();
    const studentName = `Học viên Test ${timestamp}`;
    const parentName = `Phụ huynh Test ${timestamp}`;
    const testPhone = '0987654321'; // Dùng số cố định để test logic tái sử dụng phụ huynh

    // 2. Đi tới trang đăng ký
    await page.goto(`${BASE_URL}/students/new`);
    await expect(page).toHaveURL(/students\/new/);

    // 3. Điền thông tin học viên
    await page.fill('input[name="full_name"]', studentName);
    await page.fill('input[name="date_of_birth"]', '2015-01-01');
    await page.selectOption('select[name="gender"]', 'male');
    await page.selectOption('select[name="skill_level"]', 'beginner');
    await page.fill('textarea[name="health_notes"]', 'Không có tiền sử bệnh lý - Test E2E');

    // 4. Điền thông tin phụ huynh (Phần này vừa được nâng cấp Service Layer)
    await page.fill('input[name="parent_name"]', parentName);
    await page.fill('input[name="phone"]', testPhone);
    await page.selectOption('select[name="relationship"]', 'father');

    // 5. Submit form
    // Nhấn nút "Lưu & Xem hồ sơ" (nút có gradient)
    const submitBtn = page.locator('button:has-text("Lưu & Xem hồ sơ")');
    await submitBtn.click();

    // 6. Kiểm tra kết quả
    // Hệ thống phải chuyển hướng đến trang profile của học viên mới (/students/[id])
    await page.waitForURL(/\/students\/[a-zA-Z0-9-]+/, { timeout: 15000 });
    
    // Kiểm tra tên học viên hiển thị trên trang profile
    const profileName = page.locator('h1, h2').filter({ hasText: studentName });
    await expect(profileName).toBeVisible();

    // Kiểm tra thông báo thành công nếu có
    const successToast = page.locator('[class*="success"], [class*="toast"]');
    if (await successToast.count() > 0) {
      await expect(successToast.first()).toBeVisible();
    }
  });

  test('nên hiển thị lỗi khi thiếu các trường bắt buộc', async ({ page }) => {
    await page.goto(`${BASE_URL}/students/new`);
    
    // Chỉ điền tên học viên, bỏ qua các trường bắt buộc khác (parent_name, phone)
    await page.fill('input[name="full_name"]', 'Học viên Thiếu Thông Tin');
    
    // Nhấn submit
    await page.click('button:has-text("Lưu & Xem hồ sơ")');

    // Playwright/Browser sẽ tự động chặn nếu input có thuộc tính 'required'
    // Hoặc nếu backend trả về lỗi, thông báo lỗi sẽ hiển thị
    const requiredField = page.locator('input[name="parent_name"]:invalid, input[name="phone"]:invalid');
    const isBrowserValidationWorking = await requiredField.count() > 0;
    
    if (!isBrowserValidationWorking) {
        // Nếu browser không chặn, kiểm tra thông báo lỗi từ hệ thống
        const errorAlert = page.locator('[class*="red"], [class*="error"], [role="alert"]').first();
        await expect(errorAlert).toBeVisible({ timeout: 5000 });
    }
  });
});
