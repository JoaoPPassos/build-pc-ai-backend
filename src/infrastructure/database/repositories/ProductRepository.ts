import { Product } from "../../../domain/entities/Product.js";
import { IProductRepository } from "../../../domain/repositories/IProductRepository.js";
import { MongoHelper } from "../mongodb/MongoHelper.js";

export class ProductRepository implements IProductRepository {
  async create(product: Omit<Product, "id">): Promise<Product> {
    const collection = MongoHelper.getCollection("products");
    const result = await collection?.insertOne(product);
    return {
      ...product,
      id: result.insertedId.toHexString(),
    };
  }

  async createOrUpdate(product: Omit<Product, "id">): Promise<Product> {
    if (!product.code) throw new Error("Product code is empty");
    const existingProduct = await this.findByCode(product.code);

    if (existingProduct) {
      return this.update({ ...product, id: existingProduct.id });
    }

    return this.create(product);
  }

  async findAll(): Promise<Product[]> {
    const collection = MongoHelper.getCollection("products");

    const products = await collection.find().toArray();
    return products.map((p) => ({
      title: p.title,
      price: p.price,
      imageUrl: p.imageUrl,
      code: p.code,
      productUrl: p.productUrl,
      source: p.source,
      id: p._id.toHexString(),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  async findByCode(code: string): Promise<Product | null> {
    const collection = MongoHelper.getCollection("products");

    const product = await collection.findOne({ code });
    if (!product) return null;
    return {
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      code: product.code,
      productUrl: product.productUrl,
      source: product.source,
      id: product._id.toHexString(),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async update(product: Product): Promise<Product> {
    const collection = MongoHelper.getCollection("products");

    await collection.updateOne(
      { code: product.code },
      {
        $set: {
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
          productUrl: product.productUrl,
          source: product.source,
          updatedAt: new Date(),
        },
      }
    );

    const updatedProduct = await collection.findOne({
      code: product.code,
    });
    if (!updatedProduct) throw new Error("Product not found after update");
    return {
      title: updatedProduct.title,
      price: updatedProduct.price,
      imageUrl: updatedProduct.imageUrl,
      code: updatedProduct.code,
      productUrl: updatedProduct.productUrl,
      source: updatedProduct.source,
      id: updatedProduct._id.toHexString(),
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt,
    };
  }

  async delete(code: string): Promise<void> {
    const collection = MongoHelper.getCollection("products");

    await collection.deleteOne({ code });
  }
}
