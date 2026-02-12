import "dotenv/config";
import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

const main = async () => {
	try {
		await prisma.$connect();
		console.log("Database connected successfully");
		app.listen(PORT, HOST, () => {
			console.log(`Server is running on http://${HOST}:${PORT}`);
		});
	} catch (error) {
		console.error("Error during server initialization:", error);
		await prisma.$disconnect();
		process.exit(1);
	}
};

main();
