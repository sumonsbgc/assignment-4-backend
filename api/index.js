import app from "../src/app.js";

// Vercel serverless function handler
export default function handler(req, res) {
	return app(req, res);
}
