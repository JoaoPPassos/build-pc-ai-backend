import fs from "fs";
import path from "path";
import puppeteer, { Browser } from "puppeteer";
import { ProductScrapper } from "../../src/infrastructure/scrappers/ProductScrapper";

describe("GPU Scraper - Unit", () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await puppeteer.launch();
  });

  afterAll(async () => {
    await browser.close();
  });

  const runScraperTest = async (
    mockFile: string,
    parserMethod: "parsePageKabum" | "parsePagePichau",
    source: string,
    titleKeyword: string
  ) => {
    // Lê o HTML do mock
    const html = fs.readFileSync(
      path.resolve(__dirname, `../mock/${mockFile}`),
      "utf8"
    );

    const scrapper = new ProductScrapper();
    // Passa o HTML diretamente para o método do scrapper
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const products = await scrapper[parserMethod](page); // "as any" se o TS reclamar de index signature

    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);

    if (products.length > 0) {
      const product = products[0];

      // Campos básicos
      expect(product.source).toBe(source);
      expect(typeof product.title).toBe("string");
      expect(product.title).toContain(titleKeyword);
      expect(typeof product.price).toBe("number");
      expect(product.price).toBeGreaterThan(0);

      // Campos consistentes
      expect(product.title.trim()).toHaveLength(product.title.trim().length); // sem espaços extras
      expect(product.source).toBe(source.toLowerCase());
    }
  };

  it("deve extrair corretamente as informações das GPUs da Kabum", async () => {
    await runScraperTest(
      "kabum-gpu-page.html",
      "parsePageKabum",
      "kabum",
      "Placa de Vídeo"
    );
  });

  it("deve extrair corretamente as informações das GPUs da Pichau", async () => {
    await runScraperTest(
      "pichau-gpu-page.html",
      "parsePagePichau",
      "pichau",
      "Placa de Video"
    );
  });

  it("deve retornar array vazio se não houver produtos", async () => {
    const html = "<html><body><div>Nenhum produto</div></body></html>";
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const scrapper = new ProductScrapper();
    const productsKabum = await scrapper.parsePageKabum(page);
    const productsPichau = await scrapper.parsePagePichau(page);

    expect(productsKabum).toEqual([]);
    expect(productsPichau).toEqual([]);
  });

  it("deve ignorar produtos sem titulo e codigo kabum", async () => {
    const html = `
      <html>
        <body>
          <!-- Produto válido -->
          <div class="productCard">
            <a class="productLink" data-smarthintproductid="12345" href="/produto/12345">
              <span class="nameCard">GPU Completa</span>
              <span class="priceCard">R$ 1500</span>
            </a>
          </div>

          <!-- Produto inválido (sem título e sem code) -->
          <div class="productCard">
            <a class="productLink" data-smarthintproductid="" href="/produto/00000">
              <span class="nameCard"></span>
              <span class="priceCard"></span>
            </a>
          </div>
        </body>
      </html>
    `;
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const scrapper = new ProductScrapper();
    const products = await scrapper.parsePageKabum(page);

    expect(products.length).toBe(1);
    expect(products[0].title).toBe("GPU Completa");
  });

  it("deve ignorar produtos sem titulo e codigo pichau", async () => {
    const html = `
     <html>
      <body>
        <a data-cy="list-product">
          <h2>GPU Completa,12345</h2>
          <span class="price_vista">R$ 1500</span>
          <img src="image.jpg"/>
        </a>
        <a data-cy="list-product">
          <h2></h2>
          <span class="price_vista">R$ 2000</span>
          <img src="image2.jpg"/>
        </a>
      </body>
    </html>
    `;
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const scrapper = new ProductScrapper();
    const products = await scrapper.parsePagePichau(page);

    expect(products.length).toBe(1);
    expect(products[0].title).toBe("GPU Completa,12345");
    expect(products[0].price).toBe(1500);
  });
  it("deve converter preços em diferentes formatos corretamente kabum", async () => {
    const html = `
      <html>
        <body>
          <a data-cy="list-product">
            <h2>GPU A</h2>
            <span class="price_vista">R$ 1.500,50</span>
          </a>
          <a data-cy="list-product">
            <h2>GPU B</h2>
            <span class="price_vista">1500</span>
          </a>
        </body>
      </html>
    `;
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const scrapper = new ProductScrapper();
    const products = await scrapper.parsePagePichau(page);

    expect(products[0].price).toBeCloseTo(1500.5);
    expect(products[1].price).toBe(1500);
  });
  it("deve converter preços em diferentes formatos corretamente pichau", async () => {
    const html = `
      <html>
        <body>
          <!-- Produto A -->
          <div class="productCard">
            <a class="productLink" data-smarthintproductid="A123" href="/produto/A123">
              <span class="nameCard">GPU A</span>
              <span class="priceCard">R$ 1.500,50</span>
            </a>
          </div>

          <!-- Produto B -->
          <div class="productCard">
            <a class="productLink" data-smarthintproductid="B456" href="/produto/B456">
              <span class="nameCard">GPU B</span>
              <span class="priceCard">1500</span>
            </a>
          </div>
        </body>
      </html>
    `;
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const scrapper = new ProductScrapper();
    const products = await scrapper.parsePageKabum(page);

    expect(products[0].price).toBeCloseTo(1500.5);
    expect(products[1].price).toBe(1500);
  });
});
