import { test, expect } from '@playwright/test'; test('Entrées smoke', async({page})=>{ await page.goto('/(app)/transactions'); await expect(page.getByTestId('income-form')).toBeVisible(); });
