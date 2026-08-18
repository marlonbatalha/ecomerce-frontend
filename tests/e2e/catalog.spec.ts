import { expect, test } from "@playwright/test";

test("navega da home até um produto", async ({ page }) => {
  await page.goto("/");

  const firstProduct = page.getByRole("link", { name: /fone de ouvido bluetooth/i });
  await firstProduct.click();

  await expect(page).toHaveURL(/\/produtos\/fone-de-ouvido-bluetooth$/);
  await expect(page.getByRole("heading", { name: /fone de ouvido bluetooth/i })).toBeVisible();
  await expect(page.getByText("R$")).toBeVisible();
});

test("navega até uma categoria pelo menu", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Moda" }).click();

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
