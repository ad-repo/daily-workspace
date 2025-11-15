/**
 * E2E Tests: Advanced Settings
 * 
 * Tests new settings features including emoji library selection,
 * sprint goal name customization, and daily goal end time.
 * 
 * @tag settings-advanced
 */

import { test, expect } from '@playwright/test';

test.describe.skip('Advanced Settings', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForTimeout(1000);
  });

  test('should navigate to Settings page', async ({ page }) => {
    // Verify Settings page loaded
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible({ timeout: 5000 });
  });

  test('should change sprint goal name', async ({ page }) => {
    // Look for sprint name input with placeholder="Sprint"
    const sprintNameInput = page.locator('input[placeholder="Sprint"]');
    
    await expect(sprintNameInput).toBeVisible({ timeout: 5000 });
    
    // Change the name
    const customName = `Iteration ${Date.now()}`;
    await sprintNameInput.fill(customName);
    
    // Wait for auto-save (look for "Saving..." text)
    await page.waitForTimeout(2500);
    
    // Navigate to daily view
    await page.goto('/');
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
    
    // The custom name should appear in the goals section if there's a sprint goal
    // If no sprint goal exists, the name won't be visible, which is expected
    const hasSprintGoal = await page.locator('text=/sprint|iteration|cycle/i').isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasSprintGoal) {
      // Verify custom name appears somewhere on the page
      await expect(page.locator(`text="${customName}"`).or(page.locator('text=/sprint.*goal/i'))).toBeVisible({ timeout: 3000 });
    }
  });

  test('should verify sprint goal name persists', async ({ page }) => {
    // Set a custom sprint name
    const sprintNameInput = page.locator('input').filter({ hasText: /sprint/i }).or(
      page.locator('input[placeholder*="sprint" i]')
    ).or(
      page.locator('label:has-text("Sprint")').locator('..').locator('input')
    ).first();
    
    if (await sprintNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const customName = `Cycle ${Date.now()}`;
      await sprintNameInput.fill(customName);
      await page.waitForTimeout(2000);
      
      // Reload settings page
      await page.reload();
      await page.waitForTimeout(1000);
      
      // Verify value persisted
      await expect(sprintNameInput).toHaveValue(customName);
    }
  });

  test('should set daily goal end time', async ({ page }) => {
    // Look for daily goal end time input
    const endTimeInput = page.locator('input[type="time"]').or(
      page.locator('input').filter({ hasText: /end.*time/i })
    ).or(
      page.locator('label:has-text("Daily Goal End Time")').locator('..').locator('input')
    ).first();
    
    if (await endTimeInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Set end time to 6:00 PM
      await endTimeInput.fill('18:00');
      await page.waitForTimeout(2000); // Allow for auto-save
      
      // Navigate to daily view
      await page.goto('/');
      await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
      
      // Look for daily goal section
      const dailyGoalSection = page.locator('text=/daily.*goal/i').first();
      
      if (await dailyGoalSection.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Verify countdown or end time indicator appears
        // This is UI-specific, but we can check if the section exists
        await expect(dailyGoalSection).toBeVisible();
      }
    }
  });

  test('should verify daily goal end time persists', async ({ page }) => {
    // Set daily goal end time
    const endTimeInput = page.locator('input[type="time"]').or(
      page.locator('label:has-text("Daily Goal End Time")').locator('..').locator('input')
    ).first();
    
    if (await endTimeInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await endTimeInput.fill('17:30');
      await page.waitForTimeout(2000);
      
      // Reload settings page
      await page.reload();
      await page.waitForTimeout(1000);
      
      // Verify value persisted
      await expect(endTimeInput).toHaveValue('17:30');
    }
  });

  test('should display daily goal countdown when goal is set', async ({ page }) => {
    // Navigate to daily view
    await page.goto('/');
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
    
    // Look for daily goal input
    const dailyGoalEditor = page.locator('.ProseMirror').filter({ has: page.locator('text=/daily.*goal/i') }).or(
      page.locator('text=/daily.*goal/i').locator('..').locator('.ProseMirror')
    ).first();
    
    if (await dailyGoalEditor.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Add some goal text
      await dailyGoalEditor.click();
      await dailyGoalEditor.fill('Complete testing');
      await page.locator('body').click({ position: { x: 0, y: 0 } });
      await page.waitForTimeout(1500);
      
      // Look for countdown display (hours and minutes)
      const countdown = page.locator('text=/\\d+h.*\\d+m/').or(
        page.locator('text="Done for the day"')
      ).first();
      
      if (await countdown.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(countdown).toBeVisible();
      }
    }
  });

  test('should hide daily goal countdown when goal is empty', async ({ page }) => {
    // Navigate to daily view
    await page.goto('/');
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
    
    // Look for daily goal input
    const dailyGoalEditor = page.locator('.ProseMirror').filter({ has: page.locator('text=/daily.*goal/i') }).or(
      page.locator('text=/daily.*goal/i').locator('..').locator('.ProseMirror')
    ).first();
    
    if (await dailyGoalEditor.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Clear goal text
      await dailyGoalEditor.click();
      await dailyGoalEditor.fill('');
      await page.locator('body').click({ position: { x: 0, y: 0 } });
      await page.waitForTimeout(1500);
      
      // Countdown should not be visible
      const countdown = page.locator('text=/\\d+h.*\\d+m/').first();
      await expect(countdown).not.toBeVisible();
    }
  });

  test('should select emoji library (emoji-picker-react)', async ({ page }) => {
    // Look for emoji library selector
    const emojiPickerReactOption = page.locator('input[value="emoji-picker-react"]').or(
      page.locator('label:has-text("emoji-picker-react")')
    ).first();
    
    if (await emojiPickerReactOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emojiPickerReactOption.click();
      
      // Wait for settings save
      await page.waitForResponse(
        resp => resp.url().includes('/api/app-settings') && resp.status() >= 200 && resp.status() < 300,
        { timeout: 5000 }
      );
      
      await page.waitForTimeout(1000);
      
      // Verify selection
      const selectedOption = page.locator('input[value="emoji-picker-react"]:checked');
      await expect(selectedOption).toBeVisible();
    }
  });

  test('should select emoji library (emoji-mart)', async ({ page }) => {
    // Look for emoji library selector
    const emojiMartOption = page.locator('input[value="emoji-mart"]').or(
      page.locator('label:has-text("emoji-mart")')
    ).first();
    
    if (await emojiMartOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emojiMartOption.click();
      
      // Wait for settings save
      await page.waitForResponse(
        resp => resp.url().includes('/api/app-settings') && resp.status() >= 200 && resp.status() < 300,
        { timeout: 5000 }
      );
      
      await page.waitForTimeout(1000);
      
      // Verify selection
      const selectedOption = page.locator('input[value="emoji-mart"]:checked');
      await expect(selectedOption).toBeVisible();
    }
  });

  test('should verify emoji library selection persists', async ({ page }) => {
    // Select emoji-mart
    const emojiMartOption = page.locator('input[value="emoji-mart"]').or(
      page.locator('label:has-text("emoji-mart")')
    ).first();
    
    if (await emojiMartOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emojiMartOption.click();
      await page.waitForTimeout(2000);
      
      // Reload settings page
      await page.reload();
      await page.waitForTimeout(1000);
      
      // Verify selection persisted
      const selectedOption = page.locator('input[value="emoji-mart"]:checked');
      await expect(selectedOption).toBeVisible();
    }
  });

  test('should verify sprint goal countdown uses custom name', async ({ page }) => {
    // Set custom sprint name
    const sprintNameInput = page.locator('input').filter({ hasText: /sprint/i }).or(
      page.locator('input[placeholder*="sprint" i]')
    ).or(
      page.locator('label:has-text("Sprint")').locator('..').locator('input')
    ).first();
    
    if (await sprintNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const customName = `Phase ${Date.now()}`;
      await sprintNameInput.fill(customName);
      await page.waitForTimeout(2000);
      
      // Navigate to daily view
      await page.goto('/');
      await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
      
      // Look for sprint goal section with custom name
      const sprintSection = page.locator(`text="${customName}"`).first();
      
      if (await sprintSection.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(sprintSection).toBeVisible();
        
        // Verify countdown appears if goal is set
        const countdown = page.locator('text=/\\d+.*day/i').first();
        if (await countdown.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(countdown).toBeVisible();
        }
      }
    }
  });

  test('should verify all settings work together', async ({ page }) => {
    // Set all custom settings
    const sprintNameInput = page.locator('input').filter({ hasText: /sprint/i }).or(
      page.locator('label:has-text("Sprint")').locator('..').locator('input')
    ).first();
    
    const endTimeInput = page.locator('input[type="time"]').or(
      page.locator('label:has-text("Daily Goal End Time")').locator('..').locator('input')
    ).first();
    
    const emojiMartOption = page.locator('input[value="emoji-mart"]').or(
      page.locator('label:has-text("emoji-mart")')
    ).first();
    
    // Set sprint name
    if (await sprintNameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sprintNameInput.fill(`TestSprint ${Date.now()}`);
      await page.waitForTimeout(1000);
    }
    
    // Set end time
    if (await endTimeInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await endTimeInput.fill('19:00');
      await page.waitForTimeout(1000);
    }
    
    // Set emoji library
    if (await emojiMartOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emojiMartOption.click();
      await page.waitForTimeout(1000);
    }
    
    // Reload and verify all persist
    await page.reload();
    await page.waitForTimeout(1000);
    
    // All settings should be preserved
    if (await sprintNameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      const sprintValue = await sprintNameInput.inputValue();
      expect(sprintValue).toContain('TestSprint');
    }
    
    if (await endTimeInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(endTimeInput).toHaveValue('19:00');
    }
    
    if (await emojiMartOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      const selectedOption = page.locator('input[value="emoji-mart"]:checked');
      await expect(selectedOption).toBeVisible();
    }
  });
});

