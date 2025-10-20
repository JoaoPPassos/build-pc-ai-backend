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
    const EXPRESSION = "50 * * * *";

    cron.schedule(EXPRESSION, async () => {
      console.log("Cronjob iniciado: scraping de produtos KABUM");
      const scraper = new ProductScrapper();
      const useCase = new ScrapeProducts(scraper);
      const productRepo = new ProductRepository();
      const products: Product[] = [];
      try {
        for (let category of kabumCategories) {
          const productList = await useCase.execute(
            `https://www.kabum.com.br/${category}?page_number=1&page_size=100&facet_filters=&sort=most_searched`,
            "kabum"
          );
          products.push(...productList);
          console.log(`Scraping da ${category} feito Kabum`);
        }
      } catch (error) {
        console.error("Erro ao raspar produtos da Kabum:", error);
      } finally {
        console.log("Iniciando criação e update de produtos Kabum");
        for (let product of products) {
          productRepo.createOrUpdate(product);
        }
        console.log("Criação e update de produtos finalizado Kabum");
      }
    });

    cron.schedule(EXPRESSION, async () => {
      console.log("Cronjob iniciado: scraping de produtos PICHAU");
      const scraper = new ProductScrapper();
      const useCase = new ScrapeProducts(scraper);
      const productRepo = new ProductRepository();
      const products: Product[] = [];
      try {
        for (let category of pichauCategories) {
          const productList = await useCase.execute(
            `https://www.pichau.com.br/${category}`,
            "pichau"
          );
          products.push(...productList);
          console.log(`Scraping da ${category} feito Pichau`);
        }
      } catch (error) {
        console.error("Erro ao raspar produtos da Pichau:", error);
      } finally {
        console.log("Iniciando criação e update de produtos Pichau");

        for (let product of products) {
          productRepo.createOrUpdate(product);
        }

        console.log("Criação e update de produtos finalizado Pichau");
      }
    });
  }
}