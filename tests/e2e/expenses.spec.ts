import { test, expect } from '@playwright/test'; test('Dépenses smoke', async({page})=>{ await page.goto('/(app)/expenses'); await expect(page.getByTestId('expense-allocations')).toBeVisible(); });
