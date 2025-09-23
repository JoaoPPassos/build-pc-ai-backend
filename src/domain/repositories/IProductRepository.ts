import { Product } from "../entities/Product.js";

export interface IProductRepository {
  scrapeKabum(url: string): Promise<Product[]>;
  scrapePichau(url: string): Promise<Product[]>;
}
