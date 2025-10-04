import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { ScrapeProducts } from "../application/use-cases/products/ScrapeProducts";
import { ProductScrapper } from "../infrastructure/scrappers/ProductScrapper";
import { CreateProduct } from "../application/use-cases/products/CreateProduct";
import { ProductRepository } from "../infrastructure/database/repositories/ProductRepository";
import { FindProductByFilter } from "../application/use-cases/products/FindProductByFilter";

const router = Router();
const scraper = new ProductScrapper();
const productRepo = new ProductRepository();
const useCase = new ScrapeProducts(scraper);
const createProductUseCase = new CreateProduct(productRepo);
const filterProductUseCase = new FindProductByFilter(productRepo);
const controller = new ProductController(
  useCase,
  createProductUseCase,
  filterProductUseCase
);

/**
 * @swagger
 * /scrape:
 *   get:
 *     summary: Scrape products from a given URL and source
 *     tags:
 *       - Scraper
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *           format: uri
 *         description: The URL to scrape products from (encoded)
 *       - in: query
 *         name: source
 *         required: true
 *         schema:
 *           type: string
 *         description: The source identifier, e.g., "kabum"
 *     responses:
 *       200:
 *         description: List of products scraped from the given URL
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The unique ID of the product
 *                   title:
 *                     type: string
 *                     description: The product title
 *                   price:
 *                     type: number
 *                     format: float
 *                     description: The current price of the product
 *                   imageUrl:
 *                     type: string
 *                     format: uri
 *                     description: URL of the product image
 *                   code:
 *                     type: string
 *                     description: Product code
 *                   productUrl:
 *                     type: string
 *                     format: uri
 *                     description: URL of the product page
 *                   historyPrice:
 *                     type: array
 *                     description: Price history of the product
 *                     items:
 *                       type: number
 *                       format: float
 *                   source:
 *                     type: string
 *                     description: Source of the product
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Timestamp of the last update
 *             example:
 *               - _id: "68d6b0c2fac17aeb5903f879"
 *                 title: "Placa de Vídeo XFX Swift RX 9070 XT TRIPLE FAN GAMING EDITION WITH AMD…"
 *                 price: 5149.99
 *                 imageUrl: "https://www.kabum.com.br/_next/image?url=https://images.kabum.co…"
 *                 code: "725947"
 *                 productUrl: "https://www.kabum.com.br/produto/725947/placa-de-video-xfx-swift-rx-90…"
 *                 historyPrice: [5099.99, 5199.99, 5149.99, 5120.0]
 *                 source: "kabum"
 *                 updatedAt: "2025-09-26T18:23:29.917Z"
 */
router.get("/scrape", (req, res) => controller.handle(req, res));

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Get filtered products by list of item names
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 description: List of product names to search
 *                 items:
 *                   type: string
 *             example:
 *               items:
 *                 - "Processador AMD Ryzen 5 5600G"
 *                 - "Placa Mãe B450M"
 *                 - "Memória DDR4 8GB 3200MHz"
 *                 - "SSD 480GB SATA"
 *                 - "Fonte 500W 80 Plus Bronze"
 *                 - "Gabinete Mid Tower Simples"
 *                 - "Monitor 19.5 LED HD"
 *     responses:
 *       200:
 *         description: Filtered products grouped by item name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       description: Product title
 *                     price:
 *                       type: number
 *                       format: float
 *                       description: Product price
 *                     imageUrl:
 *                       type: string
 *                       format: uri
 *                       description: URL of the product image
 *                     code:
 *                       type: string
 *                       description: Product code
 *                     productUrl:
 *                       type: string
 *                       format: uri
 *                       description: URL of the product page
 *                     source:
 *                       type: string
 *                       description: Source of the product
 *                     historyPrice:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           price:
 *                             type: number
 *                             format: float
 *                             description: Historical price
 *                           date:
 *                             type: string
 *                             format: date-time
 *                             description: Date of the historical price
 *                     id:
 *                       type: string
 *                       description: Unique product ID
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Last update timestamp
 *             example:
 *               Processador_AMD_Ryzen_5_5600G:
 *                 - title: "Processador AMD Ryzen 5 5600GT, 4.6GHz, Cache 19MB, AM4, 6 núcleos, 12 threads, Placa de Vídeo, Com Cooler - 100-100001488"
 *                   price: 769
 *                   imageUrl: "https://www.kabum.com.br/_next/image?url=https://images.kabum.com.br/produtos/fotos/sync_mirakl/523518/medium/Processador-AMD-Ryzen-5-5600GT-4-6GHz-Cache-19MB-AM4-6-n-cleos-12-threads-Placa-de-V-deo-Com-Cooler-100-100001488_1758658791.jpg&w=384&q=75"
 *                   code: "523518"
 *                   productUrl: "https://www.kabum.com.br/produto/523518/processador-amd-ryzen-5-5600gt-4-6ghz-cache-19mb-am4-6-nucleos-12-threads-placa-de-video-com-cooler-100-100001488"
 *                   source: "kabum"
 *                   historyPrice:
 *                     - price: 769
 *                       date: "2025-09-26T15:27:22.847Z"
 *                   id: "68d6b0dafac17aeb59040355"
 *                   updatedAt: "2025-09-26T18:23:48.915Z"
 *               Placa_Mãe_B450M:
 *                 - title: "Placa-Mãe ASRock B450M-HDV R4.0, AMD AM4, Micro ATX, DDR4, Preto - 90-MXB9N0-A0UAYZ"
 *                   price: 399.99
 *                   imageUrl: "https://www.kabum.com.br/_next/image?url=https://images.kabum.com.br/produtos/fotos/111107/placa-mae-asrock-b450m-hdv-r4-0-amd-am4-micro-atx-ddr4-_1590689801_m.jpg&w=384&q=75"
 *                   code: "111107"
 *                   productUrl: "https://www.kabum.com.br/produto/111107/placa-mae-asrock-b450m-hdv-r4-0-amd-am4-micro-atx-ddr4-preto-90-mxb9n0-a0uayz"
 *                   source: "kabum"
 *                   historyPrice:
 *                     - price: 399.99
 *                       date: "2025-09-26T15:27:03.807Z"
 *                   id: "68d6b0c7fac17aeb5903faa0"
 *                   updatedAt: "2025-09-26T18:23:33.927Z"
 */
router.post("/products", (req, res) => controller.filter(req, res));
export default router