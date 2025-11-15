/**
 * E2E Tests: Custom Emoji System
 * 
 * Tests custom emoji upload, display, deletion, and library switching.
 * 
 * @tag custom-emojis
 */

import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

test.describe.skip('Custom Emoji System', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
  });

  test('should navigate to Settings and open custom emoji manager', async ({ page }) => {
    // Navigate to Settings
    await page.goto('/settings');
    await page.waitForTimeout(1000);
    
    // Look for "Manage Custom Emojis" button
    const manageButton = page.locator('button:has-text("Manage Custom Emojis")');
    
    await expect(manageButton).toBeVisible({ timeout: 5000 });
    await manageButton.click();
    await page.waitForTimeout(500);
    
    // Modal should appear with file input
    const emojiManager = page.locator('input[type="file"]').or(
      page.locator('text=/custom.*emoji/i')
    );
    
    await expect(emojiManager.first()).toBeVisible({ timeout: 3000 });
  });

  test('should upload a custom emoji', async ({ page }) => {
    // Create a temporary test image (1x1 pixel PNG)
    const testImagePath = path.join(os.tmpdir(), `test-emoji-${Date.now()}.png`);
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(testImagePath, pngBuffer);
    
    try {
      // Navigate to Settings
      await page.goto('/settings');
      await page.waitForTimeout(1000);
      
      // Open custom emoji manager
      const manageButton = page.locator('button').filter({ hasText: /manage.*emoji/i }).first();
      await manageButton.click();
      await page.waitForTimeout(500);
      
      // Find file input
      const fileInput = page.locator('input[type="file"]').first();
      await expect(fileInput).toBeAttached({ timeout: 3000 });
      
      // Upload the file
      await fileInput.setInputFiles(testImagePath);
      
      // Wait for upload to complete
      await page.waitForResponse(
        resp => resp.url().includes('/api/custom-emojis') && resp.status() >= 200 && resp.status() < 300,
        { timeout: 10000 }
      );
      
      await page.waitForTimeout(1500);
      
      // Verify emoji appears in the manager (should see an image)
      const uploadedEmoji = page.locator('img[src*="/api/uploads/"]').first();
      await expect(uploadedEmoji).toBeVisible({ timeout: 3000 });
    } finally {
      // Cleanup temp file
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    }
  });

  test('should use custom emoji in label', async ({ page }) => {
    // Navigate to daily view
    await page.goto('/');
    await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
    
    // Create a new entry
    await page.getByRole('button', { name: /new entry/i }).click();
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill('Test entry for custom emoji label');
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Open label selector
    const labelInput = page.locator('input[placeholder*="search or add label" i]').first();
    await expect(labelInput).toBeVisible({ timeout: 5000 });
    await labelInput.click();
    await page.waitForTimeout(500);
    
    // Look for emoji picker button next to label input
    const emojiButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /smile/i }).or(
      page.locator('button[title*="emoji" i]')
    ).first();
    
    if (await emojiButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emojiButton.click();
      await page.waitForTimeout(500);
      
      // Look for custom emoji tab or custom emojis in picker
      const customEmojiTab = page.locator('button:has-text("Custom")').or(
        page.locator('text="Custom Emojis"')
      );
      
      if (await customEmojiTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await customEmojiTab.click();
        await page.waitForTimeout(500);
        
        // Click a custom emoji if available
        const customEmoji = page.locator('img[src*="/api/uploads/"]').first();
        if (await customEmoji.isVisible({ timeout: 2000 }).catch(() => false)) {
          await customEmoji.click();
          await page.waitForTimeout(1000);
          
          // Verify custom emoji was added as label (should see it in the entry)
          const emojiLabel = page.locator('img[src*="/api/uploads/"]').first();
          await expect(emojiLabel).toBeVisible();
        }
      }
    }
  });

  test('should use custom emoji in rich text editor', async ({ page }) => {
    // Navigate to daily view
    await page.goto('/');
    await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
    
    // Create a new entry
    await page.getByRole('button', { name: /new entry/i }).click();
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    
    // Look for emoji button in toolbar
    const toolbarEmojiButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /smile/i }).or(
      page.locator('button[title*="emoji" i]')
    ).first();
    
    if (await toolbarEmojiButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await toolbarEmojiButton.click();
      await page.waitForTimeout(500);
      
      // Look for custom emoji tab
      const customEmojiTab = page.locator('button:has-text("Custom")').or(
        page.locator('text="Custom Emojis"')
      );
      
      if (await customEmojiTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await customEmojiTab.click();
        await page.waitForTimeout(500);
        
        // Click a custom emoji
        const customEmoji = page.locator('img[src*="/api/uploads/"]').first();
        if (await customEmoji.isVisible({ timeout: 2000 }).catch(() => false)) {
          await customEmoji.click();
          await page.waitForTimeout(1000);
          
          // Verify custom emoji appears in editor content
          const editorEmoji = editor.locator('img[src*="/api/uploads/"]').first();
          await expect(editorEmoji).toBeVisible();
        }
      }
    }
  });

  test('should display custom emoji correctly in cards', async ({ page }) => {
    // Create an entry with custom emoji (if available)
    const testDate = '2024-04-01';
    await page.goto(`/day/${testDate}`);
    await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
    
    await page.getByRole('button', { name: /new entry/i }).click();
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    
    // Add some text
    await editor.fill('Entry with custom emoji');
    
    // Try to add custom emoji via toolbar
    const toolbarEmojiButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /smile/i }).first();
    
    if (await toolbarEmojiButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await toolbarEmojiButton.click();
      await page.waitForTimeout(500);
      
      const customEmojiTab = page.locator('button:has-text("Custom")');
      if (await customEmojiTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await customEmojiTab.click();
        await page.waitForTimeout(500);
        
        const customEmoji = page.locator('img[src*="/api/uploads/"]').first();
        if (await customEmoji.isVisible({ timeout: 2000 }).catch(() => false)) {
          await customEmoji.click();
          await page.waitForTimeout(1000);
        }
      }
    }
    
    // Save entry
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Navigate to Lists page and verify custom emoji displays
    await page.goto('/lists');
    await page.waitForTimeout(1000);
    
    // If entry is in a list, custom emoji should be visible
    const cardEmoji = page.locator('img[src*="/api/uploads/"]').first();
    if (await cardEmoji.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Verify it's an actual image (not broken)
      const src = await cardEmoji.getAttribute('src');
      expect(src).toContain('/api/uploads/');
    }
  });

  test('should delete a custom emoji', async ({ page }) => {
    // Navigate to Settings
    await page.goto('/settings');
    await page.waitForTimeout(1000);
    
    // Open custom emoji manager
    const manageButton = page.locator('button').filter({ hasText: /manage.*emoji/i }).first();
    await manageButton.click();
    await page.waitForTimeout(500);
    
    // Find a custom emoji
    const customEmoji = page.locator('img[src*="/api/uploads/"]').first();
    
    if (await customEmoji.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Find delete button for this emoji (usually nearby or on hover)
      const emojiContainer = customEmoji.locator('..').locator('..');
      const deleteButton = emojiContainer.locator('button').filter({ hasText: /delete/i }).or(
        emojiContainer.locator('button:has(svg.lucide-trash-2)')
      ).or(
        emojiContainer.locator('button[title*="delete" i]')
      ).first();
      
      if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Get the emoji src before deletion for verification
        const emojiSrc = await customEmoji.getAttribute('src');
        
        await deleteButton.click();
        
        // Handle confirmation if present
        const confirmButton = page.locator('button:has-text("Delete")').or(
          page.locator('button:has-text("Confirm")')
        ).last();
        
        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmButton.click();
        }
        
        // Wait for delete API call
        await page.waitForResponse(
          resp => resp.url().includes('/api/custom-emojis/') && resp.status() >= 200 && resp.status() < 300,
          { timeout: 5000 }
        );
        
        await page.waitForTimeout(1000);
        
        // Verify emoji is gone
        const deletedEmoji = page.locator(`img[src="${emojiSrc}"]`);
        await expect(deletedEmoji).not.toBeVisible();
      }
    }
  });

  test('should switch emoji library between emoji-picker-react and emoji-mart', async ({ page }) => {
    // Navigate to Settings
    await page.goto('/settings');
    await page.waitForTimeout(1000);
    
    // Look for emoji library selector
    const emojiLibrarySection = page.locator('text=/emoji.*picker/i').or(
      page.locator('text="Emoji Library"')
    );
    
    if (await emojiLibrarySection.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Look for radio buttons or dropdown
      const emojiPickerReactOption = page.locator('input[value="emoji-picker-react"]').or(
        page.locator('label:has-text("emoji-picker-react")')
      ).first();
      
      const emojiMartOption = page.locator('input[value="emoji-mart"]').or(
        page.locator('label:has-text("emoji-mart")')
      ).first();
      
      // Try switching to emoji-mart
      if (await emojiMartOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emojiMartOption.click();
        
        // Wait for settings save
        await page.waitForResponse(
          resp => resp.url().includes('/api/app-settings') && resp.status() >= 200 && resp.status() < 300,
          { timeout: 5000 }
        );
        
        await page.waitForTimeout(1000);
        
        // Verify selection persists
        const selectedOption = page.locator('input[value="emoji-mart"]:checked').or(
          page.locator('label:has-text("emoji-mart")').locator('input:checked')
        );
        
        await expect(selectedOption).toBeVisible();
      }
      
      // Switch back to emoji-picker-react
      if (await emojiPickerReactOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emojiPickerReactOption.click();
        
        await page.waitForResponse(
          resp => resp.url().includes('/api/app-settings') && resp.status() >= 200 && resp.status() < 300,
          { timeout: 5000 }
        );
        
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should verify custom emoji persists across page reloads', async ({ page }) => {
    // Navigate to daily view and create entry with custom emoji
    await page.goto('/');
    await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
    
    await page.getByRole('button', { name: /new entry/i }).click();
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    
    await editor.fill('Persistence test');
    
    // Add custom emoji if available
    const toolbarEmojiButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /smile/i }).first();
    
    if (await toolbarEmojiButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await toolbarEmojiButton.click();
      await page.waitForTimeout(500);
      
      const customEmojiTab = page.locator('button:has-text("Custom")');
      if (await customEmojiTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await customEmojiTab.click();
        await page.waitForTimeout(500);
        
        const customEmoji = page.locator('img[src*="/api/uploads/"]').first();
        if (await customEmoji.isVisible({ timeout: 2000 }).catch(() => false)) {
          const emojiSrc = await customEmoji.getAttribute('src');
          await customEmoji.click();
          await page.waitForTimeout(1000);
          
          // Save entry
          await page.locator('body').click({ position: { x: 0, y: 0 } });
          await page.waitForTimeout(1500);
          
          // Reload page
          await page.reload();
          await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
          
          // Verify custom emoji still appears
          const persistedEmoji = page.locator(`img[src="${emojiSrc}"]`).first();
          await expect(persistedEmoji).toBeVisible({ timeout: 3000 });
        }
      }
    }
  });
});

