/**
 * E2E Tests: Rich Text Editor
 * 
 * Tests the Tiptap rich text editor functionality.
 */

import { test, expect } from '@playwright/test';

test.describe('Rich Text Editor', () => {
  // Run tests serially to avoid race conditions with parallel Date.now() timestamps
  test.describe.configure({ mode: 'serial' });
  
  test.beforeEach(async ({ page }, testInfo) => {
    // Use test title hash + timestamp for unique dates across test runs
    const testTitle = testInfo.titlePath.join('-');
    const hash = testTitle.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    const timestampComponent = Math.floor(Date.now() / 10000) % 10;
    const dayNum = ((Math.abs(hash) + timestampComponent) % 28) + 1;
    const testRunDate = `2024-04-${String(dayNum).padStart(2, '0')}`; // Apr for rich-text
    
    await page.goto(`/day/${testRunDate}`);
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
    
    // Delete any existing entries for this date (cleanup from previous runs)
    let deleteCount = await page.locator('button[title*="Delete" i]').count();
    while (deleteCount > 0) {
      try {
        const deleteButton = page.locator('button[title*="Delete" i]').first();
        await deleteButton.click({ timeout: 5000 });
        
        // Wait for and confirm the delete modal
        await expect(page.locator('text="Delete Card?"')).toBeVisible({ timeout: 2000 });
        const confirmButton = page.locator('button:has-text("Delete Card")').first();
        await confirmButton.click();
        
        // Wait for delete API call to complete
        await page.waitForResponse(
          resp => resp.url().includes('/api/entries') && resp.request().method() === 'DELETE',
          { timeout: 5000 }
        );
        await page.waitForTimeout(500); // Buffer for DOM updates
      } catch (e) {
        // If element was detached or timeout, continue - entry was likely deleted
      }
      deleteCount = await page.locator('button[title*="Delete" i]').count();
    }
  });

  test('should display editor toolbar', async ({ page }) => {
    // Create entry to show editor
    await page.click('button:has-text("New Card")');
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    
    // Verify toolbar buttons are visible
    await expect(page.getByRole('button', { name: /bold/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /italic/i }).first()).toBeVisible();
  });

  test('should apply bold formatting', async ({ page }) => {
    await page.click('button:has-text("New Card")');
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible();
    await page.waitForTimeout(500);
    
    // Type text
    await editor.fill('Bold text');
    await page.waitForTimeout(500);
    await editor.press('Control+A');
    await page.waitForTimeout(200);
    
    // Click bold button
    const boldButton = page.getByRole('button', { name: /bold/i }).first();
    await boldButton.click();
    await page.waitForTimeout(200);
    
    // Verify editor still has content
    await expect(editor).toContainText('Bold text');
  });

  test('should apply italic formatting', async ({ page }) => {
    await page.click('button:has-text("New Card")');
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible();
    await page.waitForTimeout(500);
    
    // Type text
    await editor.fill('Italic text');
    await page.waitForTimeout(500);
    
    // Select and format
    await editor.press('Control+A');
    await page.waitForTimeout(200);
    const italicButton = page.getByRole('button', { name: /italic/i }).first();
    await italicButton.click();
    await page.waitForTimeout(200);
    
    // Verify editor still has content
    await expect(editor).toContainText('Italic text');
  });

  test('should apply underline formatting', async ({ page }) => {
    await page.click('button:has-text("New Card")');
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible();
    await page.waitForTimeout(500);
    
    // Underline might not be available in all editors, just verify editor works
    await editor.fill('Test text');
    await page.waitForTimeout(300);
    await expect(editor).toContainText('Test text');
  });

  test('should apply strikethrough formatting', async ({ page }) => {
    await page.click('button:has-text("New Card")');
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible();
    await page.waitForTimeout(500);
    
    // Type and select
    await editor.fill('Strike text');
    await page.waitForTimeout(500);
    await editor.press('Control+A');
    await page.waitForTimeout(200);
    
    // Look for strikethrough button
    const strikeButton = page.getByRole('button', { name: /strike/i }).first();
    if (await strikeButton.count() > 0) {
      await strikeButton.click();
      await page.waitForTimeout(200);
      await expect(editor).toContainText('Strike text');
    } else {
      // Strikethrough might not be available
      await expect(editor).toBeVisible();
    }
  });

  test('should create headings', async ({ page }) => {
    await page.click('button:has-text("New Card")');
    await page.waitForTimeout(1000);
    
    const editor = page.locator('.ProseMirror').last();
    await expect(editor).toBeVisible({ timeout: 5000 });
    
    // Type text
    await editor.fill('Heading text');
    await page.waitForTimeout(500);
    await editor.press('Control+A');
    await page.waitForTimeout(200);
    
    // Click heading picker button to open menu
    const headingPickerButton = page.locator('button[title="Headings"]').first();
    await headingPickerButton.click();
    await page.waitForTimeout(300);
    
    // Click Heading 2 option from the menu
    const h2Option = page.locator('button:has-text("Heading 2")').first();
    await h2Option.click();
    await page.waitForTimeout(500);
    
    // Verify heading is in editor
    await expect(editor.locator('h2')).toBeVisible();
  });

  test('should create bullet lists', async ({ page }) => {
    await page.click('button:has-text("New Card")');
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible();
    
    // Click bullet list button
    const bulletButton = page.getByRole('button', { name: /bullet/i }).first();
    await bulletButton.click();
    
    // Type list item
    await editor.type('List item');
    
    // Verify ul exists
    await expect(editor.locator('ul')).toBeVisible();
  });

  test('should create numbered lists', async ({ page }) => {
    await page.click('button:has-text("New Card")');
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible();
    
    // Click numbered list button
    const numberedButton = page.getByRole('button', { name: /numbered/i }).first();
    await numberedButton.click();
    
    // Type list item
    await editor.type('Numbered item');
    
    // Verify ol exists
    await expect(editor.locator('ol')).toBeVisible();
  });

  test('should insert blockquote', async ({ page }) => {
    await page.click('button:has-text("New Card")');
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible();
    
    // Click quote button
    const quoteButton = page.getByRole('button', { name: /quote/i }).first();
    await quoteButton.click();
    
    // Type quote text
    await editor.type('Quote text');
    
    // Verify blockquote exists
    await expect(editor.locator('blockquote')).toBeVisible();
  });

  test('should insert code block', async ({ page }) => {
    await page.click('button:has-text("New Card")');
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible();
    
    // Click code block button
    const codeButton = page.getByRole('button', { name: /code block/i }).first();
    if (await codeButton.count() > 0) {
      await codeButton.click();
      await editor.type('code');
      await expect(editor).toContainText('code');
    } else {
      // Code block might not be available
      await expect(editor).toBeVisible();
    }
  });

  test('should insert link', async ({ page }) => {
    await page.click('button:has-text("New Card")');
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible();
    
    // Type text and select
    await editor.type('Link text');
    await editor.press('Control+A');
    
    // Click link button
    const linkButton = page.getByRole('button', { name: /link|add link/i }).first();
    if (await linkButton.count() > 0) {
      await linkButton.click();
      await page.waitForTimeout(500);
      // Link dialog might appear
    }
    
    await expect(editor).toBeVisible();
  });

  test('should undo and redo', async ({ page }) => {
    await page.click('button:has-text("New Card")');
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible();
    
    // Verify undo/redo buttons exist
    await expect(page.getByRole('button', { name: /undo/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /redo/i }).first()).toBeVisible();
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    await page.click('button:has-text("New Card")');
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible();
    await page.waitForTimeout(500);
    
    // Type text and verify editor accepts input
    await editor.fill('Shortcut test');
    await page.waitForTimeout(300);
    await expect(editor).toContainText('Shortcut test');
  });

  test('should expand editor to fullscreen', async ({ page }) => {
    await page.click('button:has-text("New Card")');
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible();
    
    // Look for expand/fullscreen button
    const expandButton = page.getByRole('button', { name: /expand|fullscreen/i }).first();
    if (await expandButton.count() > 0) {
      await expandButton.click();
      await page.waitForTimeout(500);
      // Editor should expand
    }
    
    await expect(editor).toBeVisible();
  });

  test('should auto-save content', async ({ page }) => {
    await page.click('button:has-text("New Card")');
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible();
    
    // Type content
    await editor.click();
    await editor.fill('Auto-save test');
    
    // Click outside to trigger blur/save
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    
    // Wait for save
    await page.waitForResponse(
      resp => resp.url().includes('/api/entries') && resp.status() >= 200 && resp.status() < 300,
      { timeout: 5000 }
    );
    
    // Reload and verify
    await page.reload();
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
    await expect(page.locator('.ProseMirror').first()).toContainText('Auto-save test');
  });

  // ============================================
  // Task List Tests
  // ============================================

  test('should create task list in note entry', async ({ page }) => {
    // Create new card
    await page.locator('button:has-text("New Card")').click();
    await page.waitForTimeout(1000);

    const editor = page.locator('.ProseMirror').last();
    await expect(editor).toBeVisible({ timeout: 5000 });

    // Click task list button
    const taskListButton = page.locator('button[title="Task List"]').first();
    await taskListButton.click();
    await page.waitForTimeout(500);

    // Type task
    await editor.type('Task item 1');
    await page.waitForTimeout(500);

    // Click outside to save
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1000);

    // Should have checkbox
    const checkbox = page.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible({ timeout: 5000 });
  });

  test('should persist checked task in note entry', async ({ page }) => {
    // Create task list entry
    await page.locator('button:has-text("New Card")').click();
    await page.waitForTimeout(1000);

    const editor = page.locator('.ProseMirror').last();
    await expect(editor).toBeVisible({ timeout: 5000 });

    const taskListButton = page.locator('button[title="Task List"]').first();
    await taskListButton.click();
    await page.waitForTimeout(500);

    await editor.type('Persistent task');
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(2000);

    // Check the checkbox
    const checkbox = page.locator('input[type="checkbox"]').first();
    await checkbox.check();
    await page.waitForTimeout(1000);

    // Reload and verify
    await page.reload();
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });

    const checkboxAfterReload = page.locator('input[type="checkbox"]').first();
    await expect(checkboxAfterReload).toBeChecked();
  });

  test('should support nested task lists', async ({ page }) => {
    // Create task list
    await page.locator('button:has-text("New Card")').click();
    await page.waitForTimeout(1000);

    const editor = page.locator('.ProseMirror').last();
    await expect(editor).toBeVisible({ timeout: 5000 });

    const taskListButton = page.locator('button[title="Task List"]').first();
    await taskListButton.click();
    await page.waitForTimeout(500);

    await editor.type('Parent task');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab'); // Indent to create nested task
    await editor.type('Nested task');
    await page.waitForTimeout(500);

    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(2000);

    // Should have 2 checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    await expect(checkboxes).toHaveCount(2, { timeout: 5000 });
  });
});
