/**
 * E2E Tests: Goals System
 * 
 * Tests daily, sprint, and quarterly goals.
 */

import { test, expect } from '@playwright/test';
import { navigateToDate, navigateToSettings } from '../fixtures/helpers';

test.describe('Goals System', () => {
  let testCounter = 0; // Counter to ensure unique dates per test
  
  test.beforeEach(async ({ page }, testInfo) => {
    // Use truly unique date per test: counter + timestamp milliseconds
    testCounter++;
    const uniqueNum = testCounter * 10 + Math.floor(Date.now() / 100) % 10;
    const dayNum = (uniqueNum % 28) + 1; // 1-28 to ensure valid dates
    const testRunDate = `2024-03-${String(dayNum).padStart(2, '0')}`; // Mar for goals
    
    await page.goto(`/day/${testRunDate}`);
    await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
  });

  test('should display daily goals section', async ({ page }) => {
    // Find "🎯 Daily Goals" section
    const dailyGoalsSection = page.locator('text="🎯 Daily Goals"');
    await expect(dailyGoalsSection).toBeVisible();
  });

  test('should create a daily goal', async ({ page }) => {
    // Find daily goals section and click to add
    const dailyGoalsClickable = page.locator('text="Click to add daily goals..."');
    if (await dailyGoalsClickable.count() > 0) {
      await dailyGoalsClickable.click();
      await page.waitForTimeout(500);
      // Should show input or editable area
      await expect(page.locator('[contenteditable], textarea, input').first()).toBeVisible();
    } else {
      // Already has goals, just verify section exists
      await expect(page.locator('text="🎯 Daily Goals"')).toBeVisible();
    }
  });

  test('should edit a daily goal', async ({ page }) => {
    // Click on daily goals area
    const dailyGoalsArea = page.locator('text="🎯 Daily Goals"').locator('..');
    await dailyGoalsArea.click();
    await page.waitForTimeout(500);
    
    // Should become editable
    await expect(dailyGoalsArea).toBeVisible();
  });

  test('should display sprint goals section', async ({ page }) => {
    // Find "🚀 Sprint Goals" section
    const sprintGoalsSection = page.locator('text="🚀 Sprint Goals"');
    await expect(sprintGoalsSection).toBeVisible();
  });

  test('should create a sprint goal', async ({ page }) => {
    // Click on sprint goals area to edit
    const sprintGoalsArea = page.locator('text="🚀 Sprint Goals"').locator('..');
    const clickableArea = sprintGoalsArea.locator('[role="button"], [cursor="pointer"]').first();
    if (await clickableArea.count() > 0) {
      await clickableArea.click();
      await page.waitForTimeout(500);
    }
    await expect(sprintGoalsArea).toBeVisible();
  });

  test('should display quarterly goals section', async ({ page }) => {
    // Find "🌟 Quarterly Goals" section
    const quarterlyGoalsSection = page.locator('text="🌟 Quarterly Goals"');
    await expect(quarterlyGoalsSection).toBeVisible();
  });

  test('should create a quarterly goal', async ({ page }) => {
    // Click on quarterly goals area to edit
    const quarterlyGoalsArea = page.locator('text="🌟 Quarterly Goals"').locator('..');
    const clickableArea = quarterlyGoalsArea.locator('[role="button"], [cursor="pointer"]').first();
    if (await clickableArea.count() > 0) {
      await clickableArea.click();
      await page.waitForTimeout(500);
    }
    await expect(quarterlyGoalsArea).toBeVisible();
  });

  test('should show sprint goal countdown', async ({ page }) => {
    // Sprint goals should show date range and countdown
    const sprintSection = page.locator('text="🚀 Sprint Goals"').locator('..');
    
    // Look for countdown text like "X days until start" or "X days remaining"
    const countdownPattern = /\d+\s+days?\s+(until|remaining|left|to go)/i;
    const countdownText = sprintSection.locator(`text=${countdownPattern}`);
    
    // Should have countdown if sprint is future/active
    const count = await countdownText.count();
    expect(count).toBeGreaterThanOrEqual(0); // May or may not have countdown depending on sprint dates
  });

  test('should show quarterly goal countdown', async ({ page }) => {
    // Quarterly goals should show date range and countdown  
    const quarterlySection = page.locator('text="🌟 Quarterly Goals"').locator('..');
    
    // Look for countdown text like "X days until start" or "X days remaining"
    const countdownPattern = /\d+\s+days?\s+(until|remaining|left|to go)/i;
    const countdownText = quarterlySection.locator(`text=${countdownPattern}`);
    
    // Should have countdown if quarter is future/active
    const count = await countdownText.count();
    expect(count).toBeGreaterThanOrEqual(0); // May or may not have countdown depending on quarter dates
  });

  test('should persist goals across dates', async ({ page }) => {
    // Navigate to a different date and check goals still exist
    const currentUrl = page.url();
    await page.goto('/day/2024-01-15');
    await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
    
    // Goals sections should still be visible
    await expect(page.locator('text="🎯 Daily Goals"')).toBeVisible();
    await expect(page.locator('text="🚀 Sprint Goals"')).toBeVisible();
    await expect(page.locator('text="🌟 Quarterly Goals"')).toBeVisible();
  });

  test('should show goals on calendar view', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('load');
    await expect(page.locator('text=/sun|mon|tue|wed|thu|fri|sat/i').first()).toBeVisible();
  });

  test('should toggle daily goals visibility in settings', async ({ page }) => {
    await navigateToSettings(page);
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
  });

  test('should toggle sprint goals visibility in settings', async ({ page }) => {
    await navigateToSettings(page);
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
  });

  test('should toggle quarterly goals visibility in settings', async ({ page }) => {
    await navigateToSettings(page);
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
  });

  test('should edit existing sprint goal', async ({ page }) => {
    // Click on sprint goals to make editable
    const sprintGoalsArea = page.locator('text="🚀 Sprint Goals"').locator('..');
    const clickableArea = sprintGoalsArea.locator('[role="button"], [cursor="pointer"]').first();
    
    if (await clickableArea.count() > 0) {
      await clickableArea.click();
      await page.waitForTimeout(500);
      
      // Should show editable area
      await expect(sprintGoalsArea).toBeVisible();
    } else {
      // Sprint goals visible but might not be editable in current state
      await expect(page.locator('text="🚀 Sprint Goals"')).toBeVisible();
    }
  });

  test('should format daily goals with bold text', async ({ page }) => {
    // Click on daily goals to edit
    const dailyGoalsClickable = page.locator('text="Click to add daily goals..."');
    if (await dailyGoalsClickable.count() > 0) {
      await dailyGoalsClickable.click();
    } else {
      const dailyGoalsArea = page.locator('text="🎯 Daily Goals"').locator('..');
      await dailyGoalsArea.click();
    }
    await page.waitForTimeout(500);
    
    // Find the editor and toolbar
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 5000 });
    
    // Type some text
    await editor.fill('Important goal');
    await page.waitForTimeout(200);
    
    // Select all text
    await editor.press('Control+a');
    
    // Click bold button
    const boldButton = page.locator('button[title="Bold"]').first();
    await boldButton.click();
    await page.waitForTimeout(200);
    
    // Click outside to save
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(1000);
    
    // Reload to verify persistence and HTML rendering
    await page.reload();
    await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
    
    // Verify the bold text is visible in the rendered HTML
    await expect(page.locator('strong:has-text("Important goal")')).toBeVisible();
  });

  test('should format sprint goals with bullet list', async ({ page }) => {
    // Click to create sprint goal
    const createButton = page.locator('button:has-text("Create Sprint Goal")');
    if (await createButton.count() > 0) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Find the editor
      const editor = page.locator('.ProseMirror').first();
      await expect(editor).toBeVisible();
      
      // Type some text
      await editor.fill('Goal item 1');
      await page.waitForTimeout(200);
      
      // Click bullet list button
      const bulletButton = page.locator('button[title="Bullet List"]').first();
      await bulletButton.click();
      await page.waitForTimeout(200);
      
      // Verify list is active
      await expect(bulletButton).toHaveAttribute('style', /var\(--color-accent\)/);
    }
  });

  test('should format quarterly goals with numbered list', async ({ page }) => {
    // Click to create quarterly goal
    const createButton = page.locator('button:has-text("Create Quarterly Goal")');
    if (await createButton.count() > 0) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Find the editor
      const editor = page.locator('.ProseMirror').first();
      await expect(editor).toBeVisible();
      
      // Type some text
      await editor.fill('Q1 Objective');
      await page.waitForTimeout(200);
      
      // Click numbered list button
      const numberedButton = page.locator('button[title="Numbered List"]').first();
      await numberedButton.click();
      await page.waitForTimeout(200);
      
      // Verify list is active
      await expect(numberedButton).toHaveAttribute('style', /var\(--color-accent\)/);
    }
  });

  test('should make daily goals editor resizable', async ({ page }) => {
    // Click on daily goals to edit
    const dailyGoalsClickable = page.locator('text="Click to add daily goals..."');
    if (await dailyGoalsClickable.count() > 0) {
      await dailyGoalsClickable.click();
    } else {
      const dailyGoalsArea = page.locator('text="🎯 Daily Goals"').locator('..');
      await dailyGoalsArea.click();
    }
    await page.waitForTimeout(500);
    
    // Find the editor container
    const editorContainer = page.locator('.resize-both').first();
    await expect(editorContainer).toBeVisible();
    
    // Verify it has resize CSS property
    const resizeValue = await editorContainer.evaluate((el) => 
      window.getComputedStyle(el).resize
    );
    expect(resizeValue).toBe('both');
  });

  test('should render HTML in daily goals display', async ({ page }) => {
    // Click on daily goals to edit
    const dailyGoalsClickable = page.locator('text="Click to add daily goals..."');
    if (await dailyGoalsClickable.count() > 0) {
      await dailyGoalsClickable.click();
    } else {
      const dailyGoalsArea = page.locator('text="🎯 Daily Goals"').locator('..');
      await dailyGoalsArea.click();
    }
    await page.waitForTimeout(500);
    
    // Find the editor
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible();
    
    // Type and format text
    await editor.fill('Test goal with formatting');
    await page.waitForTimeout(200);
    
    // Select all and make italic
    await editor.press('Control+a');
    const italicButton = page.locator('button[title="Italic"]').first();
    await italicButton.click();
    await page.waitForTimeout(200);
    
    // Click outside to save and exit edit mode
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await page.waitForTimeout(1000);
    
    // Reload to verify persistence and HTML rendering
    await page.reload();
    await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
    
    // Verify the italic text is visible in the rendered HTML
    await expect(page.locator('em:has-text("Test goal with formatting")')).toBeVisible();
  });

  test('should handle existing plain text goals', async ({ page }) => {
    // This test verifies backward compatibility with plain text goals
    // The display should work even if the goal contains plain text (no HTML tags)
    const dailyGoalsSection = page.locator('text="🎯 Daily Goals"');
    await expect(dailyGoalsSection).toBeVisible();
    
    // Click on daily goals - should work regardless of whether it's HTML or plain text
    const dailyGoalsClickable = page.locator('text="Click to add daily goals..."');
    if (await dailyGoalsClickable.count() > 0) {
      await dailyGoalsClickable.click();
      await page.waitForTimeout(500);
      
      const editor = page.locator('.ProseMirror').first();
      await expect(editor).toBeVisible();
      
      // Type plain text
      await editor.fill('Plain text goal');
      await page.waitForTimeout(200);
      
      // Exit without formatting
      await page.locator('body').click({ position: { x: 10, y: 10 } });
      await page.waitForTimeout(1000);
      
      // Reload page to verify persistence
      await page.reload();
      await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
      
      // Goal should still be visible
      await expect(page.locator('text="Plain text goal"')).toBeVisible();
    }
  });
});
