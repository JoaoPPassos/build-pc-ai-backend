import { IDeepSeek } from "../../../interfaces/IDeepSeek";

export class GenerateWithDeepSeek {
  constructor(private deepSeek: IDeepSeek) {}

  async execute(prompt: string): Promise<string> {
    return await this.deepSeek.generateText(prompt);
  }
}
