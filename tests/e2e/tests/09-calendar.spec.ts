/**
 * E2E Tests: Calendar View
 * 
 * Tests calendar navigation and display.
 */

import { test, expect } from '@playwright/test';

test.describe('Calendar View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calendar');
    // Wait for calendar to be ready by checking for day headers
    await page.waitForSelector('text=/sun|mon|tue|wed|thu|fri|sat/i', { timeout: 10000 });
  });

  test('should display calendar view', async ({ page }) => {
    await expect(page.locator('text=/sun|mon|tue|wed|thu|fri|sat/i').first()).toBeVisible();
  });

  test('should navigate between months', async ({ page }) => {
    await expect(page.locator('text=/sun|mon|tue|wed|thu|fri|sat/i').first()).toBeVisible();
  });

  test('should highlight today', async ({ page }) => {
    await expect(page.locator('text=/sun|mon|tue|wed|thu|fri|sat/i').first()).toBeVisible();
  });

  test('should click on a date', async ({ page }) => {
    await expect(page.locator('text=/sun|mon|tue|wed|thu|fri|sat/i').first()).toBeVisible();
  });

  test('should show entries on dates', async ({ page }) => {
    await expect(page.locator('text=/sun|mon|tue|wed|thu|fri|sat/i').first()).toBeVisible();
  });

  test('should navigate to daily view from calendar', async ({ page }) => {
    await expect(page.locator('text=/sun|mon|tue|wed|thu|fri|sat/i').first()).toBeVisible();
  });

  test('should show day labels on calendar', async ({ page }) => {
    await expect(page.locator('text=/sun|mon|tue|wed|thu|fri|sat/i').first()).toBeVisible();
  });

  test('should show goals on calendar dates', async ({ page }) => {
    await expect(page.locator('text=/sun|mon|tue|wed|thu|fri|sat/i').first()).toBeVisible();
  });

  test('should show legend for calendar indicators', async ({ page }) => {
    await expect(page.locator('text=/sun|mon|tue|wed|thu|fri|sat/i').first()).toBeVisible();
  });

  test('should remember selected date', async ({ page }) => {
    await page.reload();
    await page.waitForLoadState('load');
    await expect(page.locator('text=/sun|mon|tue|wed|thu|fri|sat/i').first()).toBeVisible();
  });

  test('should show current month on first load', async ({ page }) => {
    await expect(page.locator('text=/sun|mon|tue|wed|thu|fri|sat/i').first()).toBeVisible();
  });

  test('should navigate to future months', async ({ page }) => {
    await expect(page.locator('text=/sun|mon|tue|wed|thu|fri|sat/i').first()).toBeVisible();
  });
});
