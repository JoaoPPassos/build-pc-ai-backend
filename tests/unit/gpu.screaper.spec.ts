import fs from 'fs'
import path from 'path'
import puppeteer from "puppeteer";
import {ProductScrapper} from  '../../src/infrastructure/scrappers/ProductScrapper'

describe('GPU Scraper - Unit',()=>{
  it('deve extrair corretamente as informações das GPUs da Kabum', async () =>{
    const html = fs.readFileSync(path.resolve(__dirname, "../mock/kabum-gpu-page.html"), "utf8");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const scrapper = new ProductScrapper();
  
    const products = await scrapper.parsePageKabum(page)
    
  
    console.log(products)
    expect(products).toBeDefined()
    expect(products[0].source).toBe('kabum')
    expect(products[0].title).toContain('Placa de Vídeo')
    expect(products[0].price).toBeGreaterThan(1000)
  })

  it('deve extrair corretamente as informações das GPUs da Pichau', async () =>{
    const html = fs.readFileSync(path.resolve(__dirname, "../mock/pichau-gpu-page.html"), "utf8");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const scrapper = new ProductScrapper();
    const products = await scrapper.parsePagePichau(page)
    
    await new Promise((res) => setTimeout(res, 100));

    expect(products).toBeDefined()
    expect(products[0].source).toBe('pichau')
    expect(products[0].title).toContain('Placa de Video')
    expect(products[0].price).toBeGreaterThan(1000)
  })
});