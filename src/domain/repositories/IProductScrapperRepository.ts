import { Page } from "puppeteer-core";
import { Product } from "../entities/Product";

export interface IProductScrapperRepository {
  scrapeKabum(url: string): Promise<Product[]>;
  scrapePichau(url: string): Promise<Product[]>;
  parsePageKabum(page: Page): Promise<Product[]>;
}
