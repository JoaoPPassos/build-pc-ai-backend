import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { ProductScraper } from "./scrapers/ProductScraper.js";
import { ScrapeProducts } from "./use-cases/ScrapeProducts.js";

const app = express();
const port = 3000;
const scraper = new ProductScraper();
// const repository = new ProductRepositor();
const scrapeUseCase = new ScrapeProducts(scraper, null);

app.use(express.json());

app.get("/api/scrape", async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;
    if (!url) {
      return res
        .status(400)
        .json({ error: "Missing url parameter (?url=...)" });
    }

    const products = await scrapeUseCase.execute(url);
    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;
