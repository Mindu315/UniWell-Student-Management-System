const { test, expect } = require('@playwright/test');

const fakeToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJpZCI6InUxIiwicm9sZSI6InN0dWRlbnQiLCJmdWxsTmFtZSI6IlRlc3QgU3R1ZGVudCJ9.' +
  'signature';

function setupAuthenticatedStorage(page) {
  return page.addInitScript((token) => {
    window.localStorage.setItem('token', token);
  }, fakeToken);
}

async function mockCommonAuthedCalls(page) {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          user: {
            _id: 'u1',
            fullName: 'Test Student',
            role: 'student',
            email: 'test@example.com'
          }
        }
      })
    });
  });
}

test.describe('AI Quiz Generator module', () => {
  test('shows generated quiz, allows submission, and supports delete', async ({ page }) => {
    await setupAuthenticatedStorage(page);
    await mockCommonAuthedCalls(page);

    const generatedQuiz = {
      _id: 'quiz-1',
      quizTitle: 'Generated OS Quiz',
      subject: 'Operating Systems',
      difficulty: 'medium',
      questionCount: 2,
      questions: [
        {
          question: 'Which scheduling policy can cause starvation?',
          options: ['Round Robin', 'FCFS', 'SJF', 'FIFO'],
          correctOptionIndex: 2,
          explanation: 'SJF may starve long jobs when shorter jobs keep arriving.'
        },
        {
          question: 'Which memory issue is solved by paging?',
          options: ['Deadlock', 'External fragmentation', 'Race condition', 'Thrashing'],
          correctOptionIndex: 1,
          explanation: 'Paging removes external fragmentation.'
        }
      ]
    };

    await page.route('**/api/ai-quizzes', async (route, request) => {
      if (request.method() !== 'GET') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { quizzes: [generatedQuiz] }
        })
      });
    });

    await page.route('**/api/ai-quizzes/analytics', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            overall: { averageCorrectPercent: 0, attemptsCount: 0 },
            recommendations: { strengths: [], improvements: [] }
          }
        })
      });
    });

    await page.route('**/api/ai-quizzes/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { quiz: generatedQuiz }
        })
      });
    });

    await page.route('**/api/ai-quizzes/quiz-1/attempts', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: {} })
      });
    });

    await page.route('**/api/ai-quizzes/quiz-1', async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { quiz: generatedQuiz }
          })
        });
        return;
      }

      if (request.method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: {} })
        });
        return;
      }

      await route.continue();
    });

    await page.goto('/ai-quizzes');

    await expect(page.getByRole('heading', { level: 1, name: 'AI Quizzes 🤖' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Saved Quizzes/i })).toBeVisible();

    const pdfPath = 'tests/fixtures/sample.pdf';
    await page.setInputFiles('input[type="file"]', pdfPath);
    await page.getByRole('button', { name: 'Generate Quiz' }).click();

    //await expect(page.getByText('Generated OS Quiz')).toBeVisible();
    await expect(page.getByText('Which scheduling policy can cause starvation?')).toBeVisible();

    const firstQuestion = page.locator('.ai-quiz-question').first();
    await firstQuestion.getByRole('button').nth(2).click();
    const secondQuestion = page.locator('.ai-quiz-question').nth(1);
    await secondQuestion.getByRole('button').nth(1).click();

    await page.getByRole('button', { name: 'Reveal Answers' }).click();
    await expect(page.getByText(/Score:\s*2\s*\/\s*2/i)).toBeVisible();

    await page.getByRole('button', { name: /Save Result & View Analytics/i }).click();
    await expect(page.getByText('Saved! Analytics updated.')).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete' }).click();
  });

  test('validates that PDF upload is required', async ({ page }) => {
    await setupAuthenticatedStorage(page);
    await mockCommonAuthedCalls(page);

    await page.route('**/api/ai-quizzes', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { quizzes: [] } })
      });
    });

    await page.route('**/api/ai-quizzes/analytics', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            overall: { averageCorrectPercent: 0, attemptsCount: 0 },
            recommendations: { strengths: [], improvements: [] }
          }
        })
      });
    });

    await page.goto('/ai-quizzes');
    await page.getByRole('button', { name: 'Generate Quiz' }).click();
    await expect(page.locator('input[type="file"]:invalid')).toHaveCount(1);
  });
});
