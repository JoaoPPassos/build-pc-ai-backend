import { Product } from "../entities/Product.js";

export interface IProductRepository {
  create(product: Product): Promise<Product>;
  findAll(): Promise<Product[]>;
  findByCode(code: string): Promise<Product | null>;
  update(product: Product): Promise<Product>;
  delete(code: string): Promise<void>;
}
