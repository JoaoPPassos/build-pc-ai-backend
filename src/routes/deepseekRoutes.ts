import { Router } from "express";
import { DeepSeekService } from "../infrastructure/services/DeepSeekService.js";
import { GenerateWithDeepSeek } from "../application/use-cases/deepseek/GenerateWithDeepSeek.js";

const router = Router();
const deepSeekService = new DeepSeekService();
const generateWithDeepSeek = new GenerateWithDeepSeek(deepSeekService);

/**
 * @swagger
 * /deepseek:
 *   post:
 *     summary: Generate PC configurations with DeepSeek
 *     tags:
 *       - DeepSeek
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The input text prompt to generate a configuration
 *             example:
 *               prompt: "quero montar um pc, gostaria que vc me fizesse algumas perguntas rapidas para poder saber aconfiguração ideal do meu PC 1- jogo e programação 2- até 3k 3- nãome importo com muita qualidade 4- monitor simples 5- nenhuma 6- o suficiente para por alguns jogos 7- normal 8- não penso em upgrades"
 *     responses:
 *       200:
 *         description: Generated configurations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: object
 *                   properties:
 *                     configuracoes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           nome:
 *                             type: string
 *                             description: Name of the configuration
 *                           descricao:
 *                             type: string
 *                             description: Description of the configuration
 *                           componentes:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 nome:
 *                                   type: string
 *                                   description: Component name
 *                                 nome_acento:
 *                                   type: string
 *                                   description: Component name with accents
 *                                 quantidade:
 *                                   type: integer
 *                                   description: Quantity of this component
 *                                 explicacao:
 *                                   type: string
 *                                   description: Explanation of why this component was chosen
 *               example:
 *                 result:
 *                   configuracoes:
 *                     - nome: "Orçamento Básico para Jogos e Programação"
 *                       descricao: "Configuração focada em custo-benefício, com processador com gráfico integrado para atender jogos leves e programação dentro do orçamento."
 *                       componentes:
 *                         - nome: "Processador AMD Ryzen 5 5600G"
 *                           nome_acento: "Processador AMD Ryzen 5 5600G"
 *                           quantidade: 1
 *                           explicacao: "Excelente custo-benefício, com gráfico integrado Vega 7 capaz de rodar jogos leves e ideal para programação."
 *                         - nome: "Placa Mae B450M"
 *                           nome_acento: "Placa Mãe B450M"
 *                           quantidade: 1
 *                           explicacao: "Compatível com o processador, possui conectividade básica e suporte a upgrades futuros limitados."
 */
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