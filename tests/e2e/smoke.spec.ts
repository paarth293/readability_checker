import { test, expect } from '@playwright/test';

test('app basic flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Chapter Readability Checker');

  // Input some text
  const text =
    'This is a test chapter. It has some short sentences. And one incredibly long, protracted, complex, and confounding sentence that should be flagged.';
  await page.fill('#chapter-input', text);

  // Analyze
  await page.click('#analyze-btn');

  // Results view
  await expect(page.locator('h1')).toHaveText('Analysis Results');
  await expect(page.locator('.score-card')).toBeVisible();
  await expect(page.locator('.hard-sentences li')).toHaveCount(1);

  // Jump works
  await page.click('[data-jump="1"]');

  // Back works
  await page.click('#back-btn');
  await expect(page.locator('#chapter-input')).toHaveValue(text);
});
