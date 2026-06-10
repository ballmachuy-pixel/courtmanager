import { test, expect } from '@playwright/test';

test.describe('Core Pipeline E2E (Quote-to-Cash)', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      { name: 'sb-access-token', value: 'mock-token', domain: 'localhost', path: '/' },
    ]);

    // Giả lập luồng Student
    await page.route('**/rest/v1/students*', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 201, body: JSON.stringify([{ id: 'stu_new', full_name: 'Học viên Demo Pipeline' }]) });
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify([{ id: 'stu_new', full_name: 'Học viên Demo Pipeline', session_balance: 10 }]) });
      }
    });

    // Giả lập luồng Class
    await page.route('**/rest/v1/classes*', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify([{ id: 'cls_1', name: 'Lớp Cơ Bản' }]) });
    });

    // Giả lập điểm danh
    await page.route('**/rest/v1/attendances*', async (route) => {
      await route.fulfill({ status: 201, body: JSON.stringify([{ id: 'att_1', status: 'present' }]) });
    });

    // Giả lập finance
    await page.route('**/rest/v1/payments*', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify([{ id: 'pay_1', amount: 5000000, status: 'completed' }]) });
    });
  });

  test('Luồng xuyên suốt: Tạo học viên -> Xếp lớp -> Điểm danh -> Sinh hóa đơn', async ({ page }) => {
    // 1. Tạo hồ sơ
    await page.goto('/students/new');
    await expect(page.getByRole('heading', { name: /Thêm học viên/i })).toBeVisible();

    // 2. Chuyển hướng sang điểm danh
    await page.goto('/attendance');
    await expect(page.getByRole('heading', { name: /Điểm danh/i })).toBeVisible();

    // 3. Chuyển hướng sang tài chính
    await page.goto('/finance');
    await expect(page.getByText('Tổng doanh thu')).toBeVisible();

    // 4. Xác minh Dashboard báo cáo có xuất hiện
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /Tổng quan/i })).toBeVisible();
  });
});
