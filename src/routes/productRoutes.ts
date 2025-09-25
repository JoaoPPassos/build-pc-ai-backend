import { Router } from "express";
import { ProductController } from "../controllers/ProductController.js";
import { ScrapeProducts } from "../application/use-cases/products/ScrapeProducts.js";
import { ProductScrapper } from "../infrastructure/scrappers/ProductScrapper.js";
import { CreateProduct } from "../application/use-cases/products/CreateProduct.js";
import { ProductRepository } from "../infrastructure/database/repositories/ProductRepository.js";

const router = Router();
const scraper = new ProductScrapper();
const productRepo = new ProductRepository();
const useCase = new ScrapeProducts(scraper);
const productUseCase = new CreateProduct(productRepo);
const controller = new ProductController(useCase, productUseCase);

router.get("/scrape", (req, res) => controller.handle(req, res));

export default router