import { expect, test } from "@playwright/test";

test("navega da home até um produto", async ({ page }) => {
  await page.goto("/");

  // Primeiro produto em destaque, seja qual for — o catálogo vem do banco, não de dado fixo.
  const firstProduct = page.locator('a[href^="/produtos/"]').first();
  const name = (await firstProduct.locator("h3").textContent())?.trim() ?? "";
  await firstProduct.click();

  await expect(page).toHaveURL(/\/produtos\/[\w-]+$/);
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  await expect(page.getByText(/R\$/).first()).toBeVisible();
});

test("navega até uma categoria pelo menu", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("navigation", { name: "Categorias" })
    .getByRole("link", { name: "Moda" })
    .click();

  await expect(page).toHaveURL(/\/categorias\/moda$/);
  await expect(page.getByRole("heading", { name: "Moda" })).toBeVisible();
});

test("busca por produtos", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("Buscar produtos...").fill("tênis");
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/produtos\?q=/);
  await expect(page.getByRole("heading", { name: /resultados para/i })).toBeVisible();
});

test("produto inexistente retorna 404", async ({ page }) => {
  const response = await page.goto("/produtos/nao-existe");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Página não encontrada")).toBeVisible();
});
