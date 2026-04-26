const { test, expect } = require('@playwright/test');

const studentToken = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJpZCI6InUxMjMiLCJyb2xlIjoic3R1ZGVudCJ9',
  'signature'
].join('.');

const userPayload = {
  _id: 'u123',
  fullName: 'Stress Test User',
  email: 'stress.user@university.edu',
  studentId: 'IT220001',
  faculty: 'Computing',
  degreeProgram: 'Software Engineering',
  year: 3,
  role: 'student'
};

test('redirects to login when user is not authenticated', async ({ page }) => {
  await page.goto('/stress-management');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome Back!' })).toBeVisible();
});

test('loads stress history and submits a new daily check-in', async ({ page }) => {
  await page.addInitScript((token) => {
    window.localStorage.setItem('token', token);
  }, studentToken);

  const historyCheckin = {
    _id: 'chk-001',
    energy: 4,
    sleep: 3,
    focus: 3,
    stress: 2,
    score: 6,
    conditionKey: 'moderate',
    conditionLabel: 'Moderate Pressure',
    note: 'Busy but manageable',
    submittedAt: '2026-04-24T08:00:00.000Z'
  };

  const newCheckin = {
    _id: 'chk-002',
    energy: 1,
    sleep: 1,
    focus: 1,
    stress: 5,
    score: -7,
    conditionKey: 'critical',
    conditionLabel: 'Critical Stress',
    note: 'Very heavy workload today',
    submittedAt: '2026-04-25T08:00:00.000Z'
  };

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
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            count: 1,
            checkins: [historyCheckin]
          }
        })
      });
      return;
    }

    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          checkin: newCheckin
        }
      })
    });
  });

  await page.goto('/stress-management');

  await expect(
    page.getByRole('heading', { name: 'Stress Management & Wellbeing Awareness' })
  ).toBeVisible();

  await page.getByRole('group', { name: 'Energy Level' }).getByRole('button', { name: /1\s*Very Low/i }).click();
  await page.getByRole('group', { name: 'Sleep Quality' }).getByRole('button', { name: /1\s*Very Low/i }).click();
  await page.getByRole('group', { name: 'Focus Level' }).getByRole('button', { name: /1\s*Very Low/i }).click();
  await page.getByRole('group', { name: 'Stress Level' }).getByRole('button', { name: /5\s*Very High/i }).click();
  await page.getByLabel('Would you like to note anything about today?').fill('Very heavy workload today');

  await page.getByRole('button', { name: 'Submit Check-In' }).click();

  await expect(page.getByRole('heading', { name: 'Submitted Successfully' })).toBeVisible();
  await expect(page.locator('.stress-result-card')).toContainText('Critical Stress');
  await expect(page.locator('.stress-result-card')).toContainText('-7');
});
