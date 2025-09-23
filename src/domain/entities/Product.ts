export class Product {
  constructor(
    public title: string,
    public price: number,
    public image: string,
    public code?: string,
    public href?: string,
    public createdAt?: Date
  ) {}
}