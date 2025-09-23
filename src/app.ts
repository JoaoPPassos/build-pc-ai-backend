// app.ts
import express from "express";
import productRoutes from "./interfaces/routes/productRoutes.js";

const app = express();
app.use(express.json());

app.use("/api", productRoutes);

app.listen(3000, () => console.log("🚀 Server running on port 3000"));
export default app;
