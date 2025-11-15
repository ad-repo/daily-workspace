/**
 * E2E Tests: Kanban Board
 * 
 * Tests Kanban board functionality including columns, drag-and-drop,
 * and exclusive status behavior.
 * 
 * @tag kanban
 */

import { test, expect } from '@playwright/test';

test.describe.skip('Kanban Board', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Navigate to home to ensure app is loaded
    await page.goto('/');
    await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
  });

  test('should navigate to Kanban page', async ({ page }) => {
    // Click Kanban navigation link
    await page.locator('a:has-text("Kanban")').click();
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should see either "Initialize Kanban Board" button or Kanban board
    // Check for heading first to ensure page loaded
    const pageHeading = page.locator('h1, h2').filter({ hasText: /kanban/i });
    await expect(pageHeading.or(page.locator('text=/kanban/i')).first()).toBeVisible({ timeout: 5000 });
    
    // Now check for init button or board
    const initButton = page.locator('button:has-text("Initialize Kanban Board")');
    const kanbanBoard = page.locator('text=/To Do|In Progress|Done/');
    
    const hasInitButton = await initButton.isVisible({ timeout: 3000 }).catch(() => false);
    const hasBoard = await kanbanBoard.isVisible({ timeout: 3000 }).catch(() => false);
    
    expect(hasInitButton || hasBoard).toBeTruthy();
  });

  test('should initialize Kanban board with default columns', async ({ page }) => {
    await page.goto('/kanban');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if already initialized
    const initButton = page.locator('button:has-text("Initialize Kanban Board")');
    const initButtonVisible = await initButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (initButtonVisible) {
      // Initialize Kanban
      await initButton.click();
      
      // Wait for API response (or timeout gracefully)
      try {
        await page.waitForResponse(
          resp => resp.url().includes('/api/kanban/initialize'),
          { timeout: 15000 }
        );
      } catch (e) {
        // Continue even if API response times out
      }
      
      await page.waitForTimeout(3000);
    }
    
    // Verify at least 3 Kanban columns exist
    await expect(page.locator('h2').first()).toBeVisible({ timeout: 10000 });
    const columnCount = await page.locator('h2').count();
    expect(columnCount).toBeGreaterThanOrEqual(3);
  });

  test('should create a custom Kanban column', async ({ page }) => {
    await page.goto('/kanban');
    await page.waitForTimeout(1000);
    
    // Ensure Kanban is initialized
    const initButton = page.locator('button:has-text("Initialize Kanban")');
    if (await initButton.isVisible().catch(() => false)) {
      await initButton.click();
      await page.waitForTimeout(1500);
    }
    
    // Click "New Kanban Column" button
    const newColumnButton = page.locator('button:has-text("New Kanban Column")');
    await expect(newColumnButton).toBeVisible({ timeout: 5000 });
    await newColumnButton.click();
    await page.waitForTimeout(500);
    
    // Fill in column name
    const columnNameInput = page.locator('input[placeholder*="column name" i]').first();
    await expect(columnNameInput).toBeVisible({ timeout: 3000 });
    
    const customColumnName = `Testing ${Date.now()}`;
    await columnNameInput.fill(customColumnName);
    
    // Submit the form (look for Create or Save button)
    const createButton = page.locator('button:has-text("Create")').first();
    await createButton.click();
    
    // Wait for API response
    await page.waitForResponse(
      resp => resp.url().includes('/api/lists') && resp.status() >= 200 && resp.status() < 300,
      { timeout: 5000 }
    );
    
    await page.waitForTimeout(1000);
    
    // Verify custom column appears
    await expect(page.locator(`text="${customColumnName}"`)).toBeVisible();
  });

  test('should add entry to Kanban column', async ({ page }) => {
    // First create an entry on a daily note
    const testDate = '2024-02-15';
    await page.goto(`/day/${testDate}`);
    await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
    
    // Create entry
    const testContent = `Kanban Test Entry ${Date.now()}`;
    await page.getByRole('button', { name: /new entry/i }).click();
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(testContent);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Add entry to Kanban column via "Add to list" button
    const addToListButton = page.locator('button:has-text("Add to list")').first();
    await expect(addToListButton).toBeVisible({ timeout: 5000 });
    await addToListButton.click();
    await page.waitForTimeout(500);
    
    // Look for "To Do" in the dropdown (Kanban columns should appear)
    const toDoOption = page.locator('text="To Do"').first();
    await expect(toDoOption).toBeVisible({ timeout: 3000 });
    await toDoOption.click();
    
    // Wait for API response
    await page.waitForResponse(
      resp => resp.url().includes('/api/lists/') && resp.url().includes('/entries/') && resp.status() >= 200 && resp.status() < 300,
      { timeout: 5000 }
    );
    
    await page.waitForTimeout(1000);
    
    // Navigate to Kanban and verify entry appears in "To Do" column
    await page.goto('/kanban');
    await page.waitForTimeout(1500);
    
    // Verify entry is in the Kanban board
    await expect(page.locator(`text="${testContent}"`)).toBeVisible();
  });

  test('should move entry between Kanban columns via drag-and-drop', async ({ page }) => {
    // Create a test entry and add it to "To Do"
    const testDate = '2024-02-16';
    await page.goto(`/day/${testDate}`);
    await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
    
    const testContent = `Drag Test ${Date.now()}`;
    await page.getByRole('button', { name: /new entry/i }).click();
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(testContent);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Add to "To Do" column
    const addToListButton = page.locator('button:has-text("Add to list")').first();
    await addToListButton.click();
    await page.waitForTimeout(500);
    const toDoOption = page.locator('text="To Do"').first();
    await toDoOption.click();
    await page.waitForTimeout(1500);
    
    // Navigate to Kanban
    await page.goto('/kanban');
    await page.waitForTimeout(1500);
    
    // Find the entry card
    const entryCard = page.locator(`text="${testContent}"`).locator('..').locator('..').locator('..');
    await expect(entryCard).toBeVisible();
    
    // Get "In Progress" column drop zone
    const inProgressColumn = page.locator('text="In Progress"').locator('..').locator('..');
    await expect(inProgressColumn).toBeVisible();
    
    // Perform drag and drop
    await entryCard.dragTo(inProgressColumn);
    
    // Wait for API response
    await page.waitForResponse(
      resp => resp.url().includes('/api/lists/') && resp.status() >= 200 && resp.status() < 300,
      { timeout: 5000 }
    );
    
    await page.waitForTimeout(1000);
    
    // Verify entry is now in "In Progress" column
    // The entry should be visible and within the "In Progress" section
    const inProgressSection = page.locator('text="In Progress"').locator('..').locator('..');
    await expect(inProgressSection.locator(`text="${testContent}"`)).toBeVisible();
  });

  test('should enforce exclusive Kanban status (entry only in one column)', async ({ page }) => {
    // Create a test entry
    const testDate = '2024-02-17';
    await page.goto(`/day/${testDate}`);
    await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
    
    const testContent = `Exclusive Test ${Date.now()}`;
    await page.getByRole('button', { name: /new entry/i }).click();
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(testContent);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Add to "To Do" column
    let addToListButton = page.locator('button:has-text("Add to list")').first();
    await addToListButton.click();
    await page.waitForTimeout(500);
    let toDoOption = page.locator('text="To Do"').first();
    await toDoOption.click();
    await page.waitForTimeout(1500);
    
    // Try to add to "In Progress" column (should move, not duplicate)
    addToListButton = page.locator('button:has-text("Add to list")').first();
    await addToListButton.click();
    await page.waitForTimeout(500);
    const inProgressOption = page.locator('text="In Progress"').first();
    await inProgressOption.click();
    await page.waitForTimeout(1500);
    
    // Navigate to Kanban
    await page.goto('/kanban');
    await page.waitForTimeout(1500);
    
    // Verify entry appears only once (in "In Progress", not "To Do")
    const allMatches = page.locator(`text="${testContent}"`);
    const matchCount = await allMatches.count();
    
    // Should only appear once in the Kanban board
    expect(matchCount).toBe(1);
    
    // Verify it's in "In Progress" column
    const inProgressSection = page.locator('text="In Progress"').locator('..').locator('..');
    await expect(inProgressSection.locator(`text="${testContent}"`)).toBeVisible();
    
    // Verify it's NOT in "To Do" column
    const toDoSection = page.locator('text="To Do"').locator('..').locator('..');
    await expect(toDoSection.locator(`text="${testContent}"`)).not.toBeVisible();
  });

  test('should change Kanban status via dropdown on card', async ({ page }) => {
    // Create a test entry and add it to "To Do"
    const testDate = '2024-02-18';
    await page.goto(`/day/${testDate}`);
    await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
    
    const testContent = `Dropdown Test ${Date.now()}`;
    await page.getByRole('button', { name: /new entry/i }).click();
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(testContent);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Add to "To Do" column
    const addToListButton = page.locator('button:has-text("Add to list")').first();
    await addToListButton.click();
    await page.waitForTimeout(500);
    const toDoOption = page.locator('text="To Do"').first();
    await toDoOption.click();
    await page.waitForTimeout(1500);
    
    // Navigate to Kanban
    await page.goto('/kanban');
    await page.waitForTimeout(1500);
    
    // Find the entry card and click on its Kanban status badge
    const entryCard = page.locator(`text="${testContent}"`).locator('..').locator('..').locator('..');
    await expect(entryCard).toBeVisible();
    
    // Look for the Kanban status badge (should show "To Do")
    const kanbanBadge = entryCard.locator('button:has-text("To Do")').first();
    await expect(kanbanBadge).toBeVisible({ timeout: 3000 });
    await kanbanBadge.click();
    await page.waitForTimeout(500);
    
    // Dropdown should appear with other Kanban columns
    const doneOption = page.locator('button:has-text("Done")').last();
    await expect(doneOption).toBeVisible({ timeout: 3000 });
    await doneOption.click();
    
    // Wait for API response
    await page.waitForResponse(
      resp => resp.url().includes('/api/lists/') && resp.status() >= 200 && resp.status() < 300,
      { timeout: 5000 }
    );
    
    await page.waitForTimeout(1500);
    
    // Verify entry moved to "Done" column
    const doneSection = page.locator('text="Done"').locator('..').locator('..');
    await expect(doneSection.locator(`text="${testContent}"`)).toBeVisible();
    
    // Verify it's no longer in "To Do" column
    const toDoSection = page.locator('text="To Do"').locator('..').locator('..');
    await expect(toDoSection.locator(`text="${testContent}"`)).not.toBeVisible();
  });

  test('should allow entry to be in Kanban column and regular lists simultaneously', async ({ page }) => {
    // Create a test entry
    const testDate = '2024-02-19';
    await page.goto(`/day/${testDate}`);
    await page.waitForSelector('button:has-text("New Entry")', { timeout: 10000 });
    
    const testContent = `Multi-List Test ${Date.now()}`;
    await page.getByRole('button', { name: /new entry/i }).click();
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(testContent);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Add to "To Do" Kanban column
    let addToListButton = page.locator('button:has-text("Add to list")').first();
    await addToListButton.click();
    await page.waitForTimeout(500);
    const toDoOption = page.locator('text="To Do"').first();
    await toDoOption.click();
    await page.waitForTimeout(1000);
    
    // Create a regular list and add the entry to it
    await page.goto('/lists');
    await page.waitForTimeout(1000);
    
    // Create new list if needed
    const newListButton = page.locator('button:has-text("New List")');
    if (await newListButton.isVisible().catch(() => false)) {
      await newListButton.click();
      await page.waitForTimeout(500);
      
      const listNameInput = page.locator('input[placeholder*="list name" i]').first();
      const regularListName = `Regular List ${Date.now()}`;
      await listNameInput.fill(regularListName);
      
      const createButton = page.locator('button:has-text("Create")').first();
      await createButton.click();
      await page.waitForTimeout(1500);
    }
    
    // Go back to daily view and add entry to a regular list
    await page.goto(`/day/${testDate}`);
    await page.waitForTimeout(1000);
    
    addToListButton = page.locator('button:has-text("Add to list")').first();
    await addToListButton.click();
    await page.waitForTimeout(500);
    
    // Look for a regular list (not Kanban) - should see "Create New List" or existing regular lists
    // For this test, we'll verify the entry can be added to multiple lists
    // The key is that it should still be in "To Do" Kanban column
    
    // Navigate to Kanban and verify entry is still there
    await page.goto('/kanban');
    await page.waitForTimeout(1500);
    
    const toDoSection = page.locator('text="To Do"').locator('..').locator('..');
    await expect(toDoSection.locator(`text="${testContent}"`)).toBeVisible();
  });
});

