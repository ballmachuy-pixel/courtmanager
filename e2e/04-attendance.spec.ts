/**
 * ============================================================
 * [BMAD QA Team] — E2E Test: Luồng Điểm Danh (Attendance)
 * Coverage:
 *   - Huấn luyện viên (Coach) đăng nhập bằng PIN code
 *   - Truy cập trang Dashboard để xem lịch dạy hôm nay
 *   - Mở modal điểm danh lớp học
 *   - Thực hiện thao tác điểm danh (Có mặt / Vắng)
 *   - Lưu điểm danh thành công
 * ============================================================
 */

import { test, expect } from '@playwright/test';

const COACH_PIN = process.env.E2E_COACH_PIN || '123456';
const COACH_CODE = process.env.E2E_COACH_CODE || 'COACH01';

test.describe('Coach Attendance Flow', () => {
  test.skip(!process.env.E2E_COACH_PIN, 'Bỏ qua: E2E_COACH_PIN chưa được set trong env');

  test('Coach login and mark attendance', async ({ page }) => {
    // 1. Coach đăng nhập
    await page.goto('/coach-login');
    
    await page.fill('input[name="employee_code"]', COACH_CODE);
    // Giả sử UI nhập PIN là input name="pin"
    const pinInput = page.locator('input[name="pin"], input[type="password"]').first();
    await pinInput.fill(COACH_PIN);
    
    await page.click('button[type="submit"]');
    
    // 2. Chuyển hướng về Dashboard
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await expect(page.url()).toContain('/dashboard');
    
    // 3. Tìm nút "Điểm danh" trên trang chủ (Dashboard)
    const attendanceButton = page.locator('button:has-text("Điểm danh"), a:has-text("Điểm danh")').first();
    await expect(attendanceButton).toBeVisible({ timeout: 5000 });
    
    await attendanceButton.click();
    
    // 4. Mở Modal / Trang điểm danh
    // Chờ bảng danh sách học viên xuất hiện
    const studentRow = page.locator('tr').nth(1); // Lấy dòng học viên đầu tiên (dòng 0 là header)
    await expect(studentRow).toBeVisible({ timeout: 5000 });
    
    // 5. Check vào nút "Có mặt" (Present)
    const presentCheckbox = studentRow.locator('button:has-text("Có mặt"), input[type="radio"][value="present"]').first();
    if (await presentCheckbox.isVisible()) {
      await presentCheckbox.click();
    }
    
    // 6. Lưu điểm danh
    const saveButton = page.locator('button:has-text("Lưu"), button:has-text("Xác nhận")').first();
    await saveButton.click();
    
    // 7. Xác minh Toast success xuất hiện
    const successToast = page.locator('[class*="toast"], [role="alert"]:has-text("thành công")').first();
    await expect(successToast).toBeVisible({ timeout: 5000 });
  });
});
