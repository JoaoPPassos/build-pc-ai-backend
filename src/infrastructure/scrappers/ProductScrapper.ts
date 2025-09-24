// scrapers/ProductScraper.ts
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { IProductScrapperRepository } from "../../domain/repositories/IProductScrapperRepository.js";
import { Product } from "../../domain/entities/Product.js";
import {
  stringToCurrencyNumber,
  stringToCurrencyString,
} from "../../utils/formatString.js";
import { get } from "http";

puppeteer.use(StealthPlugin());

export class ProductScrapper implements IProductScrapperRepository {
  async scrapeKabum(url: string): Promise<Product[]> {
    const products = [];
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { timeout: 0 });

    const getPages = await page.$$eval(".pagination", (uls: any) => {
      if (!uls.length) return null;

      const ul = uls[0]; // pega o primeiro UL encontrado
      const items = ul.querySelectorAll("li");

      if (items.length < 2) return null;

      const penultimo = items[items.length - 2]; // penúltimo LI
      return penultimo.textContent?.trim() || null;
    });
    for (let i = 1; i <= (getPages ? parseInt(getPages) : 0); i++) {
      const list = await page.evaluate(() => {
        const elements = document.querySelectorAll(".productCard");
        const values: {
          title: string;
          price: string;
          image: string;
          code: string;
          href: string;
        }[] = [];
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

          values.push({ title, price, image, code, href });
        });
        return values;
      });
      products.push(...list);
      const currentUrl = page.url();
      const finalUrl = `${currentUrl.split("?")[0]}?page_number=${
        i + 1
      }&page_size=100&facet_filters=&sort=most_searched`;
      await page.goto(finalUrl, { waitUntil: "networkidle0" });
    }

    await browser.close();

    return products.map(
      (p): Product => ({
        title: p.title,
        price: stringToCurrencyNumber(p.price),
        imageUrl: p.image,
        code: p.code,
        productUrl: p.href,
        historyPrice: [],
        source: "kabum",
      })
    );
  }

  async scrapePichau(url: string): Promise<Product[]> {
    const products = [];
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { timeout: 0 });
    const content = await page.content();

    if (content.includes("Site em Manutenção")) {
      throw new Error("Pichau está em manutenção ou bloqueando requests.");
    }

    const getPages = await page.$$eval(
      'nav[aria-label="pagination navigation"]',
      (uls: any) => {
        if (!uls.length) return null;

        const ul = uls[0]; // pega o primeiro UL encontrado
        const items = ul.querySelectorAll("li");

        if (items.length < 2) return null;

        const penultimo = items[items.length - 2]; // penúltimo LI
        return penultimo.textContent?.trim() || null;
      }
    );

    for (let i = 1; i <= (getPages ? parseInt(getPages) : 0); i++) {
      const list = await page.$$eval(
        'a[data-cy="list-product"]',
        (elements: any) =>
          Array.from(elements).map((el: any) => {
            const title = el.querySelector("h2")?.textContent?.trim() || "";
            const code = title.split(",").at(-1).trim();
            const price =
              el.querySelector('[class*="price_vista"]')?.textContent?.trim() ||
              "";
            const imageSrc = el.querySelector("img")?.getAttribute("src") || "";
            const href = el.href || "";
            return { title, price, image: imageSrc, code, href };
          })
      );
      products.push(...list);
      const currentUrl = page.url();
      const finalUrl = `${currentUrl.split("?")[0]}?page=${i + 1}`;
      await page.goto(finalUrl, { waitUntil: "networkidle0" });
    }

    await browser.close();

    return products.map((p) => ({
      title: p.title,
      price: stringToCurrencyNumber(p.price),
      code: p.code || "",
      imageUrl: p.image,
      productUrl: p.href,
      historyPrice: [],
      source: "pichau",
    }));
  }
}
