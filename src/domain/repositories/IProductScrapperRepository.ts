import { Product } from "../entities/Product.js";

export interface IProductScrapperRepository {
  scrapeKabum(url: string): Promise<Product[]>;
  scrapePichau(url: string): Promise<Product[]>;
}
