import { Product } from "../../../domain/entities/Product";
import { IProductRepository } from "../../../domain/repositories/IProductRepository";

export class FindProductByFilter {
  constructor(private productRepository: IProductRepository) {}
  async execute(items: string[]): Promise<{ [x: string]: Product[] }> {
    return await this.productRepository.findByProduct(items);
  }
}
