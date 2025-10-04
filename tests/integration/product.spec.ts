import puppeteer from "puppeteer-extra";
import type { Browser, Page } from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { ProductScrapper } from "../../src/infrastructure/scrappers/ProductScrapper";

// Timeout maior para testes E2E, já que acessa a internet
jest.setTimeout(400000);
puppeteer.use(StealthPlugin());

describe("GPU Scraper - Integração", () => {
  let browser: Browser;
  let page: Page;
  const scrapper = new ProductScrapper();
  const kabumUrl =
    "https://www.kabum.com.br/hardware/placa-de-video-vga?page_number=1&page_size=100&facet_filters=&sort=most_searched";
  const pichauURL = "https://www.pichau.com.br/hardware/placa-de-video";

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  const runIntegrationTest = async (
    url: string,
    parserMethod: "parsePageKabum" | "parsePagePichau",
    source: string,
    titleKeyword: string
  ) => {
    await page.goto(url, { waitUntil: "networkidle2" });

    const products = await scrapper[parserMethod](page);

    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);

    const product = products[0];
    // Campos obrigatórios
    expect(product.source).toBe(source);
    expect(typeof product.title).toBe("string");
    expect(product.title).toContain(titleKeyword);
    expect(typeof product.price).toBe("number");
    expect(product.price).toBeGreaterThan(0);
    expect(product.code).toBeTruthy();

    // Campos opcionais
    expect(product.imageUrl).toBeDefined();
    expect(product.productUrl).toBeDefined();
    expect(Array.isArray(product.historyPrice)).toBe(true);
  };

  it("deve extrair GPUs reais da Kabum", async () => {
    await runIntegrationTest(
      kabumUrl,
      "parsePageKabum",
      "kabum",
      "Placa de Vídeo"
    );
  });

  it("deve extrair GPUs reais da Pichau", async () => {
    await runIntegrationTest(
      pichauURL,
      "parsePagePichau",
      "pichau",
      "Placa de Video"
    );
  });

  it("deve percorrer múltiplas páginas na Pichau", async () => {
    await page.goto(pichauURL, { waitUntil: "networkidle2" });

    const products = await scrapper.parsePagePichau(page);

    expect(products.length).toBeGreaterThan(20); // Exemplo: espera mais de 20 produtos se houver paginação
    const firstProduct = products[0];
    expect(firstProduct.code).toBeTruthy();
    expect(firstProduct.title).toContain("Placa de Video");
  });

  it("deve percorrer múltiplas páginas na Kabum", async () => {
    await page.goto(kabumUrl, { waitUntil: "networkidle2" });

    const products = await scrapper.parsePageKabum(page);

    expect(products.length).toBeGreaterThan(100); // Exemplo: espera mais de 20 produtos se houver paginação
    const firstProduct = products[0];
    expect(firstProduct.code).toBeTruthy();
    expect(firstProduct.title).toContain("Placa de Vídeo");
  });
});
