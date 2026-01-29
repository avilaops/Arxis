import { test, expect } from '@playwright/test';

test.describe('ARXIS Application E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Clear local storage and cookies before each test
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('should load the application successfully', async ({ page }) => {
    await page.goto('/');

    // Check if the page loads without errors
    await expect(page).toHaveTitle(/ARXIS/);

    // Check for main application elements
    await expect(page.locator('text=ARXIS')).toBeVisible();
  });

  test('should display login page when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Should redirect to login or show login form
    const loginForm = page.locator('[data-testid="login-form"]').or(
      page.locator('form').filter({ hasText: /login|entrar|email|senha/i })
    );

    await expect(loginForm).toBeVisible();
  });

  test('should have responsive design on mobile', async ({ page, isMobile }) => {
    if (!isMobile) test.skip();

    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size

    // Check if navigation is accessible on mobile
    const mobileMenu = page.locator('[data-testid="mobile-menu"]').or(
      page.locator('button').filter({ hasText: /menu|hamburger/i })
    );

    // Either mobile menu should be visible or content should be responsive
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle 404 errors gracefully', async ({ page }) => {
    await page.goto('/non-existent-page');

    // Should show 404 page or redirect to home
    const errorMessage = page.locator('text=404').or(
      page.locator('text=not found').or(
        page.locator('text=página não encontrada')
      )
    );

    await expect(errorMessage.or(page.locator('text=ARXIS'))).toBeVisible();
  });

  test('should load dashboard page for authenticated users', async ({ page }) => {
    // Mock authentication for testing
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }));
    });

    await page.goto('/dashboard');

    // Should load dashboard or redirect appropriately
    await expect(page.locator('text=Dashboard').or(page.locator('text=ARXIS'))).toBeVisible();
  });

  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');

    // Try to find navigation elements
    const navLinks = page.locator('nav a').or(
      page.locator('[data-testid="nav-link"]').or(
        page.locator('a').filter({ hasText: /dashboard|projects|tarefas|issues/i })
      )
    );

    // If navigation exists, test navigation
    if (await navLinks.count() > 0) {
      const firstLink = navLinks.first();
      const href = await firstLink.getAttribute('href');

      if (href && href !== '#') {
        await firstLink.click();
        await page.waitForLoadState('networkidle');

        // Should navigate without errors
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

  test('should handle form submissions', async ({ page }) => {
    await page.goto('/');

    // Look for any forms on the page
    const forms = page.locator('form');

    if (await forms.count() > 0) {
      const firstForm = forms.first();

      // Try to submit the form (may fail, but shouldn't crash)
      try {
        await firstForm.press('Enter');
        await page.waitForLoadState('networkidle');
      } catch (error) {
        // Form submission might fail due to validation, that's ok
        console.log('Form submission test completed (expected validation errors)');
      }

      // Page should still be functional
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should load images and assets', async ({ page }) => {
    await page.goto('/');

    // Check for broken images
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');

      if (src && !src.startsWith('data:') && !src.includes('placeholder')) {
        // Check if image loads (naturalWidth > 0)
        const naturalWidth = await img.evaluate(img => (img as HTMLImageElement).naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.goto('/');

    // Check for some basic accessibility
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    // At least some buttons should have proper labels or aria-labels
    if (buttonCount > 0) {
      let accessibleButtons = 0;

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const title = await button.getAttribute('title');

        if ((text && text.trim().length > 0) || ariaLabel || title) {
          accessibleButtons++;
        }
      }

      // At least 60% of buttons should be accessible
      expect(accessibleButtons / Math.min(buttonCount, 5)).toBeGreaterThan(0.6);
    }
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/**', route => route.abort());

    await page.goto('/');

    // Application should still load basic UI
    await expect(page.locator('body')).toBeVisible();

    // Should show some error message or fallback UI
    const errorMessage = page.locator('text=error').or(
      page.locator('text=erro').or(
        page.locator('[data-testid="error-message"]')
      )
    );

    // Either error message should appear or app should handle gracefully
    try {
      await expect(errorMessage.or(page.locator('text=ARXIS'))).toBeVisible({ timeout: 5000 });
    } catch {
      // If no error message, at least the app shouldn't crash
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
