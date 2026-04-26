const { test, expect } = require('@playwright/test');

const studentToken = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJpZCI6InUxMjMiLCJyb2xlIjoic3R1ZGVudCJ9',
  'signature'
].join('.');

const userPayload = {
  _id: 'u123',
  fullName: 'Test Student',
  email: 'student@university.edu',
  studentId: 'IT220001',
  faculty: 'Computing',
  degreeProgram: 'Software Engineering',
  year: 3,
  role: 'student'
};

test('logs in successfully and redirects to dashboard', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Login successful',
        data: {
          token: studentToken,
          user: userPayload
        }
      })
    });
  });

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          user: userPayload
        }
      })
    });
  });

  await page.route('**/api/wellbeing/check-ins*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          count: 0,
          checkins: []
        }
      })
    });
  });

  await page.goto('/login');

  await page.getByLabel('Email Address').fill('student@university.edu');
  await page.getByLabel('Password', { exact: true }).fill('Password123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Weekly Progress' })).toBeVisible();

  const savedToken = await page.evaluate(() => window.localStorage.getItem('token'));
  expect(savedToken).toBe(studentToken);
});

test('shows an error for invalid login credentials', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        message: 'Invalid email or password'
      })
    });
  });

  await page.goto('/login');

  await page.getByLabel('Email Address').fill('wrong@university.edu');
  await page.getByLabel('Password', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText('Invalid email or password')).toBeVisible();
});
