import axios from "axios";

export abstract class BaseScraper{
  async fetchHTML(url: string): Promise<string> {
    const {data} = await axios.get(url);
    return data
  }

  abstract parseHTML(html: string): any;
}