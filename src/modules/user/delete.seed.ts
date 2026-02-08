import { prisma } from "@lib/prisma";

export async function deleteAllUsers() {
	console.log("🗑️  Deleting all users...");

	const deletedUsers = await prisma.user.deleteMany();

	console.log(`✅ Deleted ${deletedUsers.count} users`);
}
