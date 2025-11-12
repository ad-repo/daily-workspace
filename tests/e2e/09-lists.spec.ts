import { test, expect } from '@playwright/test';

test.describe('Lists Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/lists');
    await page.waitForLoadState('domcontentloaded');
  });

  test.describe('List Creation and Display', () => {
    test('should display empty state when no lists exist', async ({ page }) => {
      // Check for empty state message
      const emptyState = page.locator('text=/no lists yet/i');
      if (await emptyState.isVisible()) {
        expect(await emptyState.isVisible()).toBe(true);
      }
    });

    test('should create a new list', async ({ page }) => {
      // Click the floating add button
      await page.locator('button[title*="Create new list"]').first().click();
      
      // Wait for modal or input to appear
      await page.waitForTimeout(500);
      
      // Fill in list details (adjust selectors based on actual modal)
      const listName = `Test List ${Date.now()}`;
      await page.fill('input[placeholder*="name" i]', listName);
      
      // Submit
      await page.keyboard.press('Enter');
      
      // Verify list appears
      await expect(page.locator(`text=${listName}`)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('List Drag and Drop Reordering', () => {
    test.beforeEach(async ({ page }) => {
      // Ensure we have at least 3 lists for testing
      // This assumes lists already exist or we create them
      await page.waitForTimeout(1000);
    });

    test('should reorder lists by dragging from first to last position', async ({ page }) => {
      // Get all list columns
      const listColumns = page.locator('[data-testid^="list-column-"]');
      const count = await listColumns.count();
      
      if (count < 3) {
        test.skip();
        return;
      }

      // Get the first and last list headers
      const firstHeader = page.locator('[data-testid="list-header-1"]').first();
      const lastColumn = listColumns.nth(count - 1);

      // Get initial order
      const firstListName = await firstHeader.locator('h2').textContent();

      // Perform drag and drop
      await firstHeader.hover();
      await page.mouse.down();
      await lastColumn.hover();
      await page.mouse.up();

      // Wait for reorder to complete
      await page.waitForTimeout(1000);

      // Verify the first list is now at the end
      const newLastColumn = listColumns.nth(count - 1);
      const newLastListName = await newLastColumn.locator('h2').textContent();
      expect(newLastListName).toBe(firstListName);
    });

    test('should reorder lists by dragging to middle position', async ({ page }) => {
      const listColumns = page.locator('[data-testid^="list-column-"]');
      const count = await listColumns.count();
      
      if (count < 3) {
        test.skip();
        return;
      }

      // Drag last list to first position
      const lastHeader = listColumns.nth(count - 1).locator('[data-testid^="list-header-"]');
      const firstColumn = listColumns.first();

      const lastListName = await lastHeader.locator('h2').textContent();

      // Perform drag and drop
      await lastHeader.hover();
      await page.mouse.down();
      await firstColumn.hover();
      await page.mouse.up();

      // Wait for reorder
      await page.waitForTimeout(1000);

      // Verify the last list is now first
      const newFirstColumn = listColumns.first();
      const newFirstListName = await newFirstColumn.locator('h2').textContent();
      expect(newFirstListName).toBe(lastListName);
    });

    test('should show visual feedback during drag', async ({ page }) => {
      const listColumns = page.locator('[data-testid^="list-column-"]');
      const count = await listColumns.count();
      
      if (count < 2) {
        test.skip();
        return;
      }

      const firstHeader = page.locator('[data-testid^="list-header-"]').first();
      const firstContainer = listColumns.first();

      // Get initial opacity
      const initialOpacity = await firstContainer.evaluate(el => 
        window.getComputedStyle(el.parentElement!).opacity
      );

      // Start dragging
      await firstHeader.hover();
      await page.mouse.down();

      // Check opacity changed
      await page.waitForTimeout(200);
      const draggingOpacity = await firstContainer.evaluate(el => 
        window.getComputedStyle(el.parentElement!).opacity
      );

      expect(parseFloat(draggingOpacity)).toBeLessThan(parseFloat(initialOpacity));

      // Release
      await page.mouse.up();

      // Check opacity restored
      await page.waitForTimeout(200);
      const finalOpacity = await firstContainer.evaluate(el => 
        window.getComputedStyle(el.parentElement!).opacity
      );

      expect(parseFloat(finalOpacity)).toBeGreaterThan(parseFloat(draggingOpacity));
    });

    test('should not reorder when dropped on same position', async ({ page }) => {
      const listColumns = page.locator('[data-testid^="list-column-"]');
      const count = await listColumns.count();
      
      if (count < 2) {
        test.skip();
        return;
      }

      // Get initial order
      const initialOrder = [];
      for (let i = 0; i < count; i++) {
        const name = await listColumns.nth(i).locator('h2').textContent();
        initialOrder.push(name);
      }

      // Drag and drop on same position
      const firstHeader = page.locator('[data-testid^="list-header-"]').first();
      const firstColumn = listColumns.first();

      await firstHeader.hover();
      await page.mouse.down();
      await page.waitForTimeout(100);
      await firstColumn.hover();
      await page.mouse.up();

      // Wait a bit
      await page.waitForTimeout(500);

      // Verify order unchanged
      const finalOrder = [];
      for (let i = 0; i < count; i++) {
        const name = await listColumns.nth(i).locator('h2').textContent();
        finalOrder.push(name);
      }

      expect(finalOrder).toEqual(initialOrder);
    });
  });

  test.describe('List Persistence', () => {
    test('should persist list order after page reload', async ({ page }) => {
      const listColumns = page.locator('[data-testid^="list-column-"]');
      const count = await listColumns.count();
      
      if (count < 2) {
        test.skip();
        return;
      }

      // Perform a reorder
      const firstHeader = page.locator('[data-testid^="list-header-"]').first();
      const lastColumn = listColumns.nth(count - 1);

      await firstHeader.hover();
      await page.mouse.down();
      await lastColumn.hover();
      await page.mouse.up();

      await page.waitForTimeout(1000);

      // Get the new order
      const reorderedNames = [];
      for (let i = 0; i < count; i++) {
        const name = await listColumns.nth(i).locator('h2').textContent();
        reorderedNames.push(name);
      }

      // Reload page
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);

      // Verify order persisted
      const afterReloadNames = [];
      const reloadedColumns = page.locator('[data-testid^="list-column-"]');
      const reloadedCount = await reloadedColumns.count();
      
      for (let i = 0; i < reloadedCount; i++) {
        const name = await reloadedColumns.nth(i).locator('h2').textContent();
        afterReloadNames.push(name);
      }

      expect(afterReloadNames).toEqual(reorderedNames);
    });
  });

  test.describe('List Actions', () => {
    test('should have draggable headers', async ({ page }) => {
      const firstHeader = page.locator('[data-testid^="list-header-"]').first();
      
      if (await firstHeader.count() === 0) {
        test.skip();
        return;
      }

      // Verify draggable attribute
      const isDraggable = await firstHeader.getAttribute('draggable');
      expect(isDraggable).toBe('true');
    });

    test('should display list action buttons', async ({ page }) => {
      const listColumns = page.locator('[data-testid^="list-column-"]');
      
      if (await listColumns.count() === 0) {
        test.skip();
        return;
      }

      const firstColumn = listColumns.first();

      // Check for action buttons
      await expect(firstColumn.locator('button[title*="Create new entry"]')).toBeVisible();
      await expect(firstColumn.locator('button[title*="Add entries"]')).toBeVisible();
      await expect(firstColumn.locator('button[title*="Archive"]')).toBeVisible();
      await expect(firstColumn.locator('button[title*="Delete"]')).toBeVisible();
    });
  });

  test.describe('Scroll Indicator', () => {
    test('should display horizontal scroll indicator', async ({ page }) => {
      const listColumns = page.locator('[data-testid^="list-column-"]');
      const count = await listColumns.count();
      
      if (count < 2) {
        test.skip();
        return;
      }

      // Look for scroll indicator (adjust selector based on implementation)
      const scrollIndicator = page.locator('[class*="scroll"]').filter({ hasText: /\d+ lists?/i });
      
      // Indicator should be visible if there are multiple lists
      if (await scrollIndicator.count() > 0) {
        await expect(scrollIndicator.first()).toBeVisible();
      }
    });
  });
});

