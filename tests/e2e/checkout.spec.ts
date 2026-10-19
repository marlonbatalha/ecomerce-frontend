import { expect, test, type Page } from "@playwright/test";

/**
 * Carrinho e checkout ponta a ponta contra a API própria (BACKEND_URL). Em dev a API usa o gateway
 * fake (`Pagamentos:Provedor=Fake`): sem URL do Mercado Pago, o checkout vai direto pra confirmação.
 * Cada teste usa uma conta nova, então rodam em paralelo sem dividir carrinho.
 */

const SENHA = "SenhaForte123!";
// Produto do seed (sql/seed-produtos-exemplo.sql no backend), variante única com estoque.
const PRODUTO = "/produtos/garrafa-termica-1-litro";

async function cadastrar(page: Page) {
  const email = `e2e-checkout-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@exemplo.com`;
  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").fill("Cliente Checkout");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(SENHA);
  await page.getByLabel("Confirme a senha").fill(SENHA);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/conta$/);
  return email;
}

async function adicionarAoCarrinho(page: Page, url = PRODUTO) {
  await page.goto(url);
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await expect(page.getByText("Produto adicionado ao carrinho.")).toBeVisible();
}

async function preencherEndereco(page: Page) {
  await page.getByLabel("Nome do endereço").fill("Casa");
  await page.getByLabel("CEP").fill("01310-100");
  await page.getByLabel("Rua / avenida").fill("Av. Paulista");
  await page.getByLabel("Número").fill("1000");
  await page.getByLabel("Bairro").fill("Bela Vista");
  await page.getByLabel("Cidade").fill("São Paulo");
  await page.getByLabel("Estado").selectOption("SP");
}

test("carrinho de visitante: adiciona, mostra no ícone, altera e remove", async ({ page }) => {
  await adicionarAoCarrinho(page);
  await expect(page.getByRole("link", { name: "Carrinho, 1 item" })).toBeVisible();

  await page.getByRole("link", { name: "Carrinho, 1 item" }).click();
  await expect(page).toHaveURL(/\/carrinho$/);
  await expect(page.getByRole("link", { name: "Garrafa Térmica 1 Litro" }).first()).toBeVisible();

  await page.getByRole("button", { name: /Aumentar quantidade/ }).click();
  await expect(page.getByRole("link", { name: "Carrinho, 2 itens" })).toBeVisible();

  await page.getByRole("button", { name: /Remover Garrafa/ }).click();
  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
  await expect(page.getByRole("link", { name: "Carrinho", exact: true })).toBeVisible();
});

test("não deixa adicionar uma opção esgotada", async ({ page }) => {
  // Tamanho 42 do tênis tem estoque 0 no seed.
  await page.goto("/produtos/tenis-casual-urbano");
  await page.getByRole("button", { name: "42 (esgotado)" }).click();

  await expect(page.getByRole("button", { name: "Opção esgotada" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Adicionar ao carrinho" })).toHaveCount(0);
});

test("checkout exige login e o carrinho do visitante vai junto pra conta", async ({ page }) => {
  await adicionarAoCarrinho(page);
  await page.goto("/carrinho");
  await page.getByRole("link", { name: "Ir para o checkout" }).click();
  await expect(page).toHaveURL(/\/entrar\?redirecionar=%2Fcheckout/);

  await page.getByRole("link", { name: "Criar conta" }).click();
  const email = `e2e-mescla-${Date.now()}@exemplo.com`;
  await page.getByLabel("Nome completo").fill("Cliente Mescla");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(SENHA);
  await page.getByLabel("Confirme a senha").fill(SENHA);
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByText("Garrafa Térmica 1 Litro")).toBeVisible();
  await expect(page.getByRole("link", { name: "Carrinho, 1 item" })).toBeVisible();
});

test("compra completa: endereço novo, frete, cupom inválido e confirmação", async ({ page }) => {
  await cadastrar(page);
  await adicionarAoCarrinho(page);
  await page.goto("/checkout");

  // Sem endereço salvo, o checkout já abre o cadastro.
  await preencherEndereco(page);
  await page.getByRole("button", { name: "Cadastrar endereço" }).click();
  await expect(page.getByRole("list", { name: "Endereços salvos" })).toContainText("Av. Paulista");

  // Frete: troca pra SEDEX e o total acompanha (R$ 79,90 + R$ 34,90).
  await page.getByLabel(/SEDEX/).check();
  await expect(page.getByText("R$ 114,80")).toBeVisible();

  await page.getByLabel("Cupom de desconto").fill("NAO-EXISTE");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page.getByText("Cupom não encontrado.")).toBeVisible();

  await page.getByRole("button", { name: "Ir para o pagamento" }).click();

  await expect(page).toHaveURL(/\/checkout\/confirmacao\?pedido=/);
  await expect(page.getByRole("heading", { name: "Pedido recebido!" })).toBeVisible();
  await expect(page.getByText("Entrega via SEDEX")).toBeVisible();
  await expect(page.getByText("R$ 114,80")).toBeVisible();
  // O carrinho foi esvaziado no checkout.
  await expect(page.getByRole("link", { name: "Carrinho", exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Ver pedido" }).click();
  await expect(page).toHaveURL(/\/conta\/pedidos\//);
  await expect(page.getByText("Aguardando pagamento")).toBeVisible();
});
