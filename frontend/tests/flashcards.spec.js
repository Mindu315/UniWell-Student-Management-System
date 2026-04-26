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

test.describe('Flashcard module', () => {
  test('create, filter, flip, edit, and delete flashcards', async ({ page }) => {
    await setupAuthenticatedStorage(page);
    await mockCommonAuthedCalls(page);

    const cards = [
      {
        _id: 'card-1',
        subject: 'Biology',
        question: 'What is photosynthesis?',
        answer: 'Process used by plants to convert light into chemical energy.'
      },
      {
        _id: 'card-2',
        subject: 'Math',
        question: 'Derivative of x^2?',
        answer: '2x'
      }
    ];

    await page.route('**/api/flashcards', async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { flashcards: cards }
          })
        });
        return;
      }

      if (request.method() === 'POST') {
        cards.push({
          _id: 'card-3',
          subject: 'Physics',
          question: 'What is velocity?',
          answer: 'Speed with direction.'
        });
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { flashcard: cards[cards.length - 1] }
          })
        });
        return;
      }

      await route.continue();
    });

    await page.route('**/api/flashcards/*', async (route, request) => {
      const id = request.url().split('/').pop();
      if (request.method() === 'PUT') {
        const idx = cards.findIndex((c) => c._id === id);
        if (idx >= 0) {
          cards[idx] = { ...cards[idx], answer: 'Updated answer for biology card.' };
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { flashcard: idx >= 0 ? cards[idx] : null } })
        });
        return;
      }

      if (request.method() === 'DELETE') {
        const deleteIndex = cards.findIndex((c) => c._id === id);
        if (deleteIndex >= 0) cards.splice(deleteIndex, 1);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: {} })
        });
        return;
      }

      await route.continue();
    });

    await page.goto('/flashcards');

    await expect(page.getByRole('heading', { level: 1, name: 'Flashcards 🃏' })).toBeVisible();
    await expect(page.getByText('What is photosynthesis?')).toBeVisible();

    const flashcardForm = page.locator('form.flashcard-form-inner');
    await flashcardForm.locator('input[name="subject"]').fill('Physics');
    await flashcardForm.locator('textarea[name="question"]').fill('What is velocity?');
    await flashcardForm.locator('textarea[name="answer"]').fill('Speed with direction.');
    await page.getByRole('button', { name: 'Add Flashcard' }).click();
    const swalConfirm = page.locator('.swal2-confirm');
    if (await swalConfirm.isVisible({ timeout: 3000 }).catch(() => false)) {
      await swalConfirm.click({ force: true });
    }

    await page.getByLabel('Filter by subject').fill('Math');
    await expect(page.getByText('Derivative of x^2?')).toBeVisible();
    await expect(page.getByText('What is photosynthesis?')).not.toBeVisible();
    await page.getByLabel('Filter by subject').fill('');

    const biologyCard = page.locator('.flashcard-item', {
      has: page.locator('.flashcard-subject', { hasText: 'Biology' })
    });
    await biologyCard.locator('button.flashcard-flip').click();
    await expect(page.getByText('Process used by plants to convert light into chemical energy.')).toBeVisible();

    await biologyCard.getByRole('button', { name: 'Edit' }).click();
    await flashcardForm.locator('textarea[name="answer"]').fill('Updated answer for biology card.');
    await page.getByRole('button', { name: 'Update Flashcard' }).click();
    await expect(page.getByText('Flashcard updated successfully!')).toBeVisible();
    if (await swalConfirm.isVisible({ timeout: 1000 }).catch(() => false)) {
      await swalConfirm.click({ force: true });
    }

    await page.locator('.flashcard-item .btn-danger.flashcard-action-btn').first().click();
    await page.getByRole('button', { name: 'Yes, delete it!' }).click();
    await expect(page.getByText('Flashcard has been deleted.')).toBeVisible();
  });
});
