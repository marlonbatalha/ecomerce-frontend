import { expect, test, type Page } from "@playwright/test";

/**
 * Conta do cliente ponta a ponta — precisa da API própria rodando (BACKEND_URL), como o resto
 * desta pasta. Cada teste cria uma conta nova (e-mail único), então pode rodar em paralelo e
 * contra o mesmo banco de dev sem colidir.
 */

const SENHA = "SenhaForte123!";

function emailUnico(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@exemplo.com`;
}

async function cadastrar(page: Page, nome = "Maria Teste") {
  const email = emailUnico();
  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").fill(nome);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(SENHA);
  await page.getByLabel("Confirme a senha").fill(SENHA);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/conta$/);
  return email;
}

test("cadastro leva pra conta e o cabeçalho mostra o nome", async ({ page }) => {
  await cadastrar(page, "Maria Teste");

  await expect(page.getByRole("heading", { name: "Olá, Maria" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Minha conta \(Maria\)/ })).toBeVisible();
  await expect(page.getByText("Nenhum pedido ainda")).toBeVisible();
});

test("cadastro com senha fraca mostra as regras em português e mantém o que foi digitado", async ({
  page,
}) => {
  await page.goto("/cadastro");
  await page.getByLabel("Nome completo").fill("Senha Fraca");
  await page.getByLabel("E-mail").fill(emailUnico());
  await page.getByLabel("Senha", { exact: true }).fill("senhafraca");
  await page.getByLabel("Confirme a senha").fill("senhafraca");
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page.locator("form [role=alert]")).toContainText("letra maiúscula");
  await expect(page.getByLabel("Nome completo")).toHaveValue("Senha Fraca");
});

test("sair, área protegida pede login e o login volta pra onde estava", async ({ page }) => {
  const email = await cadastrar(page);

  await page.getByRole("button", { name: "Sair" }).first().click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();

  await page.goto("/conta/enderecos");
  await expect(page).toHaveURL(/\/entrar\?redirecionar=%2Fconta%2Fenderecos/);

  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill("senha-errada");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.locator("form [role=alert]")).toHaveText("E-mail ou senha inválidos.");

  await page.getByLabel("Senha").fill(SENHA);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/conta\/enderecos$/);
});

test("access token vencido é renovado sem pedir login de novo", async ({ page, context }) => {
  await cadastrar(page);

  // Simula os 15 min do access token passando: some o cookie dele, fica só o de renovação.
  await context.clearCookies({ name: "sessao_acesso" });
  await page.goto("/conta/dados");

  await expect(page).toHaveURL(/\/conta\/dados$/);
  await expect(page.getByRole("heading", { name: "Dados e senha" })).toBeVisible();
  const cookies = await context.cookies();
  expect(cookies.some((c) => c.name === "sessao_acesso")).toBe(true);
});

test("cadastra, edita, define padrão e remove endereços", async ({ page }) => {
  await cadastrar(page);
  await page.goto("/conta/enderecos");

  async function preencher(rotulo: string, rua: string) {
    await page.getByLabel("Nome do endereço").fill(rotulo);
    await page.getByLabel("CEP").fill("01310-100");
    await page.getByLabel("Rua / avenida").fill(rua);
    await page.getByLabel("Número").fill("1000");
    await page.getByLabel("Bairro").fill("Bela Vista");
    await page.getByLabel("Cidade").fill("São Paulo");
    await page.getByLabel("Estado").selectOption("SP");
  }

  await preencher("Casa", "Av. Paulista");
  await page.getByRole("button", { name: "Cadastrar endereço" }).click();
  // Só os cartões de endereço (todos têm "Bela Vista") — o rodapé tem "Casa e Decoração".
  const cartoes = page.getByRole("listitem").filter({ hasText: "Bela Vista" });
  const casa = cartoes.filter({ hasText: "Casa" });
  await expect(casa.getByText("Padrão", { exact: true })).toBeVisible();

  await preencher("Trabalho", "Rua Augusta");
  await page.getByRole("button", { name: "Cadastrar endereço" }).click();
  const trabalho = cartoes.filter({ hasText: "Trabalho" });
  await expect(trabalho).toBeVisible();

  await trabalho.getByRole("button", { name: "Tornar padrão" }).click();
  await expect(trabalho.getByText("Padrão", { exact: true })).toBeVisible();
  await expect(casa.getByText("Padrão", { exact: true })).toHaveCount(0);

  await casa.getByRole("link", { name: "Editar" }).click();
  await expect(page.getByRole("heading", { name: 'Editar "Casa"' })).toBeVisible();
  await expect(page.getByLabel("Número")).toHaveValue("1000");
  await page.getByLabel("Número").fill("2000");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(casa).toContainText("Av. Paulista, 2000");

  await casa.getByRole("button", { name: "Remover" }).click();
  await expect(casa).toHaveCount(0);
  await expect(cartoes).toHaveCount(1);
});

test("altera o nome e valida a troca de senha", async ({ page }) => {
  await cadastrar(page, "Nome Antigo");
  await page.goto("/conta/dados");

  await page.getByLabel("Nome completo").fill("Nome Novo");
  await page.getByRole("button", { name: "Salvar dados" }).click();
  await expect(page.getByText("Dados atualizados.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Minha conta \(Nome\)/ })).toBeVisible();

  await page.getByLabel("Senha atual").fill("senha-que-nao-e-a-atual");
  await page.getByLabel("Nova senha", { exact: true }).fill("OutraSenha456!");
  await page.getByLabel("Confirme a nova senha").fill("OutraSenha456!");
  await page.getByRole("button", { name: "Alterar senha" }).click();
  await expect(page.locator("form [role=alert]")).toContainText("Senha atual incorreta.");

  await page.getByLabel("Senha atual").fill(SENHA);
  await page.getByLabel("Nova senha", { exact: true }).fill("OutraSenha456!");
  await page.getByLabel("Confirme a nova senha").fill("OutraSenha456!");
  await page.getByRole("button", { name: "Alterar senha" }).click();
  await expect(page.getByText("Senha alterada.")).toBeVisible();
});
