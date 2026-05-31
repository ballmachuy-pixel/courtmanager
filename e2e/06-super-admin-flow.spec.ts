import { test, expect } from '@playwright/test';

const ROOT_EMAIL = process.env.ROOT_ADMIN_EMAIL || '';
const ROOT_PASSWORD = process.env.ROOT_ADMIN_PASSWORD || '';

test.describe('Super Admin Flow (Phase 4)', () => {
  test.skip(!ROOT_EMAIL, 'Bỏ qua vì không có cấu hình ROOT_ADMIN');

  test('Đăng nhập Super Admin và Tạo Academy có Owner Email', async ({ page }) => {
    // 1. Đăng nhập bằng Root
    await page.goto('/dang-nhap');
    await page.fill('input[type="email"], input[name="email"]', ROOT_EMAIL);
    await page.fill('input[type="password"]', ROOT_PASSWORD);
    await page.click('button[type="submit"]');

    // 2. Đợi Auth và chuyển trang
    await page.waitForURL(/\/super-admin|\/dashboard/, { timeout: 15000 });
    await page.goto('/super-admin');

    // 3. Kích hoạt Modal Tạo Học viện
    const createBtn = page.locator('button:has-text("Thêm Học viện mới")');
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    // 4. Kiểm tra form có field OwnerEmail (Phase 4 Requirement)
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="slug"]')).toBeVisible();
    await expect(page.locator('input[name="ownerEmail"]')).toBeVisible();

    // Điền thử dữ liệu
    await page.fill('input[name="name"]', 'Academy E2E Test');
    await page.fill('input[name="slug"]', 'academy-e2e-' + Date.now());
    await page.fill('input[name="ownerEmail"]', 'test-owner@academy.com'); 
    
    // Đảm bảo nút Submit tồn tại và ở trạng thái active
    const submitBtn = page.locator('button:has-text("Xác nhận Tạo")');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
    
    // Đóng modal (không bấm tạo để tránh rác database)
    await page.click('button:has-text("Hủy")');
  });
});
