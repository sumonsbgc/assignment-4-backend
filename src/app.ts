import express from "express";
import { Application } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import categoryRoutes from "./modules/category/category.routes";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.get("/", (req, res) => {
	res.send("Hello, World!");
});

app.all("/api/auth/{*any}", toNodeHandler(auth));

// API Routes
app.use("/api/categories", categoryRoutes);

export default app;
