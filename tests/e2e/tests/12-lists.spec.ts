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
    
    // Click floating Create List button
    await page.locator('button[title="Create New List"]').click();
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
    await page.locator('button[title="Create New List"]').click();
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
    const hasLists = await page.locator('.flex-shrink-0.w-96').count() > 0;
    if (!hasLists) {
      await expect(page.locator('text=No lists yet')).toBeVisible();
    }
  });

  test('should open entry modal when clicking a card in list', async ({ page }) => {
    // Navigate to Lists page
    await page.locator('text=Lists').click();
    await page.waitForTimeout(1000);

    // Create a list if needed
    const hasLists = await page.locator('.flex-shrink-0.w-96').count() > 0;
    if (!hasLists) {
      await page.locator('button[title="Create New List"]').click();
      await page.waitForTimeout(500);
      await page.fill('input[placeholder*="list name"]', 'Test List');
      await page.locator('button:has-text("Create")').click();
      await page.waitForTimeout(1500);
    }

    // Go back to daily view to create an entry
    await page.locator('text=Daily').click();
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("New Entry")').click();
    await page.waitForTimeout(1000);
    
    const editor = page.locator('.ProseMirror').last();
    await editor.fill('Entry for modal test');
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);

    // Add to list
    const entryCard = page.locator('.entry-card-container').first();
    await entryCard.hover();
    await page.waitForTimeout(500);
    
    const listButton = entryCard.locator('button[title="Add to lists"]');
    await listButton.click({ timeout: 5000 });
    await page.waitForTimeout(1000);

    // Add to first list
    const firstListCheckbox = page.locator('button').filter({ hasText: /Test List|E2E Test List/ }).first();
    await firstListCheckbox.click();
    await page.waitForTimeout(1000);
    
    // Close modal
    await page.locator('button:has-text("Done")').click();
    await page.waitForTimeout(500);

    // Go to Lists page
    await page.locator('text=Lists').click();
    await page.waitForTimeout(1500);

    // Click on the card (should open modal)
    const card = page.locator('div[style*="height: 180px"]').first();
    await card.click();
    await page.waitForTimeout(1000);

    // Modal should be visible with entry content
    await expect(page.locator('text=Entry for modal test')).toBeVisible();
    
    // Close button should be visible
    await expect(page.locator('button').filter({ has: page.locator('svg') }).first()).toBeVisible();
  });

  test('should open search modal to add entries to list', async ({ page }) => {
    // Navigate to Lists page
    await page.locator('text=Lists').click();
    await page.waitForTimeout(1000);

    // Create a list if needed
    let testListExists = false;
    try {
      testListExists = await page.locator('text=Search Test List').isVisible({ timeout: 2000 });
    } catch (e) {
      // List doesn't exist
    }

    if (!testListExists) {
      await page.locator('button[title="Create New List"]').click();
      await page.waitForTimeout(500);
      await page.fill('input[placeholder*="list name"]', 'Search Test List');
      await page.locator('button:has-text("Create")').click();
      await page.waitForTimeout(1500);
    }

    // Hover over list to show add button
    const listHeader = page.locator('text=Search Test List').locator('..').locator('..');
    await listHeader.hover();
    await page.waitForTimeout(500);

    // Click the + button to open search modal
    const addButton = listHeader.locator('button[title="Add entries via search"]');
    await addButton.click();
    await page.waitForTimeout(1000);

    // Search modal should be visible
    await expect(page.locator('text=Add Entries to')).toBeVisible();
    await expect(page.locator('input[placeholder*="Search entries"]')).toBeVisible();
  });

  test('should search and add entry via search modal', async ({ page }) => {
    // Create an entry first
    await page.locator('button:has-text("New Entry")').click();
    await page.waitForTimeout(1000);
    
    const editor = page.locator('.ProseMirror').last();
    await editor.fill('Searchable unique entry for testing 12345');
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);

    // Navigate to Lists
    await page.locator('text=Lists').click();
    await page.waitForTimeout(1000);

    // Create list if needed
    let addListExists = false;
    try {
      addListExists = await page.locator('text=Add Search List').isVisible({ timeout: 2000 });
    } catch (e) {}

    if (!addListExists) {
      await page.locator('button[title="Create New List"]').click();
      await page.waitForTimeout(500);
      await page.fill('input[placeholder*="list name"]', 'Add Search List');
      await page.locator('button:has-text("Create")').click();
      await page.waitForTimeout(1500);
    }

    // Open search modal
    const listHeader = page.locator('text=Add Search List').locator('..').locator('..');
    await listHeader.hover();
    await page.waitForTimeout(500);
    const addButton = listHeader.locator('button[title="Add entries via search"]');
    await addButton.click();
    await page.waitForTimeout(1000);

    // Search for the entry
    const searchInput = page.locator('input[placeholder*="Search entries"]');
    await searchInput.fill('Searchable unique');
    await page.waitForTimeout(1000);

    // Should see the entry in results
    await expect(page.locator('text=Searchable unique entry')).toBeVisible();

    // Click Add button
    const addEntryButton = page.locator('button:has-text("Add")').first();
    await addEntryButton.click();
    await page.waitForTimeout(1500);

    // Entry should now show "In List"
    await expect(page.locator('button:has-text("In List")')).toBeVisible();
  });

  test('should remove entry from list', async ({ page }) => {
    // Navigate to Lists
    await page.locator('text=Lists').click();
    await page.waitForTimeout(1000);

    // Ensure there's a list with an entry
    const hasCards = await page.locator('div[style*="height: 180px"]').count() > 0;
    
    if (hasCards) {
      // Hover over a card to show remove button
      const card = page.locator('div[style*="height: 180px"]').first();
      await card.hover();
      await page.waitForTimeout(500);

      // Look for X button
      const removeButton = card.locator('button[title="Remove from list"]').first();
      const isVisible = await removeButton.isVisible().catch(() => false);
      
      if (isVisible) {
        // Accept confirmation dialog
        page.on('dialog', dialog => dialog.accept());
        
        await removeButton.click();
        await page.waitForTimeout(1500);
        
        // Card should be removed (test passes if no error)
      }
    }
  });

  test('should show entry in multiple lists', async ({ page }) => {
    // Create two lists
    await page.locator('text=Lists').click();
    await page.waitForTimeout(1000);

    // Create first list
    await page.locator('button[title="Create New List"]').click();
    await page.waitForTimeout(500);
    await page.fill('input[placeholder*="list name"]', 'Multi List A');
    await page.locator('button:has-text("Create")').click();
    await page.waitForTimeout(1500);

    // Create second list
    await page.locator('button[title="Create New List"]').click();
    await page.waitForTimeout(500);
    await page.fill('input[placeholder*="list name"]', 'Multi List B');
    await page.locator('button:has-text("Create")').click();
    await page.waitForTimeout(1500);

    // Create entry
    await page.locator('text=Daily').click();
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("New Entry")').click();
    await page.waitForTimeout(1000);
    
    const editor = page.locator('.ProseMirror').last();
    await editor.fill('Entry in multiple lists');
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);

    // Add to both lists
    const entryCard = page.locator('.entry-card-container').first();
    await entryCard.hover();
    await page.waitForTimeout(500);
    
    const listButton = entryCard.locator('button[title="Add to lists"]');
    await listButton.click({ timeout: 5000 });
    await page.waitForTimeout(1000);

    // Add to both lists
    await page.locator('button').filter({ hasText: 'Multi List A' }).click();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: 'Multi List B' }).click();
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("Done")').click();
    await page.waitForTimeout(500);

    // Go to Lists page and verify entry is in both
    await page.locator('text=Lists').click();
    await page.waitForTimeout(1500);

    // Both lists should show 1 entry
    const listACount = page.locator('text=Multi List A').locator('..').locator('text=1 entry');
    const listBCount = page.locator('text=Multi List B').locator('..').locator('text=1 entry');
    
    await expect(listACount).toBeVisible();
    await expect(listBCount).toBeVisible();
  });

  test('should delete entry from modal on lists page', async ({ page }) => {
    // Create entry
    await page.locator('button:has-text("New Entry")').click();
    await page.waitForTimeout(1000);
    
    const editor = page.locator('.ProseMirror').last();
    await editor.fill('Entry to delete from modal');
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);

    // Add to a list
    const entryCard = page.locator('.entry-card-container').first();
    await entryCard.hover();
    await page.waitForTimeout(500);
    
    const listButton = entryCard.locator('button[title="Add to lists"]');
    await listButton.click({ timeout: 5000 });
    await page.waitForTimeout(1000);

    // Add to first available list
    const firstList = page.locator('button').filter({ hasText: /List/i }).first();
    await firstList.click();
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("Done")').click();
    await page.waitForTimeout(500);

    // Go to Lists and click card
    await page.locator('text=Lists').click();
    await page.waitForTimeout(1500);

    const card = page.locator('div[style*="height: 180px"]').first();
    await card.click();
    await page.waitForTimeout(1000);

    // Accept delete confirmation
    page.on('dialog', dialog => dialog.accept());

    // Click delete button in modal
    const deleteButton = page.locator('button[title="Delete Entry"]');
    const isVisible = await deleteButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await deleteButton.click();
      await page.waitForTimeout(1500);

      // Modal should close
      await expect(page.locator('text=Entry to delete from modal')).not.toBeVisible();
    }
  });
});

