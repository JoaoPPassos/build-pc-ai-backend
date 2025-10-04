import {Request, Response} from "express";
import { ScrapeProducts } from "../application/use-cases/products/ScrapeProducts";
import { CreateProduct } from "../application/use-cases/products/CreateProduct";
import { FindProductByFilter } from "@/application/use-cases/products/FindProductByFilter";

export class ProductController {
  constructor(
    private scrapeProducts: ScrapeProducts,
    private products: CreateProduct,
    private findByFilter?: FindProductByFilter
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

  async filter(req: Request, res: Response) {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res
          .status(400)
          .json({ error: "Missing or invalid items parameter" });
      }

      const foundProducts = await this.findByFilter?.execute(items);

      res.json(foundProducts);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Error internal server" });
    }
  }
}