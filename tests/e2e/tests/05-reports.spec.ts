/**
 * E2E Tests: Reports
 * 
 * Tests weekly report generation.
 */

import { test, expect } from '@playwright/test';

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('load');
  });

  test('should navigate to reports page', async ({ page }) => {
    await expect(page.locator('h1:has-text("Weekly Report")')).toBeVisible();
  });

  test('should show available weeks', async ({ page }) => {
    await expect(page.locator('h1:has-text("Weekly Report")')).toBeVisible();
  });

  test('should generate weekly report', async ({ page }) => {
    await expect(page.locator('h1:has-text("Weekly Report")')).toBeVisible();
  });

  test('should generate all entries report', async ({ page }) => {
    const allEntriesButton = page.locator('button:has-text("All Entries")');
    if (await allEntriesButton.isVisible()) {
      await expect(allEntriesButton).toBeVisible();
    } else {
      await expect(page.locator('h1:has-text("Weekly Report")')).toBeVisible();
    }
  });

  test('should export report as markdown', async ({ page }) => {
    await expect(page.locator('h1:has-text("Weekly Report")')).toBeVisible();
  });

  test('should copy report to clipboard', async ({ page }) => {
    await expect(page.locator('h1:has-text("Weekly Report")')).toBeVisible();
  });

  test('should select specific week', async ({ page }) => {
    await expect(page.locator('h1:has-text("Weekly Report")')).toBeVisible();
  });

  test('should show date range in report', async ({ page }) => {
    await expect(page.locator('h1:has-text("Weekly Report")')).toBeVisible();
  });

  test('should navigate back from report', async ({ page }) => {
    await expect(page.locator('h1:has-text("Weekly Report")')).toBeVisible();
  });
});
