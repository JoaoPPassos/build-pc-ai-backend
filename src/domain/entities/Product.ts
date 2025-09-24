export interface Product {
  id?: string;
  title: string;
  code?: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  source: "kabum" | "pichau";
  createdAt?: Date;
  updatedAt?: Date;
}
