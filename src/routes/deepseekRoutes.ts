import { Router } from "express";
import { DeepSeekService } from "../infrastructure/services/DeepSeekService.js";
import { GenerateWithDeepSeek } from "../application/use-cases/deepseek/GenerateWithDeepSeek.js";

const router = Router();
const deepSeekService = new DeepSeekService();
const generateWithDeepSeek = new GenerateWithDeepSeek(deepSeekService);

router.post("/deepseek", async (req, res) => {
  try {
      const { prompt } = req.body;
      const result = await generateWithDeepSeek.execute(prompt);
      res.json({ result });
  } catch (error) {
      console.error("Error generating text with DeepSeek:", error);
      res.status(500).json({ error: "Erro ao chamar DeepSeek" });
  }
})

export default router