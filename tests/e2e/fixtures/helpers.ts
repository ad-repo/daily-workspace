/**
 * E2E Test Helpers
 * 
 * Common utilities for Playwright E2E tests.
 */

import { Page, expect } from '@playwright/test';

/**
 * Navigate to a specific date in the app
 */
export async function navigateToDate(page: Page, date: string) {
  await page.goto(`/day/${date}`);
  await page.waitForLoadState('load');
}

/**
 * Create a new note entry
 */
export async function createNoteEntry(page: Page, content: string, title?: string) {
  // Click "New Card" button
  await page.click('button:has-text("New Card")');
  await page.waitForTimeout(500);
  
  if (title) {
    // Fill in title
    const titleInput = page.locator('input[placeholder="Add a title to the thing"]').first();
    await titleInput.fill(title);
    await page.waitForTimeout(200);
  }
  
  // Fill in content using TipTap's contenteditable
  const contentEditor = page.locator('.ProseMirror').first();
  await contentEditor.click();
  await contentEditor.fill(content);
  
  // Wait for auto-save
  await page.waitForTimeout(1500);
}

/**
 * Add a label to a note entry
 */
export async function addLabelToEntry(page: Page, labelName: string) {
  // Click label selector
  await page.click('input[placeholder*="search or add label" i]');
  
  // Type label name
  await page.fill('input[placeholder*="search or add label" i]', labelName);
  
  // Click the label or create it
  const existingLabel = page.locator(`text="${labelName}"`).first();
  const addButton = page.locator(`text=/add.*${labelName}/i`).first();
  
  const labelExists = await existingLabel.isVisible().catch(() => false);
  
  if (labelExists) {
    await existingLabel.click();
  } else {
    await addButton.click();
  }
  
  await page.waitForTimeout(500);
}

/**
 * Search for notes
 */
export async function searchNotes(page: Page, query: string) {
  // Open search (if not already open)
  const searchButton = page.locator('button:has-text("Search")').first();
  if (await searchButton.isVisible()) {
    await searchButton.click();
  }
  
  // Enter search query
  const searchInput = page.locator('input[placeholder*="search" i]');
  await searchInput.fill(query);
  await searchInput.press('Enter');
  
  await page.waitForTimeout(500);
}

/**
 * Generate a weekly report
 */
export async function generateWeeklyReport(page: Page) {
  // Navigate to reports
  await page.goto('/reports');
  await page.waitForLoadState('networkidle');
  
  // Click generate this week
  await page.click('button:has-text("Generate This Week")');
  await page.waitForTimeout(1000);
}

/**
 * Delete a note entry
 */
export async function deleteNoteEntry(page: Page, entryIndex: number = 0) {
  const deleteButtons = page.locator('button:has(svg.lucide-trash-2)');
  await deleteButtons.nth(entryIndex).click();
  await page.waitForTimeout(500);
}

/**
 * Toggle important flag on entry
 */
export async function toggleImportant(page: Page, entryIndex: number = 0) {
  const starButtons = page.locator('button[title*="important" i]');
  await starButtons.nth(entryIndex).click();
  await page.waitForTimeout(500);
}

/**
 * Toggle completed flag on entry
 */
export async function toggleCompleted(page: Page, entryIndex: number = 0) {
  const checkButtons = page.locator('button[title*="completed" i]');
  await checkButtons.nth(entryIndex).click();
  await page.waitForTimeout(500);
}

/**
 * Navigate to settings
 */
export async function navigateToSettings(page: Page) {
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');
}

/**
 * Change theme
 */
export async function changeTheme(page: Page, themeName: string) {
  await navigateToSettings(page);
  
  // Find and click theme
  const themeButton = page.locator(`text="${themeName}"`).first();
  await themeButton.click();
  await page.waitForTimeout(500);
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: Page, urlPattern: string) {
  await page.waitForResponse((response) => 
    response.url().includes(urlPattern) && response.status() === 200
  );
}

/**
 * Get entry count on current page
 */
export async function getEntryCount(page: Page): Promise<number> {
  const entries = page.locator('[data-testid^="entry-"]');
  return await entries.count();
}

/**
 * Verify entry exists with content
 */
export async function verifyEntryExists(page: Page, content: string) {
  await expect(page.locator(`text="${content}"`)).toBeVisible();
}

/**
 * Clear all test data (use carefully!)
 */
export async function clearTestData(page: Page) {
  // This is a helper for test cleanup
  // Implementation depends on your backend cleanup endpoint
  await page.request.delete('/api/test/cleanup');
}
