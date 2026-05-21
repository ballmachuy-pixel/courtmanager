# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-finance.spec.ts >> Finance Module E2E (Happy Path) >> Luồng tạo giao dịch thanh toán thành công
- Location: e2e\05-finance.spec.ts:78:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Quản lý Tài chính' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Quản lý Tài chính' })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - link "Quay lại trang chủ" [ref=e5] [cursor=pointer]:
      - /url: /
      - img [ref=e6]
      - generic [ref=e8]: Quay lại trang chủ
    - generic [ref=e9]:
      - img [ref=e12]
      - generic [ref=e19]:
        - heading "CourtManager" [level=1] [ref=e20]
        - paragraph [ref=e21]: Quản lý học viện thể thao chuyên nghiệp
      - button "Tiếp tục với Google" [ref=e22]:
        - img [ref=e23]
        - generic [ref=e29]: Tiếp tục với Google
      - generic [ref=e32]: HOẶC ĐĂNG NHẬP BẰNG EMAIL
      - generic [ref=e34]:
        - generic [ref=e35]:
          - img [ref=e37]
          - textbox "Địa chỉ email" [ref=e40]
        - generic [ref=e41]:
          - img [ref=e43]
          - textbox "Mật khẩu" [ref=e46]
        - button "ĐĂNG NHẬP" [ref=e48]:
          - generic [ref=e49]: ĐĂNG NHẬP
          - img [ref=e50]
      - contentinfo [ref=e52]:
        - generic [ref=e53]:
          - img [ref=e54]
          - generic [ref=e57]: CourtManager · Secure Authentication
    - generic [ref=e58]:
      - link "Bạn là Huấn luyện viên? Đi tới cổng dành riêng" [ref=e59] [cursor=pointer]:
        - /url: /login
        - img [ref=e60]
        - text: Bạn là Huấn luyện viên? Đi tới cổng dành riêng
      - generic [ref=e66]:
        - img [ref=e67]
        - generic [ref=e70]: Tự động tối ưu Android & iOS
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e76] [cursor=pointer]:
    - img [ref=e77]
  - alert [ref=e80]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Finance Module E2E (Happy Path)', () => {
  4  |   // Mock login and data for the entire suite
  5  |   test.beforeEach(async ({ page }) => {
  6  |     // 1. Giả lập đăng nhập bằng cookie (tránh login flow chậm)
  7  |     await page.context().addCookies([
  8  |       {
  9  |         name: 'sb-access-token',
  10 |         value: 'mock-token',
  11 |         domain: 'localhost',
  12 |         path: '/',
  13 |       },
  14 |     ]);
  15 | 
  16 |     // 2. Chặn các request API Supabase và trả về dữ liệu giả (Test Data Management)
  17 |     await page.route('**/rest/v1/payments*', async (route) => {
  18 |       const request = route.request();
  19 |       if (request.method() === 'GET') {
  20 |         await route.fulfill({
  21 |           status: 200,
  22 |           contentType: 'application/json',
  23 |           body: JSON.stringify([
  24 |             {
  25 |               id: 'pay_1',
  26 |               amount: 5000000,
  27 |               payment_date: '2026-05-21',
  28 |               status: 'completed',
  29 |               description: 'Đóng học phí tháng 5',
  30 |               payment_method: 'transfer',
  31 |               students: { full_name: 'Nguyễn Văn A' }
  32 |             }
  33 |           ]),
  34 |         });
  35 |       } else if (request.method() === 'POST') {
  36 |         // Mock ghi nhận thanh toán thành công
  37 |         await route.fulfill({
  38 |           status: 201,
  39 |           contentType: 'application/json',
  40 |           body: JSON.stringify([{ id: 'pay_new', status: 'completed' }]),
  41 |         });
  42 |       } else {
  43 |         await route.continue();
  44 |       }
  45 |     });
  46 | 
  47 |     await page.route('**/rest/v1/students*', async (route) => {
  48 |       await route.fulfill({
  49 |         status: 200,
  50 |         contentType: 'application/json',
  51 |         body: JSON.stringify([{ id: 'stu_1', full_name: 'Nguyễn Văn A' }]),
  52 |       });
  53 |     });
  54 | 
  55 |     await page.route('**/rest/v1/tuition_packages*', async (route) => {
  56 |       await route.fulfill({
  57 |         status: 200,
  58 |         contentType: 'application/json',
  59 |         body: JSON.stringify([{ id: 'pkg_1', name: 'Gói 10 Buổi', price: 5000000 }]),
  60 |       });
  61 |     });
  62 |   });
  63 | 
  64 |   test('Hiển thị giao diện quản lý tài chính và danh sách giao dịch', async ({ page }) => {
  65 |     await page.goto('/finance');
  66 | 
  67 |     // Verify tiêu đề
  68 |     await expect(page.getByRole('heading', { name: 'Quản lý Tài chính' })).toBeVisible();
  69 | 
  70 |     // Verify thẻ thống kê (Tổng doanh thu)
  71 |     await expect(page.getByText('Tổng doanh thu')).toBeVisible();
  72 | 
  73 |     // Verify bảng danh sách giao dịch có dữ liệu mock
  74 |     await expect(page.getByText('Nguyễn Văn A').first()).toBeVisible();
  75 |     await expect(page.getByText('Đóng học phí tháng 5')).toBeVisible();
  76 |   });
  77 | 
  78 |   test('Luồng tạo giao dịch thanh toán thành công', async ({ page }) => {
  79 |     await page.goto('/finance');
  80 | 
  81 |     // 1. Mở form thanh toán
  82 |     const addPaymentBtn = page.getByRole('button', { name: /Ghi nhận/i });
  83 |     if (await addPaymentBtn.isVisible()) {
  84 |       await addPaymentBtn.click();
  85 |     }
  86 | 
  87 |     // 2. Điền form
  88 |     // Note: Do form component (RecordPaymentForm) có thể là Dialog, ta giả định các trường.
  89 |     // Nếu UI chưa có sẵn các selector chuẩn, test này sẽ verify việc mở modal.
  90 |     // Thực tế sẽ click Submit và chờ Toast success.
  91 |     
  92 |     // Tạm thời verify UI không crash và render trang thành công.
> 93 |     await expect(page.getByRole('heading', { name: 'Quản lý Tài chính' })).toBeVisible();
     |                                                                            ^ Error: expect(locator).toBeVisible() failed
  94 |   });
  95 | });
  96 | 
```