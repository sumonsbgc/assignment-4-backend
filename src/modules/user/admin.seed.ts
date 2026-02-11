import { auth } from "@/lib/auth";
import { prisma } from "@lib/prisma";

const adminData = [
	{
		id: crypto.randomUUID(),
		name: "Mohammad Sumon",
		email: "sumonsbgc@gmail.com",
		password: "Sumon@974410",
		role: "ADMIN",
		phone: "+1555000001",
		emailVerified: true,
		status: "ACTIVE",
		image:
			"https://ui-avatars.com/api/?name=Mohammad+Sumon&background=4F46E5&color=fff",
	},
];

export async function seedAdmins() {
	console.log("📝 Seeding admins...");

	for (const admin of adminData) {
		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email: admin.email },
		});

		if (existingUser) {
			console.log(`   ⏭️  Admin ${admin.email} already exists`);
			continue;
		}

		// Use better-auth to create user
		await auth.api.signUpEmail({
			body: {
				email: admin.email,
				password: admin.password,
				name: admin.name,
				role: admin.role,
				phone: admin.phone,
				status: admin.status,
				image: admin.image,
			},
		});

		// Update emailVerified (admins are pre-verified)
		await prisma.user.update({
			where: { email: admin.email },
			data: { emailVerified: true },
		});
	}

	console.log(`✅ Seeded ${adminData.length} admins`);
	console.log("\n📋 Admin Credentials:");
	adminData.forEach((admin) => {
		console.log(`   Email: ${admin.email} | Password: ${admin.password}`);
	});
}

export { adminData };
