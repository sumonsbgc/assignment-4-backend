import express from "express";
import cors from "cors";
import categoryRoutes from "./modules/category/category.routes.js";
import medicineRoutes from "./modules/medicine/medicine.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import reviewRoutes from "./modules/review/review.routes.js";

import { Application } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
	cors({
		origin: [
			process.env.FRONTEND_APP_URL || "http://localhost:3000",
			"http://localhost:3000",
			"http://localhost:3001",
		],
		credentials: true,
		// methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
		exposedHeaders: ["Set-Cookie"],
	}),
);

app.get("/", (req, res) => {
	res.send("Hello, World!");
});

app.all("/api/auth/{*any}", toNodeHandler(auth));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", orderRoutes);

// Error Handler
app.use(
	(
		err: any,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction,
	) => {
		console.error(err);
		res.status(err.status || 500).json({
			success: false,
			message: err.message || "Something went wrong",
		});
	},
);

export default app;
