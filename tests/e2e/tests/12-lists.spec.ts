import { test, expect } from '@playwright/test';

test.describe('Lists Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://frontend:5173');
    await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
  });

  test('should navigate to Lists page', async ({ page }) => {
    await page.locator('text=Lists').click();
    await page.waitForTimeout(1000);
    
    // Should see either empty state or lists
    const heading = page.locator('h1:has-text("Lists")');
    await expect(heading).toBeVisible();
  });

  test('should create a new list', async ({ page }) => {
    // Navigate to Lists page
    await page.locator('text=Lists').click();
    await page.waitForTimeout(1000);
    
    // Click Create List button
    await page.locator('button:has-text("Create List")').click();
    await page.waitForTimeout(500);
    
    // Fill in list details
    await page.fill('input[placeholder="Enter list name"]', 'E2E Test List');
    await page.fill('textarea[placeholder*="description"]', 'Created by E2E test');
    
    // Submit
    await page.locator('button:has-text("Create")').click();
    await page.waitForTimeout(1500);
    
    // Verify list was created
    await expect(page.locator('text=E2E Test List')).toBeVisible();
  });

  test('should add entry to list', async ({ page }) => {
    // Create a new entry first
    await page.locator('button:has-text("New Entry")').click();
    await page.waitForTimeout(1000);
    
    const editor = page.locator('.ProseMirror').last();
    await editor.fill('Test entry for list');
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Hover over entry to show list button
    const entryCard = page.locator('.entry-card-container').first();
    await entryCard.hover();
    await page.waitForTimeout(500);
    
    // Click the list selector button (Columns icon)
    const listButton = entryCard.locator('button[title="Add to lists"]');
    await listButton.click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    
    // Modal should appear
    await expect(page.locator('text=Organize in Lists')).toBeVisible();
  });

  test('should delete a list', async ({ page }) => {
    // Navigate to Lists page
    await page.locator('text=Lists').click();
    await page.waitForTimeout(1000);
    
    // Create a list to delete
    await page.locator('button:has-text("Create List")').click();
    await page.waitForTimeout(500);
    await page.fill('input[placeholder="Enter list name"]', 'List to Delete');
    await page.locator('button:has-text("Create")').click();
    await page.waitForTimeout(1500);
    
    // Hover over list column to show delete button
    const listColumn = page.locator('text=List to Delete').locator('..');
    await listColumn.hover();
    await page.waitForTimeout(500);
    
    // Click delete button (trash icon)
    page.on('dialog', dialog => dialog.accept());
    await listColumn.locator('button[title="Delete list"]').click();
    await page.waitForTimeout(1500);
    
    // Verify list is deleted
    await expect(page.locator('text=List to Delete')).not.toBeVisible();
  });

  test('should display empty state when no lists exist', async ({ page }) => {
    await page.locator('text=Lists').click();
    await page.waitForTimeout(1000);
    
    // Check for either empty state or existing lists
    // If there are no lists, should show empty state
    const hasLists = await page.locator('.flex-shrink-0.w-80').count() > 0;
    if (!hasLists) {
      await expect(page.locator('text=No lists yet')).toBeVisible();
    }
  });
});

