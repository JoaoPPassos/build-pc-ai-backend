// app.ts
import express from "express";
import productRoutes from "./routes/productRoutes.js";
import deepseekRoutes from "./routes/deepseekRoutes.js";
import { connectDatabase } from "./config/database.js";
import { ScrapperScheduler } from "./infrastructure/schedulers/scrapperScheduler.js";
import http from "http";

import "dotenv/config";

const app = express();
const server = http.createServer(app);

connectDatabase();

app.use(express.json());
app.use("/api", productRoutes);
app.use("/api", deepseekRoutes);

server.listen(3000, () => console.log("🚀 Server running on port 3000"));
server.setTimeout(600000);

ScrapperScheduler.start();
export default app;
