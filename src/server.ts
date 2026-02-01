import app from "./app.js";
import { prisma } from "./lib/prisma.js";
const PORT = process.env.PORT || 5500;

const main = async () => {
	try {
		await prisma.$connect();
		app.listen(PORT, () => {
			console.log(`Server is running on http://localhost:${PORT}`);
		});
	} catch (error) {
		await prisma.$disconnect();
		console.log("Error during server initialization:", error);
		process.exit(1);
	}
};

main();
