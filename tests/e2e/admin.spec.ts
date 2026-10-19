import { expect, test, type Page } from "@playwright/test";

/**
 * Admin ponta a ponta. Precisa de uma conta com papel admin na API de dev, informada por
 * E2E_ADMIN_EMAIL / E2E_ADMIN_SENHA (não fica no repositório). Sem elas, os testes são pulados.
 * Enviar/entregar não entram aqui: exigem pedido pago, e com o gateway fake isso só acontece via
 * webhook assinado — coberto pelos testes de integração do backend (FluxoCompraTests).
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_SENHA = process.env.E2E_ADMIN_SENHA;
const SENHA_CLIENTE = "SenhaForte123!";
const PRODUTO = "/produtos/garrafa-termica-1-litro";

test.skip(
  !ADMIN_EMAIL || !ADMIN_SENHA,
  "Defina E2E_ADMIN_EMAIL e E2E_ADMIN_SENHA pra rodar o e2e do admin.",
);

async function entrarComoAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("E-mail").fill(ADMIN_EMAIL!);
  await page.getByLabel("Senha").fill(ADMIN_SENHA!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "Painel admin" })).toBeVisible();
}

/** Cliente novo com um pedido feito (fica "Aguardando pagamento" com o gateway fake). */
async function clienteComPedido(page: Page, cupom?: string) {
  const email = `e2e-admin-pedido-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@exemplo.com`;
  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").fill("Cliente do Admin");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(SENHA_CLIENTE);
  await page.getByLabel("Confirme a senha").fill(SENHA_CLIENTE);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/conta$/);

  await page.goto(PRODUTO);
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await expect(page.getByText("Produto adicionado ao carrinho.")).toBeVisible();

  await page.goto("/checkout");
  await page.getByLabel("Nome do endereço").fill("Casa");
  await page.getByLabel("CEP").fill("01310-100");
  await page.getByLabel("Rua / avenida").fill("Av. Paulista");
  await page.getByLabel("Número").fill("1000");
  await page.getByLabel("Bairro").fill("Bela Vista");
  await page.getByLabel("Cidade").fill("São Paulo");
  await page.getByLabel("Estado").selectOption("SP");
  await page.getByRole("button", { name: "Cadastrar endereço" }).click();
  await expect(page.getByRole("list", { name: "Endereços salvos" })).toBeVisible();

  if (cupom) {
    await page.getByLabel("Cupom de desconto").fill(cupom);
    await page.getByRole("button", { name: "Aplicar" }).click();
    await expect(page.getByText(cupom, { exact: true })).toBeVisible();
  }

  await page.getByRole("button", { name: "Ir para o pagamento" }).click();
  await expect(page).toHaveURL(/\/checkout\/confirmacao\?pedido=/);
  const pedidoId = new URL(page.url()).searchParams.get("pedido")!;
  return { email, pedidoId };
}

test("pedido feito na loja aparece no admin com cliente e endereço", async ({ browser }) => {
  const loja = await browser.newPage();
  const { email, pedidoId } = await clienteComPedido(loja);
  await loja.close();

  const page = await browser.newPage();
  await entrarComoAdmin(page);
  await page.getByRole("link", { name: "Pedidos", exact: true }).first().click();
  // O filtro, não o badge de status das linhas (que tem o mesmo texto).
  await page
    .getByRole("group", { name: "Filtrar por status" })
    .getByRole("link", { name: "Aguardando pagamento" })
    .click();

  const numero = `#${pedidoId.slice(0, 8).toUpperCase()}`;
  await page.getByRole("link", { name: new RegExp(numero) }).click();

  await expect(page.getByRole("heading", { name: `Pedido ${numero}` })).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  await expect(page.getByText("Av. Paulista, 1000")).toBeVisible();
  await expect(page.getByText(/Aguardando o pagamento do cliente/)).toBeVisible();
});

test("cupom criado no admin vale no checkout e pode ser inativado", async ({ browser }) => {
  const codigo = `E2E${Date.now().toString(36).toUpperCase()}`;

  const page = await browser.newPage();
  await entrarComoAdmin(page);
  await page.goto("/admin/cupons");
  await page.getByLabel("Código").fill(codigo);
  await page.getByLabel("Desconto (%)").fill("10");
  await page.getByRole("button", { name: "Criar cupom" }).click();
  await expect(page.getByText(`Cupom ${codigo} criado.`)).toBeVisible();
  const linha = page.getByRole("row").filter({ hasText: codigo });
  await expect(linha.getByText("Ativo", { exact: true })).toBeVisible();

  // Garrafa R$ 79,90 com 10% → R$ 7,99 de desconto.
  const loja = await browser.newPage();
  await clienteComPedido(loja, codigo);
  await expect(loja.getByText("−R$ 7,99")).toBeVisible();
  await loja.close();

  await page.reload();
  await expect(linha).toContainText("1");
  await linha.getByRole("button", { name: "Inativar" }).click();
  await expect(linha.getByText("Inativo", { exact: true })).toBeVisible();
});

test("ajuste de estoque fica registrado no histórico", async ({ page }) => {
  await entrarComoAdmin(page);
  await page.goto("/admin/produtos");
  await page
    .getByRole("link", { name: /Garrafa Térmica/ })
    .first()
    .click();
  await page
    .getByRole("link", { name: /Gerenciar estoque/ })
    .first()
    .click();

  // Mantém o mesmo número (não mexe no estoque que os outros testes usam), só registra o motivo.
  const motivo = `Conferência e2e ${Date.now()}`;
  await page.getByLabel("Motivo").fill(motivo);
  await page.getByRole("button", { name: "Ajustar estoque" }).click();

  await expect(page.getByText("Estoque ajustado.")).toBeVisible();
  await expect(page.getByText(motivo)).toBeVisible();
});

test("busca de clientes encontra a conta pelo e-mail", async ({ page }) => {
  await entrarComoAdmin(page);
  await page.goto("/admin/clientes");
  await page.getByLabel("Buscar por nome ou e-mail").fill(ADMIN_EMAIL!);
  await page.getByRole("button", { name: "Buscar" }).click();

  const linha = page.getByRole("row").filter({ hasText: ADMIN_EMAIL! });
  await expect(linha.getByText("Admin", { exact: true })).toBeVisible();
});
