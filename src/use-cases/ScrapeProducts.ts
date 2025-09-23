import { IProductRepository } from "@/repositories/IProductRepository";
import { Product } from "@/entities/Product";

export class ScrapeProducts {
  constructor(private repo: IProductRepository) {}

  async execute(url: string, source: "kabum" | "pichau"): Promise<Product[]> {
    if (source === "kabum") {
      return this.repo.scrapeKabum(url);
    }
    if (source === "pichau") {
      return this.repo.scrapePichau(url);
    }
    throw new Error("Fonte inválida");
  }
}
