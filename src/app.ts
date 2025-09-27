// app.ts
import express from "express";
import productRoutes from "./routes/productRoutes.js";
import deepseekRoutes from "./routes/deepseekRoutes.js";
import { connectDatabase } from "./config/database.js";
import { ScrapperScheduler } from "./infrastructure/schedulers/scrapperScheduler.js";
import http from "http";
import rateLimit from "express-rate-limit";

import "dotenv/config";
import { swaggerSpec, swaggerUi } from "./config/swagger.js";

const MINUTE = 60 * 1000;

const app = express();
const server = http.createServer(app);
const limiter = rateLimit({
  limit: 100,
  windowMs: 15 * MINUTE,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
connectDatabase();

app.use(limiter);
app.use(express.json());
app.use("/api", productRoutes);
app.use("/api", deepseekRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

server.listen(3000, () => console.log("🚀 Server running on port 3000"));
server.setTimeout(600000);

ScrapperScheduler.start();
export default app;
