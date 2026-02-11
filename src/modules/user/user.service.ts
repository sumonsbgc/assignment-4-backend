import { prisma } from "@lib/prisma";
import type { CreateUserDto, UpdateUserDto } from "./user.types.js";
import { helper } from "@/helper";

class UserService {
	getAllUsers = async (role?: string) => {
		const where = role ? { role } : {};
		return await prisma.user.findMany({
			where,
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				phone: true,
				image: true,
				status: true,
				emailVerified: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	};

	getUserById = async (id: string) => {
		return await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				phone: true,
				image: true,
				status: true,
				emailVerified: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	};

	getUserByEmail = async (email: string) => {
		return await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				phone: true,
				image: true,
				status: true,
				emailVerified: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	};

	createUser = async (data: CreateUserDto) => {
		const hashedPassword = await helper.hashPassword(data.password);

		const user = await prisma.user.create({
			data: {
				id: crypto.randomUUID(),
				name: data.name,
				email: data.email,
				role: data.role || "CUSTOMER",
				phone: data.phone ?? null,
				image: data.image ?? null,
				emailVerified: data.emailVerified || false,
				status: data.status || "ACTIVE",
				accounts: {
					create: {
						id: crypto.randomUUID(),
						accountId: crypto.randomUUID(),
						providerId: "credential",
						password: hashedPassword,
					},
				},
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				phone: true,
				image: true,
				status: true,
				emailVerified: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return user;
	};

	updateUser = async (id: string, data: UpdateUserDto) => {
		return await prisma.user.update({
			where: { id },
			data,
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				phone: true,
				image: true,
				status: true,
				emailVerified: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	};

	deleteUser = async (id: string) => {
		return await prisma.user.delete({
			where: { id },
		});
	};

	getSellers = async () => {
		return await this.getAllUsers("SELLER");
	};

	getCustomers = async () => {
		return await this.getAllUsers("CUSTOMER");
	};
}

const userService = new UserService();

export { userService };
