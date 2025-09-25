export interface IDeepSeek{
  generateText(prompt:string): Promise<string>;
}