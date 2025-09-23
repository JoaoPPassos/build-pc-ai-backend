import { ProductScraper } from "@/scrapers/ProductScraper";
// import { IProductRepository } from "@/repositories/IProductRepository";
// import { Product } from "@/entities/Product";

export class ScrapeProducts {
    constructor(
        private scraper: ProductScraper,
        private productRepository: any
    ) {}

    async execute(url: string): Promise<any[]> {
      
        const kabum = await this.scraper.parseKabumHtml(url);
        const pichau = await this.scraper.parsePichauHtml(url); // Substitua pelo método correto para Pichau
        // for (const product of products) {
        //     // await this.productRepository.save(product);
        // }

        return [];
    }
}
