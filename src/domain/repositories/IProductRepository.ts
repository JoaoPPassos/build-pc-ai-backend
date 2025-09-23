import { Product } from "../entities/Product.js";

export interface IProductRepository {
  scrapeKabum(url: string): Promise<Product[]>;
  scrapePichau(url: string): Promise<Product[]>;
  create(product: Product): Promise<Product>;
  findAll(): Promise<Product[]>;
  findByCode(code: string): Promise<Product | null>;
  update(product: Product): Promise<Product>;
  delete(code: string): Promise<void>;
}
