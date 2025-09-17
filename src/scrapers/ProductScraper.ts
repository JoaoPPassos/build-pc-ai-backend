import { BaseScraper } from "./BaseScraper";
import cheerio from "cheerio";
export class ProductScraper extends BaseScraper{
  parseHTML(html: string) {
    const $ = cheerio.load(html);
    const products: any = []
   }
}