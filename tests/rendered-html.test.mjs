import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders Casa Antonia with all ten chapters and the official hero", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /Casa Antonia · Bungalows en Chacala, Nayarit/);
  assert.match(html, /src="\/heroimage.webp"/);
  assert.match(html, /fetchPriority="high"/i);
  for (const chapter of ["01 · Llegar", "02 · Habitar", "03 · Disfrutar", "04 · Confiar", "05 · Explorar", "06 · Ubicarse", "07 · Mirar", "08 · Recibir", "09 · Saber", "10 · Volver"]) {
    assert.ok(html.includes(chapter), `Missing chapter: ${chapter}`);
  }
  for (const id of ["inicio", "habitaciones", "galeria", "ubicacion", "faq"]) {
    assert.ok(html.includes(`id="${id}"`), `Missing navigation target: ${id}`);
  }
  assert.equal((html.match(/class="room"/g) ?? []).length, 3);
  assert.equal((html.match(/<details/g) ?? []).length, 4);
  assert.match(html, /\[\[VERIFICAR:/);
  assert.doesNotMatch(html, /Codex is working|Your site is taking shape|react-loading-skeleton/);
});

test("official hero is a valid WebP asset", async () => {
  const bytes = await readFile(new URL("../public/heroimage.webp", import.meta.url));
  assert.equal(bytes.subarray(0, 4).toString(), "RIFF");
  assert.equal(bytes.subarray(8, 12).toString(), "WEBP");
  assert.ok(bytes.length < 500_000);
});
