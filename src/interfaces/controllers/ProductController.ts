import {Request, Response} from "express";
import { ScrapeProducts } from "../../application/use-cases/ScrapeProducts.js";

export class ProductController{
  constructor(private scrapeProducts: ScrapeProducts){}

  async handle(req:Request, res:Response){
    try {
      const {url,source} = req.query;

      if(!url || !source){
        return res.status(400).json({error: "Missing url or source parameter (?url=...&source=kabum|pichau)"});
      }

      const products = await this.scrapeProducts.execute(url as string, source as "kabum" | "pichau");
      res.json(products);
    } catch (error) {
      res.status(500).json({error: "Error internal server"});
    }
  }
}