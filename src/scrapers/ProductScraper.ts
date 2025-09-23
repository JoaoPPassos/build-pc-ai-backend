import { BaseScraper } from "./BaseScraper";
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer-extra");
const scrapInfos = require("../utils/scrapInfos");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

export class ProductScraper extends BaseScraper {
  async parseKabumHtml(url: string) {
    try {
      puppeteer.use(StealthPlugin());
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url, { timeout: 0 });

      const productCard = await page.evaluate(() => {
        const productElements = document.querySelectorAll(".productCard"); // Ajuste o seletor conforme a estrutura da página
        const values: {
          title: string;
          price: string;
          image: string;
          code: string;
        }[] = [];
        productElements.forEach((el) => {
          const title = el.querySelector(".nameCard")?.innerHTML || "";
          const price = el.querySelector(".priceCard")?.innerHTML || "";
          const image =
            "https://kabum.com.br" +
              el.querySelector(".imageCard")?.getAttribute("src") || "";
          const code =
            el
              .querySelector(".productLink")
              ?.getAttribute("data-smarthintproductid") || "";
          values.push({ title, price, image, code });
        });

        return values;
      });

      const products: any[] = [];
      // Exemplo de scraping via Cheerio (depende da estrutura da página)

      await browser.close();
      return products;
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      return [];
    }
  }

  async parsePichauHtml(url: string) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url, {
        timeout: 0,
        headless: false,
        slowMo: 50,
        waitUntil: "networkidle2",
      });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
      );

      const productCards = await page.$$eval(
        'a[data-cy="list-product"]',
        (productElements: any) => {
          return Array.from(productElements).map((el: any) => {
            const title = el.querySelector("h2")?.textContent?.trim() || "";

            const price =
              el.querySelector('[class*="price_vista"]')?.textContent?.trim() ||
              "";

            const imageSrc = el.querySelector("img")?.getAttribute("src") || "";
            const image = imageSrc ? imageSrc : "";

            const href = el.href || "";

            return { title, price, image, href };
          });
        }
      );

      console.log(productCards);
      const products: any[] = [];
      // Exemplo de scraping via Cheerio (depende da estrutura da página)

      await browser.close();
      return products;
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      return [];
    }
  }
}
