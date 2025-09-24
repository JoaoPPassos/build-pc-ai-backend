import cron from "node-cron";
import { ScrapeProducts } from "../../application/use-cases/products/ScrapeProducts.js";
import { ProductScrapper } from "../scrappers/ProductScrapper.js";
import {
  kabumCategories,
  pichauCategories,
} from "../../utils/mapProductCategories.js";
import { ProductRepository } from "../database/repositories/ProductRepository.js";
import { Product } from "../../domain/entities/Product.js";

export class ScrapperScheduler {
  static start() {
    cron.schedule("46 * * * *", async () => {
      console.log("Cronjob iniciado: scraping de produtos");
      const scraper = new ProductScrapper();
      const useCase = new ScrapeProducts(scraper);
      const productRepo = new ProductRepository();
      const products: Product[] = [];
      try {
        for (let category of kabumCategories) {
          const productList = await useCase.execute(
            `https://www.kabum.com.br/hardware/${category}?page_number=1&page_size=100&facet_filters=&sort=most_searched`,
            "kabum"
          );
          products.push(...productList);
          console.log(`Scraping da ${category} feito Kabum`);
        }
      } catch (error) {
        console.error("Erro ao raspar produtos da Kabum:", error);
      } finally {
        for (let product of products) {
          productRepo.createOrUpdate(product);
        }
      }
    });

    cron.schedule("16 * * * *", async () => {
      console.log("Cronjob iniciado: scraping de produtos");
      const scraper = new ProductScrapper();
      const useCase = new ScrapeProducts(scraper);
      const productRepo = new ProductRepository();
      const products: Product[] = [];
      try {
        for (let category of pichauCategories) {
          const productList = await useCase.execute(
            `https://www.pichau.com.br/hardware/${category}`,
            "pichau"
          );
          products.push(...productList);
          console.log(`Scraping da ${category} feito Pichau`);
        }
      } catch (error) {
        console.error("Erro ao raspar produtos da Pichau:", error);
      } finally {
        for (let product of products) {
          productRepo.createOrUpdate(product);
        }
      }
    });
  }
}