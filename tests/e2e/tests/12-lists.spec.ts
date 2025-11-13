import { test, expect } from '@playwright/test';

test.describe('Lists Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
  });

  test('should navigate to Lists page', async ({ page }) => {
    await page.locator('text=Lists').click();
    await page.waitForTimeout(1000);
    
    // Should see either empty state or lists container
    const emptyState = page.locator('text=No lists yet');
    const listsContainer = page.locator('.flex.gap-6.p-8');
    
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasLists = await listsContainer.isVisible().catch(() => false);
    
    expect(hasEmptyState || hasLists).toBeTruthy();
  });

  test('should display empty state when no lists exist', async ({ page }) => {
    await page.locator('text=Lists').click();
    await page.waitForTimeout(1000);
    
    // Check if empty state is visible (only if there are truly no lists)
    const emptyState = page.locator('text=No lists yet');
    const hasLists = await page.locator('div[data-testid^="list-column-"]').count() > 0;
    
    if (!hasLists) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('should add entry to list via list selector', async ({ page }) => {
    // Create a new entry first
    await page.locator('button:has-text("New Entry")').click();
    await page.waitForTimeout(1000);
    
    const editor = page.locator('.ProseMirror').last();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill('Test entry for list');
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Find the "Add to list" button in the entry card (inline list selector)
    const addToListButton = page.locator('button:has-text("Add to list")').first();
    await expect(addToListButton).toBeVisible({ timeout: 5000 });
    await addToListButton.click();
    await page.waitForTimeout(500);
    
    // List selector dropdown should appear with either existing lists or "Create New List" button
    const createListButton = page.locator('button:has-text("Create New List")').first();
    await expect(createListButton).toBeVisible({ timeout: 3000 });
  });
});
