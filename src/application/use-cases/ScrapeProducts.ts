import { Product } from "../../domain/entities/Product";
import { IProductScrapperRepository } from "../../domain/repositories/IProductScrapperRepository";

export class ScrapeProducts {
  constructor(private scrapper: IProductScrapperRepository) {}

  async execute(url: string, source: "kabum" | "pichau"): Promise<Product[]> {
    if (source === "kabum") {
      return this.scrapper.scrapeKabum(url);
    }
    if (source === "pichau") {
      return this.scrapper.scrapePichau(url);
    }
    throw new Error("Fonte inválida");
  }
}
