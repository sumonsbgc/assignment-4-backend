import { prisma } from "@lib/prisma";
import { seedCategories } from "@modules/category/category.seed";
import { seedMedicines } from "@modules/medicine/medicine.seed";
import { seedAdmins } from "@modules/user/admin.seed";
import { seedCustomers, seedSellers } from "@modules/user/user.seed";
import { deleteAllUsers } from "./modules/user/delete.seed.js";

async function main() {
	console.log("🌱 Starting database seeding...\n");
	try {
		// Delete existing data
		// await deleteAllUsers();
		// Seed admins
		await seedAdmins();
		// Seed customers
		await seedCustomers();
		// // Seed sellers
		await seedSellers();

		// // Seed categories
		await seedCategories();
		// // Seed medicines
		await seedMedicines();

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
