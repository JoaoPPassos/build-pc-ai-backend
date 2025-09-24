import {Request, Response} from "express";
import { ScrapeProducts } from "../../application/use-cases/products/ScrapeProducts.js";
import { CreateProduct } from "../../application/use-cases/products/CreateProduct.js";

export class ProductController {
  constructor(
    private scrapeProducts: ScrapeProducts,
    private products: CreateProduct
  ) {}

  async handle(req: Request, res: Response) {
    try {
      const { url, source } = req.query;

      if (!url || !source) {
        return res.status(400).json({
          error:
            "Missing url or source parameter (?url=...&source=kabum|pichau)",
        });
      }

      const products = await this.scrapeProducts.execute(
        url as string,
        source as "kabum" | "pichau"
      );
      const createdProducts = await Promise.all(
        products.map((product) => this.products.execute(product))
      );
      res.json(createdProducts);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error internal server" });
    }
  }
}