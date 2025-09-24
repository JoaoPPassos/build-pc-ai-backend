import { kabumCategories } from "../../../utils/mapProductCategories.js";
import { Product } from "../../../domain/entities/Product.js";
import { IProductScrapperRepository } from "../../../domain/repositories/IProductScrapperRepository.js";

export class ScrapeProducts {
  constructor(private scrapper: IProductScrapperRepository) {}

  async execute(url: string, source: "kabum" | "pichau"): Promise<Product[]> {
    if (source === "kabum") {
      const values = [];

      const products = await this.scrapper.scrapeKabum(`${url}`);
      values.push(...products);

      return values;
    }
    if (source === "pichau") {
      return this.scrapper.scrapePichau(url);
    }
    throw new Error("Fonte inválida");
  }
}
