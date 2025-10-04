import { Product } from "../entities/Product.js";

export interface IProductRepository {
  create(product: Product): Promise<Product>;
  createOrUpdate(product: Omit<Product, "id">): Promise<Product>;
  findAll(): Promise<Product[]>;
  findByProduct(items: string[]): Promise<{ [x: string]: Product[] }>;
  findByCode(code: string): Promise<Product | null>;
  update(product: Product): Promise<Product>;
  delete(code: string): Promise<void>;
}
