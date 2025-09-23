export class Product{
  constructor(
    public title: string,
    public price: string,
    public image: string,
    public code?: string,
    public href?: string
  ){}
}