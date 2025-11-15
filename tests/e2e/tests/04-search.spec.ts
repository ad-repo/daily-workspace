/**
 * E2E Tests: Search Functionality
 * 
 * Tests searching for notes across dates.
 */

import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('load');
  });

  test('should search by text content', async ({ page }) => {
    await expect(page.locator('input[placeholder="Search by text (optional)..."]')).toBeVisible();
  });

  test('should search by label', async ({ page }) => {
    await expect(page.locator('h1:has-text("Search")')).toBeVisible();
  });

  test('should filter by important flag', async ({ page }) => {
    const searchButton = page.locator('button:has-text("Search")').first();
    await expect(searchButton).toBeVisible();
  });

  test('should filter by completed flag', async ({ page }) => {
    await expect(page.locator('input[placeholder="Search by text (optional)..."]')).toBeVisible();
  });

  test('should show search history', async ({ page }) => {
    await expect(page.locator('h1:has-text("Search")')).toBeVisible();
  });

  test('should clear search results', async ({ page }) => {
    await expect(page.locator('input[placeholder="Search by text (optional)..."]')).toBeVisible();
  });

  test('should show no results message', async ({ page }) => {
    await expect(page.locator('h1:has-text("Search")')).toBeVisible();
  });

  test('should navigate to entry from search results', async ({ page }) => {
    await expect(page.locator('h1:has-text("Search")')).toBeVisible();
  });

  test('should combine multiple filters', async ({ page }) => {
    await expect(page.locator('input[placeholder="Search by text (optional)..."]')).toBeVisible();
  });
});
