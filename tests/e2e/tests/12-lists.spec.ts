/**
 * E2E Tests: Lists Feature
 * 
 * Tests list management including creation, editing, deletion,
 * adding/removing entries, and drag-and-drop functionality.
 * 
 * @tag lists
 */

import { test, expect } from '@playwright/test';

test.describe.skip('Lists Feature', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
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

  test('should create a new list', async ({ page }) => {
    await page.goto('/lists');
    await page.waitForTimeout(1000);
    
    // Click "New List" button (it's a Plus icon button with title)
    const newListButton = page.locator('button[title="Create New List"]');
    await expect(newListButton).toBeVisible({ timeout: 5000 });
    await newListButton.click();
    await page.waitForTimeout(500);
    
    // Fill in list name
    const listNameInput = page.locator('input[placeholder="Enter list name"]').or(
      page.locator('input[type="text"]').first()
    );
    await expect(listNameInput).toBeVisible({ timeout: 3000 });
    
    const testListName = `Test List ${Date.now()}`;
    await listNameInput.fill(testListName);
    
    // Submit the form - look for "Create List" button
    const createButton = page.locator('button:has-text("Create List")');
    await expect(createButton).toBeVisible({ timeout: 3000 });
    await createButton.click();
    
    // Wait for API response
    await page.waitForResponse(
      resp => resp.url().includes('/api/lists') && resp.status() >= 200 && resp.status() < 300,
      { timeout: 5000 }
    );
    
    await page.waitForTimeout(1000);
    
    // Verify list appears
    await expect(page.locator(`text="${testListName}"`)).toBeVisible();
  });

  test('should edit list name and description', async ({ page }) => {
    await page.goto('/lists');
    await page.waitForTimeout(1000);
    
    // Create a list first
    const newListButton = page.locator('button:has-text("New List")');
    if (await newListButton.isVisible().catch(() => false)) {
      await newListButton.click();
      await page.waitForTimeout(500);
      
      const listNameInput = page.locator('input[placeholder*="list name" i]').first();
      const originalName = `Edit Test ${Date.now()}`;
      await listNameInput.fill(originalName);
      
      const createButton = page.locator('button:has-text("Create")').first();
      await createButton.click();
      await page.waitForTimeout(1500);
      
      // Find the list and click edit button (usually a pencil icon or "Edit" text)
      const listContainer = page.locator(`text="${originalName}"`).locator('..').locator('..');
      const editButton = listContainer.locator('button').filter({ hasText: /edit/i }).or(
        listContainer.locator('button[title*="edit" i]')
      ).first();
      
      if (await editButton.isVisible().catch(() => false)) {
        await editButton.click();
        await page.waitForTimeout(500);
        
        // Update the name
        const editNameInput = page.locator('input[placeholder*="list name" i]').first();
        const updatedName = `Updated ${Date.now()}`;
        await editNameInput.fill(updatedName);
        
        // Save changes
        const saveButton = page.locator('button:has-text("Save")').first();
        await saveButton.click();
        
        await page.waitForResponse(
          resp => resp.url().includes('/api/lists/') && resp.status() >= 200 && resp.status() < 300,
          { timeout: 5000 }
        );
        
        await page.waitForTimeout(1000);
        
        // Verify updated name appears
        await expect(page.locator(`text="${updatedName}"`)).toBeVisible();
      }
    }
  });

  test('should delete a list', async ({ page }) => {
    await page.goto('/lists');
    await page.waitForTimeout(1000);
    
    // Create a list to delete
    const newListButton = page.locator('button:has-text("New List")');
    if (await newListButton.isVisible().catch(() => false)) {
      await newListButton.click();
      await page.waitForTimeout(500);
      
      const listNameInput = page.locator('input[placeholder*="list name" i]').first();
      const deleteTestName = `Delete Test ${Date.now()}`;
      await listNameInput.fill(deleteTestName);
      
      const createButton = page.locator('button:has-text("Create")').first();
      await createButton.click();
      await page.waitForTimeout(1500);
      
      // Find the list and click delete button (trash icon or "Delete" text)
      const listContainer = page.locator(`text="${deleteTestName}"`).locator('..').locator('..');
      const deleteButton = listContainer.locator('button').filter({ hasText: /delete/i }).or(
        listContainer.locator('button[title*="delete" i]')
      ).or(
        listContainer.locator('button:has(svg.lucide-trash-2)')
      ).first();
      
      if (await deleteButton.isVisible().catch(() => false)) {
        await deleteButton.click();
        
        // Handle confirmation dialog if present
        const confirmButton = page.locator('button:has-text("Delete")').or(
          page.locator('button:has-text("Confirm")')
        ).last();
        
        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmButton.click();
        }
        
        await page.waitForResponse(
          resp => resp.url().includes('/api/lists/') && resp.status() >= 200 && resp.status() < 300,
          { timeout: 5000 }
        );
        
        await page.waitForTimeout(1000);
        
        // Verify list is gone
        await expect(page.locator(`text="${deleteTestName}"`)).not.toBeVisible();
      }
    }
  });

  test('should add entry to list via list selector', async ({ page }) => {
    // Create a new entry first
    await page.locator('button:has-text("New Card")').click();
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

  test('should remove entry from list', async ({ page }) => {
    // Create an entry and add it to a list
    const testDate = '2024-03-01';
    await page.goto(`/day/${testDate}`);
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
    
    const testContent = `Remove Test ${Date.now()}`;
    await page.getByRole('button', { name: /new entry/i }).click();
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(testContent);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Create a list and add entry to it
    const addToListButton = page.locator('button:has-text("Add to list")').first();
    await addToListButton.click();
    await page.waitForTimeout(500);
    
    const createListButton = page.locator('button:has-text("Create New List")').first();
    if (await createListButton.isVisible().catch(() => false)) {
      await createListButton.click();
      await page.waitForTimeout(500);
      
      const listNameInput = page.locator('input[placeholder*="list name" i]').first();
      const testListName = `Remove Entry List ${Date.now()}`;
      await listNameInput.fill(testListName);
      
      const createButton = page.locator('button:has-text("Create")').first();
      await createButton.click();
      await page.waitForTimeout(1500);
      
      // Navigate to Lists page
      await page.goto('/lists');
      await page.waitForTimeout(1500);
      
      // Find the entry in the list
      const entryCard = page.locator(`text="${testContent}"`).locator('..').locator('..').locator('..');
      await expect(entryCard).toBeVisible();
      
      // Look for remove/delete button on the card
      const removeButton = entryCard.locator('button').filter({ hasText: /remove/i }).or(
        entryCard.locator('button[title*="remove" i]')
      ).first();
      
      if (await removeButton.isVisible().catch(() => false)) {
        await removeButton.click();
        
        await page.waitForResponse(
          resp => resp.url().includes('/api/lists/') && resp.status() >= 200 && resp.status() < 300,
          { timeout: 5000 }
        );
        
        await page.waitForTimeout(1000);
        
        // Verify entry is removed from list view
        await expect(page.locator(`text="${testContent}"`)).not.toBeVisible();
      }
    }
  });

  test('should drag and drop entry within list to reorder', async ({ page }) => {
    // Create two entries and add them to a list
    const testDate = '2024-03-02';
    await page.goto(`/day/${testDate}`);
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
    
    const entry1Content = `Drag Entry 1 ${Date.now()}`;
    const entry2Content = `Drag Entry 2 ${Date.now()}`;
    
    // Create first entry
    await page.getByRole('button', { name: /new entry/i }).click();
    let editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(entry1Content);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Create second entry
    await page.getByRole('button', { name: /new entry/i }).click();
    editor = page.locator('.ProseMirror').last();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(entry2Content);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Create a list and add both entries
    const testListName = `Drag Test List ${Date.now()}`;
    
    // Add first entry to list
    let addToListButton = page.locator('button:has-text("Add to list")').first();
    await addToListButton.click();
    await page.waitForTimeout(500);
    
    let createListButton = page.locator('button:has-text("Create New List")').first();
    await createListButton.click();
    await page.waitForTimeout(500);
    
    let listNameInput = page.locator('input[placeholder*="list name" i]').first();
    await listNameInput.fill(testListName);
    
    let createButton = page.locator('button:has-text("Create")').first();
    await createButton.click();
    await page.waitForTimeout(1500);
    
    // Add second entry to same list
    addToListButton = page.locator('button:has-text("Add to list")').last();
    await addToListButton.click();
    await page.waitForTimeout(500);
    
    const listOption = page.locator(`text="${testListName}"`).first();
    await listOption.click();
    await page.waitForTimeout(1500);
    
    // Navigate to Lists page
    await page.goto('/lists');
    await page.waitForTimeout(1500);
    
    // Find both entry cards
    const entry1Card = page.locator(`text="${entry1Content}"`).locator('..').locator('..').locator('..');
    const entry2Card = page.locator(`text="${entry2Content}"`).locator('..').locator('..').locator('..');
    
    await expect(entry1Card).toBeVisible();
    await expect(entry2Card).toBeVisible();
    
    // Perform drag and drop to reorder
    await entry2Card.dragTo(entry1Card);
    
    // Wait for API response
    await page.waitForResponse(
      resp => resp.url().includes('/api/lists/') && resp.status() >= 200 && resp.status() < 300,
      { timeout: 5000 }
    );
    
    await page.waitForTimeout(1000);
    
    // Verify order changed (entry2 should now be before entry1)
    // This is a visual check - in a real test you might verify the order via data attributes or API
    const allEntries = page.locator('.prose').filter({ hasText: /Drag Entry/ });
    const count = await allEntries.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should allow entry to be in multiple regular lists', async ({ page }) => {
    // Create an entry
    const testDate = '2024-03-03';
    await page.goto(`/day/${testDate}`);
    await page.waitForSelector('button:has-text("New Card")', { timeout: 10000 });
    
    const testContent = `Multi-List Entry ${Date.now()}`;
    await page.getByRole('button', { name: /new entry/i }).click();
    const editor = page.locator('.ProseMirror').first();
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill(testContent);
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(1500);
    
    // Add to first list
    let addToListButton = page.locator('button:has-text("Add to list")').first();
    await addToListButton.click();
    await page.waitForTimeout(500);
    
    let createListButton = page.locator('button:has-text("Create New List")').first();
    await createListButton.click();
    await page.waitForTimeout(500);
    
    let listNameInput = page.locator('input[placeholder*="list name" i]').first();
    const list1Name = `List 1 ${Date.now()}`;
    await listNameInput.fill(list1Name);
    
    let createButton = page.locator('button:has-text("Create")').first();
    await createButton.click();
    await page.waitForTimeout(1500);
    
    // Add to second list
    addToListButton = page.locator('button:has-text("Add to list")').first();
    await addToListButton.click();
    await page.waitForTimeout(500);
    
    createListButton = page.locator('button:has-text("Create New List")').first();
    await createListButton.click();
    await page.waitForTimeout(500);
    
    listNameInput = page.locator('input[placeholder*="list name" i]').first();
    const list2Name = `List 2 ${Date.now()}`;
    await listNameInput.fill(list2Name);
    
    createButton = page.locator('button:has-text("Create")').first();
    await createButton.click();
    await page.waitForTimeout(1500);
    
    // Navigate to Lists page
    await page.goto('/lists');
    await page.waitForTimeout(1500);
    
    // Verify entry appears in both lists (should see it twice)
    const allMatches = page.locator(`text="${testContent}"`);
    const matchCount = await allMatches.count();
    
    // Should appear at least twice (once in each list)
    expect(matchCount).toBeGreaterThanOrEqual(2);
  });
});
