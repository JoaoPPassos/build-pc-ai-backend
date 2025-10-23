// scrapers/ProductScraper.ts
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Page } from "puppeteer-core";
import { IProductScrapperRepository } from "../../domain/repositories/IProductScrapperRepository.js";
import { Product } from "../../domain/entities/Product.js";
import { stringToCurrencyNumber } from "../../utils/formatString.js";
import puppeteerCore from "puppeteer-core";

puppeteer.use(StealthPlugin());

export class ProductScrapper implements IProductScrapperRepository {
  async scrapeKabum(url: string): Promise<Product[]> {
    let products: Product[] = [];
    const browser = await puppeteer.launch({
      executablePath: "/usr/bin/chromium-browser",
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { timeout: 0 });
    products = await this.parsePageKabum(page);

    await browser.close();
    return products;
  }

  async scrapePichau(url: string): Promise<Product[]> {
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const proxyUser = "brd-customer-hl_de13e1ad-zone-build_pc_ai_proxy";
    const proxyPass = "hw9j5sqwbv0g";

    const browser = await puppeteerCore.connect({
      browserWSEndpoint: `wss://brd-customer-hl_de13e1ad-zone-scraping_build_api:f20eh8bt090g@brd.superproxy.io:9222`,
    });

    const page = await browser.newPage();

    await page.authenticate({ username: proxyUser, password: proxyPass });

    console.log(`🧭 Acessando: ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // aguarda JavaScript do Cloudflare
    await delay(5000);

    // tenta detectar bloqueio
    const html = await page.content();

    if (
      html.includes("Site em Manutenção") ||
      html.includes("Access denied") ||
      html.includes("Cloudflare") ||
      html.includes("Verificando o seu navegador")
    ) {
      await browser.close();
      throw new Error(
        "Pichau está bloqueando requests ou retornando challenge Cloudflare."
      );
    }

    const products = await this.parsePagePichau(page);

    await browser.close();
    return products;
  }
  async parsePageKabum(page: Page): Promise<Product[]> {
    const products: any[] = [];

    const getPages =
      (await page.$$eval(".pagination", (uls: any) => {
        if (!uls.length) return null;
        const ul = uls[0]; // pega o primeiro UL encontrado
        const items = ul.querySelectorAll("li");

        if (items.length < 2) return null;

        const penultimo = items[items.length - 2]; // penúltimo LI
        return penultimo.textContent?.trim() || null;
      })) || 1;

    for (let i = 1; i <= (getPages ? parseInt(getPages) : 0); i++) {
      const list = await page.evaluate(() => {
        const elements = document.querySelectorAll(".productCard");

        const values: any[] = [];
        elements.forEach((el) => {
          const title = el.querySelector(".nameCard")?.innerHTML || "";
          const price = el.querySelector(".priceCard")?.innerHTML || "";
          const image =
            el
              .querySelector(".productLink")
              ?.querySelector("img")
              ?.getAttribute("src") || "";
          const code =
            el
              .querySelector(".productLink")
              ?.getAttribute("data-smarthintproductid") || "";
          const href = el.querySelector("a")?.href || "";
          if (title && code)
            values.push({
              title,
              price,
              imageUrl: image,
              code,
              productUrl: href,
              source: "kabum",
              historyPrice: [],
            });
        });
        return values;
      });
      products.push(...list);
      const currentUrl = page.url();
      if (i + 1 <= getPages) {
        const finalUrl = `${currentUrl.split("?")[0]}?page_number=${
          i + 1
        }&page_size=100&facet_filters=&sort=most_searched`;

        await page.goto(finalUrl, {
          waitUntil: "networkidle0",
        });
      }
    }

    return products.map((prod) => ({
      ...prod,
      price: stringToCurrencyNumber(prod.price ?? ""),
    })) as Product[];
  }

  async parsePagePichau(page: Page): Promise<Product[]> {
    const products: Product[] = [];

    // 🔹 Obtém número total de páginas
    const totalPages =
      (await page.$$eval(
        'nav[aria-label="pagination navigation"]',
        (uls: any) => {
          if (!uls.length) return 1;
          const ul = uls[0];
          const items = ul.querySelectorAll("li");
          if (items.length < 2) return 1;
          const penultimo = items[items.length - 2];
          const num = parseInt(penultimo.textContent?.trim() || "1", 10);
          return isNaN(num) ? 1 : num;
        }
      )) || 1;

    console.log(`📄 Total de páginas detectadas: ${totalPages}`);

    // 🔹 Loop nas páginas
    for (let i = 1; i <= totalPages; i++) {
      const url = `${page.url().split("?")[0]}?page=${i}`;
      console.log(`🧭 Acessando página ${i}/${totalPages}: ${url}`);

      try {
        const response = await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        });

        if (!response || !response.ok()) {
          console.warn(`⚠️ Página ${i} retornou status: ${response?.status()}`);
          continue;
        }

        // 🔹 Detecção de bloqueio Cloudflare
        const html = await page.content();
        if (/cloudflare|captcha/i.test(html)) {
          console.error(
            "🛑 Bloqueio Cloudflare detectado. Interrompendo raspagem."
          );
          break;
        }

        // 🔹 Scroll para garantir carregamento lazy
        await page.evaluate(async () => {
          await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 600;
            const timer = setInterval(() => {
              window.scrollBy(0, distance);
              totalHeight += distance;
              if (totalHeight >= document.body.scrollHeight) {
                clearInterval(timer);
                resolve(true);
              }
            }, 300);
          });
        });

        // 🔹 Extrai produtos
        const list: Product[] = await page.$$eval(
          'a[data-cy="list-product"]',
          (elements: any) =>
            Array.from(elements)
              .map((el: any) => {
                const title = el.querySelector("h2")?.textContent?.trim() || "";
                const code = title.split(",").at(-1)?.trim() || "";
                const price =
                  el
                    .querySelector('[class*="price_vista"]')
                    ?.textContent?.trim() || "";
                const imageSrc =
                  el.querySelector("img")?.getAttribute("src") || "";
                const href = el.href || "";
                return {
                  title,
                  price,
                  imageUrl: imageSrc,
                  code,
                  productUrl: href,
                  source: "pichau" as const,
                  historyPrice: [],
                };
              })
              .filter((e) => e.title && e.code)
        );

        console.log(`✅ Página ${i}: ${list.length} produtos encontrados`);
        products.push(...list);

        // 🔹 Delay aleatório entre páginas (para parecer humano)
        await new Promise((r) => setTimeout(r, 1500 + Math.random() * 2000));
      } catch (err: any) {
        console.error(`❌ Erro na página ${i}: ${err.message}`);
        continue;
      }
    }

    console.log(`🏁 Total raspado da Pichau: ${products.length} produtos.`);
    return products;
  }
}
