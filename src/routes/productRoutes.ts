import { Router } from "express";
import { ProductController } from "../controllers/ProductController.js";
import { ScrapeProducts } from "../use-cases/ScrapeProducts.js";
import { ProductScraper } from "../scrapers/ProductScraper.js";

const router = Router();
const scraper = new ProductScraper();
const useCase = new ScrapeProducts(scraper);
const controller =  new ProductController(useCase);

router.get("/scrape", (req, res) => controller.handle(req, res));

export default router