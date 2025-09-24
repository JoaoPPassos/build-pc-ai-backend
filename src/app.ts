// app.ts
import express from "express";
import productRoutes from "./interfaces/routes/productRoutes.js";
import { connectDatabase } from "./config/database.js";
import "dotenv/config";

const app = express();
connectDatabase();

app.use(express.json());
app.use("/api", productRoutes);

app.listen(3000, () => console.log("🚀 Server running on port 3000"));
export default app;
