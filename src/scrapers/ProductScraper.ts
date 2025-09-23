// scrapers/ProductScraper.ts
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { IProductRepository } from "../repositories/IProductRepository.js";
import { Product } from "../entities/Product.js";
import { stringToCurrencyString } from "../utils/formatString.js";

export class ProductScraper implements IProductRepository {
  async scrapeKabum(url: string): Promise<Product[]> {
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { timeout: 0 });

    const products = await page.evaluate(() => {
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

    await browser.close();

    return products.map(
      (p) =>
        new Product(
          p.title,
          stringToCurrencyString(p.price),
          p.image,
          p.code,
          p.href
        )
    );
  }

  async scrapePichau(url: string): Promise<Product[]> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { timeout: 0 });

    const products = await page.$$eval(
      'a[data-cy="list-product"]',
      (elements: any) =>
        Array.from(elements).map((el: any) => {
          const title = el.querySelector("h2")?.textContent?.trim() || "";
          const price =
            el.querySelector('[class*="price_vista"]')?.textContent?.trim() ||
            "";
          const imageSrc = el.querySelector("img")?.getAttribute("src") || "";
          const href = el.href || "";
          return { title, price, image: imageSrc, href };
        })
    );

    await browser.close();

    return products.map(
      (p) => new Product(p.title, p.price, p.image, "", p.href)
    );
  }
}
