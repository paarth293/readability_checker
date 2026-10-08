import { test, expect } from '@playwright/test';

test('app basic flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Know exactly where');

  // Input some text
  const text =
    'This is a test chapter. It has some short sentences. And one incredibly long, protracted, complex, and confounding sentence that should be flagged.';
  await page.fill('#chapter-input', text);

  // Analyze
  await page.click('#analyze-btn');

  // Results view — uses h2 not h1
  await expect(page.locator('h2')).toContainText('Analysis Results', { timeout: 8000 });
  await expect(page.locator('.score-card')).toBeVisible();

  // Jump works
  await page.click('.hard-item[data-jump="1"]');

  // Back works
  await page.click('#back-btn');
  await expect(page.locator('#chapter-input')).toHaveValue(text);
});

test('handles large input without crashing', async ({ page }) => {
  await page.goto('/');
  const largeText = 'This is a test. '.repeat(5000); // ~15,000 words
  await page.fill('#chapter-input', largeText);
  await page.click('#analyze-btn');
  await expect(page.locator('.score-card')).toBeVisible({ timeout: 10000 });
});
