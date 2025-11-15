/**
 * E2E Tests: Pinned Entries
 * 
 * Tests pinned entry functionality including pin, unpin, copy behavior,
 * and deletion of all copies.
 * 
 * @tag pinned-entries
 */

import { test, expect } from '@playwright/test';

test.describe.skip('Pinned Entries', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
  });

  test('should pin an entry', async ({ page }) => {
    // Create an entry
    const testDate = '2024-05-01';
    await page.goto(`/day/${testDate}`);
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
    
    const testContent = `Pin Test ${Date.now()}`;
    await page.getByRole('button', { name: /new card/i }).click();
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(testContent);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Find pin button - it has title "Pin (copy to future days)"
    const pinButton = page.locator('button[title*="Pin (copy to future days)"]').or(
      page.locator('button[title*="pin" i]')
    ).first();
    
    await expect(pinButton).toBeVisible({ timeout: 5000 });
    await pinButton.click();
    
    // Wait for API response
    await page.waitForResponse(
      resp => resp.url().includes('/api/entries/') && resp.status() >= 200 && resp.status() < 300,
      { timeout: 5000 }
    );
    
    await page.waitForTimeout(1000);
    
    // Verify pin button shows pinned state - title should change to "Unpin"
    const unpinButton = page.locator('button[title*="Unpin"]').first();
    await expect(unpinButton).toBeVisible({ timeout: 3000 });
  });

  test('should copy pinned entry to next day', async ({ page }) => {
    // Create and pin an entry on a specific date
    const testDate1 = '2024-05-02';
    await page.goto(`/day/${testDate1}`);
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
    
    const testContent = `Pinned Copy Test ${Date.now()}`;
    await page.getByRole('button', { name: /new card/i }).click();
    let editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(testContent);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Pin the entry
    const pinButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /pin/i }).or(
      page.locator('button[title*="pin" i]')
    ).first();
    
    await pinButton.click();
    await page.waitForTimeout(1500);
    
    // Navigate to next day
    const testDate2 = '2024-05-03';
    await page.goto(`/day/${testDate2}`);
    await page.waitForTimeout(1500);
    
    // Verify pinned entry appears
    await expect(page.locator(`text="${testContent}"`)).toBeVisible({ timeout: 5000 });
  });

  test('should unpin an entry', async ({ page }) => {
    // Create and pin an entry
    const testDate = '2024-05-04';
    await page.goto(`/day/${testDate}`);
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
    
    const testContent = `Unpin Test ${Date.now()}`;
    await page.getByRole('button', { name: /new card/i }).click();
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(testContent);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Pin the entry
    let pinButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /pin/i }).or(
      page.locator('button[title*="pin" i]')
    ).first();
    
    await pinButton.click();
    await page.waitForTimeout(1500);
    
    // Unpin the entry (click pin button again)
    pinButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /pin/i }).or(
      page.locator('button[title*="pin" i]')
    ).first();
    
    await pinButton.click();
    
    // Wait for API response
    await page.waitForResponse(
      resp => resp.url().includes('/api/entries/') && resp.status() >= 200 && resp.status() < 300,
      { timeout: 5000 }
    );
    
    await page.waitForTimeout(1500);
    
    // Navigate to next day and verify entry does NOT appear
    const testDate2 = '2024-05-05';
    await page.goto(`/day/${testDate2}`);
    await page.waitForTimeout(1500);
    
    // Entry should not be visible on new date
    await expect(page.locator(`text="${testContent}"`)).not.toBeVisible();
  });

  test('should not copy unpinned entry to new dates', async ({ page }) => {
    // Create an entry without pinning
    const testDate1 = '2024-05-06';
    await page.goto(`/day/${testDate1}`);
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
    
    const testContent = `Not Pinned ${Date.now()}`;
    await page.getByRole('button', { name: /new card/i }).click();
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(testContent);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Do NOT pin the entry
    
    // Navigate to next day
    const testDate2 = '2024-05-07';
    await page.goto(`/day/${testDate2}`);
    await page.waitForTimeout(1500);
    
    // Entry should NOT appear
    await expect(page.locator(`text="${testContent}"`)).not.toBeVisible();
  });

  test('should delete pinned entry and remove all copies', async ({ page }) => {
    // Create and pin an entry
    const testDate1 = '2024-05-08';
    await page.goto(`/day/${testDate1}`);
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
    
    const testContent = `Delete Pinned ${Date.now()}`;
    await page.getByRole('button', { name: /new card/i }).click();
    let editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(testContent);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Pin the entry
    const pinButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /pin/i}).or(
      page.locator('button[title*="pin" i]')
    ).first();
    
    await pinButton.click();
    await page.waitForTimeout(1500);
    
    // Navigate to next day to create a copy
    const testDate2 = '2024-05-09';
    await page.goto(`/day/${testDate2}`);
    await page.waitForTimeout(1500);
    
    // Verify copy exists
    await expect(page.locator(`text="${testContent}"`)).toBeVisible();
    
    // Delete the entry
    const entryCard = page.locator(`text="${testContent}"`).locator('..').locator('..').locator('..');
    const deleteButton = entryCard.locator('button:has(svg.lucide-trash-2)').or(
      entryCard.locator('button[title*="delete" i]')
    ).first();
    
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    await deleteButton.click();
    
    // Wait for delete API call
    await page.waitForResponse(
      resp => resp.url().includes('/api/entries/') && resp.status() >= 200 && resp.status() < 300,
      { timeout: 5000 }
    );
    
    await page.waitForTimeout(1500);
    
    // Verify entry is gone from current date
    await expect(page.locator(`text="${testContent}"`)).not.toBeVisible();
    
    // Navigate back to original date
    await page.goto(`/day/${testDate1}`);
    await page.waitForTimeout(1500);
    
    // Verify entry is also gone from original date
    await expect(page.locator(`text="${testContent}"`)).not.toBeVisible();
    
    // Navigate to a future date
    const testDate3 = '2024-05-10';
    await page.goto(`/day/${testDate3}`);
    await page.waitForTimeout(1500);
    
    // Verify entry does not appear on new dates
    await expect(page.locator(`text="${testContent}"`)).not.toBeVisible();
  });

  test('should handle multiple pinned entries correctly', async ({ page }) => {
    // Create and pin multiple entries
    const testDate = '2024-05-11';
    await page.goto(`/day/${testDate}`);
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
    
    const entry1Content = `Multi Pin 1 ${Date.now()}`;
    const entry2Content = `Multi Pin 2 ${Date.now()}`;
    
    // Create first entry
    await page.getByRole('button', { name: /new card/i }).click();
    let editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(entry1Content);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Pin first entry
    let pinButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /pin/i }).or(
      page.locator('button[title*="pin" i]')
    ).first();
    await pinButton.click();
    await page.waitForTimeout(1500);
    
    // Create second entry
    await page.getByRole('button', { name: /new card/i }).click();
    editor = page.locator('.ProseMirror').last();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(entry2Content);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Pin second entry
    pinButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /pin/i }).or(
      page.locator('button[title*="pin" i]')
    ).last();
    await pinButton.click();
    await page.waitForTimeout(1500);
    
    // Navigate to next day
    const testDate2 = '2024-05-12';
    await page.goto(`/day/${testDate2}`);
    await page.waitForTimeout(1500);
    
    // Verify both entries appear
    await expect(page.locator(`text="${entry1Content}"`)).toBeVisible();
    await expect(page.locator(`text="${entry2Content}"`)).toBeVisible();
  });

  test('should prevent duplicate pinned entries on same date', async ({ page }) => {
    // Create and pin an entry
    const testDate = '2024-05-13';
    await page.goto(`/day/${testDate}`);
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
    
    const testContent = `Duplicate Prevention ${Date.now()}`;
    await page.getByRole('button', { name: /new card/i }).click();
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(testContent);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Pin the entry
    const pinButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /pin/i }).or(
      page.locator('button[title*="pin" i]')
    ).first();
    await pinButton.click();
    await page.waitForTimeout(1500);
    
    // Navigate to next day (creates copy)
    const testDate2 = '2024-05-14';
    await page.goto(`/day/${testDate2}`);
    await page.waitForTimeout(1500);
    
    // Verify entry appears
    await expect(page.locator(`text="${testContent}"`)).toBeVisible();
    
    // Reload the page (should not create duplicate)
    await page.reload();
    await page.waitForTimeout(1500);
    
    // Count occurrences - should only be 1
    const allMatches = page.locator(`text="${testContent}"`);
    const matchCount = await allMatches.count();
    
    expect(matchCount).toBe(1);
  });

  test('should maintain pin state after page reload', async ({ page }) => {
    // Create and pin an entry
    const testDate = '2024-05-15';
    await page.goto(`/day/${testDate}`);
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
    
    const testContent = `Pin Persistence ${Date.now()}`;
    await page.getByRole('button', { name: /new card/i }).click();
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(testContent);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Pin the entry
    const pinButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /pin/i }).or(
      page.locator('button[title*="pin" i]')
    ).first();
    await pinButton.click();
    await page.waitForTimeout(1500);
    
    // Reload page
    await page.reload();
    await page.waitForTimeout(1500);
    
    // Verify entry still exists
    await expect(page.locator(`text="${testContent}"`)).toBeVisible();
    
    // Navigate to next day
    const testDate2 = '2024-05-16';
    await page.goto(`/day/${testDate2}`);
    await page.waitForTimeout(1500);
    
    // Verify pinned entry appears (pin state persisted)
    await expect(page.locator(`text="${testContent}"`)).toBeVisible();
  });
});

