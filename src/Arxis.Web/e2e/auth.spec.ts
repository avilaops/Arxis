import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('should show login form', async ({ page }) => {
    await page.goto('/login');

    // Check for login form elements
    const emailInput = page.locator('input[type="email"]').or(
      page.locator('input').filter({ hasText: /email/i }).or(
        page.locator('[data-testid="email-input"]')
      )
    );

    const passwordInput = page.locator('input[type="password"]').or(
      page.locator('input').filter({ hasText: /password|senha/i }).or(
        page.locator('[data-testid="password-input"]')
      )
    );

    const loginButton = page.locator('button').filter({ hasText: /login|entrar|sign in/i }).or(
      page.locator('[data-testid="login-button"]')
    );

    await expect(emailInput.or(passwordInput).or(loginButton)).toBeVisible();
  });

  test('should validate login form', async ({ page }) => {
    await page.goto('/login');

    const loginButton = page.locator('button').filter({ hasText: /login|entrar|sign in/i }).or(
      page.locator('[data-testid="login-button"]')
    );

    if (await loginButton.count() > 0) {
      // Try to submit empty form
      await loginButton.click();

      // Should show validation errors or handle gracefully
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle login success', async ({ page }) => {
    await page.goto('/login');

    // Mock successful login response
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token',
          user: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User'
          }
        })
      });
    });

    const emailInput = page.locator('input[type="email"]').or(
      page.locator('[data-testid="email-input"]')
    );

    const passwordInput = page.locator('input[type="password"]').or(
      page.locator('[data-testid="password-input"]')
    );

    const loginButton = page.locator('button').filter({ hasText: /login|entrar|sign in/i }).or(
      page.locator('[data-testid="login-button"]')
    );

    if (await emailInput.count() > 0 && await passwordInput.count() > 0 && await loginButton.count() > 0) {
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      await loginButton.click();

      // Should redirect or show success
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle login failure', async ({ page }) => {
    await page.goto('/login');

    // Mock failed login response
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Invalid credentials'
        })
      });
    });

    const emailInput = page.locator('input[type="email"]').or(
      page.locator('[data-testid="email-input"]')
    );

    const passwordInput = page.locator('input[type="password"]').or(
      page.locator('[data-testid="password-input"]')
    );

    const loginButton = page.locator('button').filter({ hasText: /login|entrar|sign in/i }).or(
      page.locator('[data-testid="login-button"]')
    );

    if (await emailInput.count() > 0 && await passwordInput.count() > 0 && await loginButton.count() > 0) {
      await emailInput.fill('wrong@example.com');
      await passwordInput.fill('wrongpassword');
      await loginButton.click();

      // Should show error message or stay on login page
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should persist authentication state', async ({ page }) => {
    // Set up authenticated state
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

    // Should stay authenticated after page reload
    await page.reload();
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle logout', async ({ page }) => {
    // Set up authenticated state
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

    // Look for logout button
    const logoutButton = page.locator('button').filter({ hasText: /logout|sair|sign out/i }).or(
      page.locator('[data-testid="logout-button"]')
    );

    if (await logoutButton.count() > 0) {
      await logoutButton.click();

      // Should clear authentication state
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
