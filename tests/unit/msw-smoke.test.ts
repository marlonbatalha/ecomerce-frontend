import { describe, expect, it } from "vitest";

describe("MSW setup", () => {
  it("intercepta chamadas de rede e responde com o handler mockado", async () => {
    const res = await fetch("https://api.example.test/health");
    expect(res.ok).toBe(true);
    await expect(res.json()).resolves.toEqual({ status: "ok" });
  });
});
