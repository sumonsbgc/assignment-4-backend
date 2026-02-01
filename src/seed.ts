import { prisma } from "@lib/prisma";
import { seedCategories } from "@modules/category/category.seed";

async function main() {
	console.log("🌱 Starting database seeding...\n");
	try {
		// Seed categories
		await seedCategories();

		console.log("\n🎉 Database seeding completed successfully!");
	} catch (error) {
		console.error("❌ Error during seeding:", error);
		throw error;
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
