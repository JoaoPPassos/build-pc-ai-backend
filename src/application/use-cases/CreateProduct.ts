import { Product } from "../../domain/entities/Product";
import { IProductRepository } from "../../domain/repositories/IProductRepository";

export class CreateProduct {
  constructor(private productRepo: IProductRepository){

  }

  async execute(input: Omit<Product, "id"| "createdAt"| "updatedAt">): Promise<Product>{
    const product:Product = {
      ...input,
      createdAt: new Date(),
    }
    return await this.productRepo.create(product);
  }
}