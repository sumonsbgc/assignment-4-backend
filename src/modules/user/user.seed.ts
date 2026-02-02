import { auth } from "@/lib/auth";
import { prisma } from "@lib/prisma";

const customerData = [
	{
		id: crypto.randomUUID(),
		name: "John Doe",
		email: "john.customer@example.com",
		password: "Customer@123",
		role: "CUSTOMER",
		phone: "+1234567890",
		emailVerified: true,
		status: "ACTIVE",
	},
	{
		id: crypto.randomUUID(),
		name: "Sarah Johnson",
		email: "sarah.customer@example.com",
		password: "Customer@123",
		role: "CUSTOMER",
		phone: "+1234567891",
		emailVerified: true,
		status: "ACTIVE",
	},
	{
		id: crypto.randomUUID(),
		name: "Michael Brown",
		email: "michael.customer@example.com",
		password: "Customer@123",
		role: "CUSTOMER",
		phone: "+1234567892",
		emailVerified: true,
		status: "ACTIVE",
	},
	{
		id: crypto.randomUUID(),
		name: "Emily Davis",
		email: "emily.customer@example.com",
		password: "Customer@123",
		role: "CUSTOMER",
		phone: "+1234567893",
		emailVerified: true,
		status: "ACTIVE",
	},
	{
		id: crypto.randomUUID(),
		name: "David Wilson",
		email: "david.customer@example.com",
		password: "Customer@123",
		role: "CUSTOMER",
		phone: "+1234567894",
		emailVerified: false,
		status: "ACTIVE",
	},
];

const sellerData = [
	{
		id: crypto.randomUUID(),
		name: "HealthPlus Pharmacy",
		email: "healthplus@pharmacy.com",
		password: "Seller@123",
		role: "SELLER",
		phone: "+1987654321",
		emailVerified: true,
		status: "ACTIVE",
	},
	{
		id: crypto.randomUUID(),
		name: "MediCare Solutions",
		email: "medicare@solutions.com",
		password: "Seller@123",
		role: "SELLER",
		phone: "+1987654322",
		emailVerified: true,
		status: "ACTIVE",
	},
	{
		id: crypto.randomUUID(),
		name: "PharmaWorld",
		email: "contact@pharmaworld.com",
		password: "Seller@123",
		role: "SELLER",
		phone: "+1987654323",
		emailVerified: true,
		status: "ACTIVE",
	},
	{
		id: crypto.randomUUID(),
		name: "QuickMeds Store",
		email: "quickmeds@store.com",
		password: "Seller@123",
		role: "SELLER",
		phone: "+1987654324",
		emailVerified: true,
		status: "ACTIVE",
	},
	{
		id: crypto.randomUUID(),
		name: "Global Pharma",
		email: "global@pharma.com",
		password: "Seller@123",
		role: "SELLER",
		phone: "+1987654325",
		emailVerified: true,
		status: "ACTIVE",
	},
];

export async function seedCustomers() {
	console.log("📝 Seeding customers...");

	for (const customer of customerData) {
		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email: customer.email },
		});

		if (existingUser) {
			console.log(`   ⏭️  Customer ${customer.email} already exists`);
			continue;
		}

		// Use better-auth to create user
		await auth.api.signUpEmail({
			body: {
				email: customer.email,
				password: customer.password,
				name: customer.name,
				role: customer.role,
				phone: customer.phone,
				status: customer.status,
			},
		});

		// Update emailVerified if needed
		if (customer.emailVerified) {
			await prisma.user.update({
				where: { email: customer.email },
				data: { emailVerified: true },
			});
		}
	}

	console.log(`✅ Seeded ${customerData.length} customers`);
}

export async function seedSellers() {
	console.log("📝 Seeding sellers...");

	for (const seller of sellerData) {
		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email: seller.email },
		});

		if (existingUser) {
			console.log(`   ⏭️  Seller ${seller.email} already exists`);
			continue;
		}

		// Use better-auth to create user
		await auth.api.signUpEmail({
			body: {
				email: seller.email,
				password: seller.password,
				name: seller.name,
				role: seller.role,
				phone: seller.phone,
				status: seller.status,
			},
		});

		// Update emailVerified if needed
		if (seller.emailVerified) {
			await prisma.user.update({
				where: { email: seller.email },
				data: { emailVerified: true },
			});
		}
	}

	console.log(`✅ Seeded ${sellerData.length} sellers`);
}

export { customerData, sellerData };
