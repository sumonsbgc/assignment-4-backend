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

const allowedOrigins = [
	process.env.FRONTEND_APP_URL || "http://localhost:4000",
	process.env.FRONTEND_APP_URL, // Production frontend URL
	"http://localhost:3000",
	"http://localhost:4000",
	"http://localhost:5000",
].filter(Boolean); // Remove undefined values

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (mobile apps, Postman, etc.)
			if (!origin) return callback(null, true);

			// Check if origin is in allowedOrigins or matches Vercel preview pattern
			const isAllowed =
				allowedOrigins.includes(origin) ||
				/^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) ||
				/^https:\/\/.*\.vercel\.app$/.test(origin); // Any Vercel deployment

			if (isAllowed) {
				callback(null, true);
			} else {
				callback(new Error(`Origin ${origin} not allowed by CORS`));
			}
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
		exposedHeaders: ["Set-Cookie"],
	}),
);

// app.use(
// 	cors({
// 		origin: process.env.FRONTEND_APP_URL || "http://localhost:3000",
// 		credentials: true,
// 	}),
// );

app.get("/", (req, res) => {
	res.send("Hello, World!");
});

app.all("/api/auth/*splat", toNodeHandler(auth));

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
