import { Product } from "../../../domain/entities/Product.js";
import { IProductRepository } from "../../../domain/repositories/IProductRepository.js";

export class FindProductByFilter {
  constructor(private productRepository: IProductRepository) {}
  async execute(items: string[]): Promise<{ [x: string]: Product[] }> {
    return await this.productRepository.findByProduct(items);
  }
}