import express from "express";
import cors from "cors";
import categoryRoutes from "./modules/category/category.routes";
import medicineRoutes from "./modules/medicine/medicine.routes";
import userRoutes from "./modules/user/user.routes";
import cartRoutes from "./modules/cart/cart.routes";
import orderRoutes from "./modules/order/order.routes";
import reviewRoutes from "./modules/review/review.routes";

import { Application } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: process.env.FRONTEND_APP_URL || "http://localhost:3000",
		credentials: true,
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
