import { expect, test } from "@playwright/test";

test("home carrega com sucesso", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle(/.+/);
});
