import cron from "node-cron";
import { ScrapeProducts } from "../../application/use-cases/products/ScrapeProducts.js";
import { ProductScrapper } from "../scrappers/ProductScrapper.js";
import { kabumCategories } from "../../utils/mapProductCategories.js";
import { ProductRepository } from "../database/repositories/ProductRepository.js";
import { Product } from "../../domain/entities/Product.js";

export class ScrapperScheduler {
  static start() {
    cron.schedule("51 * * * *", async () => {
      console.log("Cronjob iniciado: scraping de produtos");
      const scraper = new ProductScrapper();
      const useCase = new ScrapeProducts(scraper);
      const productRepo = new ProductRepository();
      const products:Product[] = [];
      try {
        for(let category of kabumCategories){
          const productList = await useCase.execute(`https://www.kabum.com.br/hardware/${category}`, "kabum")
          products.push(...productList)
          console.log(`Scraping da ${category} feito`)
        }

        for(let product of products){
          productRepo.createOrUpdate(product)
        }
      } catch (error) {
        console.error("Erro ao raspar produtos da Kabum:", error);
      }
      
      
    });
  }
}