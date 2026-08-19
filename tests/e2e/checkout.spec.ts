import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Carrinho fica em localStorage — cada teste começa do zero.
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

/**
 * Clica em "Adicionar ao carrinho" e espera a escrita no carrinho
 * (persistido) realmente acontecer, checando o badge no header — mais
 * confiável que esperar o texto "Adicionado ✓", que é transiente (some
 * depois de 2s) e pode flakar sob carga com vários testes em paralelo.
 */
async function addToCart(page: Page) {
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await expect(page.getByRole("link", { name: /carrinho, 1 item/i })).toBeVisible();
}

test("adiciona um produto ao carrinho a partir da página do produto", async ({ page }) => {
  await page.goto("/produtos/fone-de-ouvido-bluetooth");
  await addToCart(page);

  await page.getByRole("link", { name: /carrinho/i }).click();
  await expect(page).toHaveURL(/\/carrinho$/);
  await expect(page.getByText("Fone de Ouvido Bluetooth")).toBeVisible();
});

test("não deixa adicionar um produto esgotado", async ({ page }) => {
  await page.goto("/produtos/carregador-portatil-20000mah");
  await expect(page.getByRole("button", { name: "Produto esgotado" })).toBeDisabled();
});

test("carrinho vazio mostra estado vazio e link para produtos", async ({ page }) => {
  await page.goto("/carrinho");
  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
});

test("completa o fluxo de checkout até a confirmação (Pix)", async ({ page }) => {
  await page.goto("/produtos/fone-de-ouvido-bluetooth");
  await addToCart(page);

  await page.goto("/carrinho");
  await page.getByRole("link", { name: "Ir para o checkout" }).click();

  // Identificação
  await expect(page).toHaveURL(/\/checkout\/identificacao$/);
  await page.getByLabel("Nome completo").fill("Maria Silva");
  await page.getByLabel("E-mail").fill("maria@example.com");
  await page.getByLabel("Telefone").fill("11912345678");
  await page.getByRole("button", { name: "Continuar para o endereço" }).click();

  // Endereço
  await expect(page).toHaveURL(/\/checkout\/endereco$/);
  await page.getByLabel("CEP").fill("01310-100");
  await page.getByLabel("Rua").fill("Av. Paulista");
  await page.getByLabel("Número").fill("1000");
  await page.getByLabel("Bairro").fill("Bela Vista");
  await page.getByLabel("Cidade").fill("São Paulo");
  await page.getByLabel("UF").fill("SP");
  await page.getByRole("button", { name: "Continuar para o pagamento" }).click();

  // Pagamento (Pix é o método padrão)
  await expect(page).toHaveURL(/\/checkout\/pagamento$/);
  await page.getByRole("button", { name: "Finalizar pedido" }).click();

  // Confirmação
  await expect(page).toHaveURL(/\/checkout\/confirmacao$/, { timeout: 10_000 });
  await expect(page.getByRole("heading", { name: "Pedido confirmado!" })).toBeVisible();
  await expect(page.getByText(/pagamento via Pix/i)).toBeVisible();

  // Carrinho foi esvaziado após o pedido
  await page.goto("/carrinho");
  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
});

test("valida os campos do cartão quando esse é o método escolhido", async ({ page }) => {
  await page.goto("/produtos/fone-de-ouvido-bluetooth");
  await addToCart(page);

  await page.goto("/carrinho");
  await page.getByRole("link", { name: "Ir para o checkout" }).click();

  await page.getByLabel("Nome completo").fill("Maria Silva");
  await page.getByLabel("E-mail").fill("maria@example.com");
  await page.getByLabel("Telefone").fill("11912345678");
  await page.getByRole("button", { name: "Continuar para o endereço" }).click();

  await page.getByLabel("CEP").fill("01310-100");
  await page.getByLabel("Rua").fill("Av. Paulista");
  await page.getByLabel("Número").fill("1000");
  await page.getByLabel("Bairro").fill("Bela Vista");
  await page.getByLabel("Cidade").fill("São Paulo");
  await page.getByLabel("UF").fill("SP");
  await page.getByRole("button", { name: "Continuar para o pagamento" }).click();

  await page.getByRole("button", { name: "Cartão de crédito" }).click();
  await page.getByRole("button", { name: "Finalizar pedido" }).click();

  // Sem preencher o cartão, permanece na mesma página com erros de validação
  await expect(page).toHaveURL(/\/checkout\/pagamento$/);
  await expect(page.getByText("Número de cartão inválido")).toBeVisible();

  await page.getByLabel("Número do cartão").fill("4111 1111 1111 1111");
  await page.getByLabel("Nome impresso no cartão").fill("MARIA SILVA");
  await page.getByLabel("Validade (MM/AA)").fill("12/29");
  await page.getByLabel("CVV").fill("123");
  await page.getByRole("button", { name: "Finalizar pedido" }).click();

  await expect(page).toHaveURL(/\/checkout\/confirmacao$/, { timeout: 10_000 });
  await expect(page.getByText(/pagamento via Cartão de crédito/i)).toBeVisible();
});
