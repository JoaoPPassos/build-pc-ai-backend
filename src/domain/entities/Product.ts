export interface Product {
  id?: string;
  title: string;
  code?: string;
  price: number | null;
  imageUrl: string;
  productUrl: string;
  source: "kabum" | "pichau";
  historyPrice: { price: number; date: Date }[];
  createdAt?: Date;
  updatedAt?: Date;
}
