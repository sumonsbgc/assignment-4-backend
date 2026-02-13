import { prisma } from "@lib/prisma";
import type { CreateUserDto, UpdateUserDto } from "./user.types.js";
import { buildUserQuery } from "./user.query-builder.js";
import { helper } from "@/helper";

class UserService {
	getAllUsers = async (queryParams: any = {}) => {
		const { where, orderBy, limit, skip } = buildUserQuery(queryParams);

		const [users, total] = await Promise.all([
			prisma.user.findMany({
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
				orderBy,
				skip,
				take: limit,
			}),
			prisma.user.count({ where }),
		]);

		const page = queryParams.page ? parseInt(queryParams.page) : 1;
		const totalPages = Math.ceil(total / limit);

		return {
			data: users,
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasMore: page < totalPages,
			},
		};
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

	getSellers = async (queryParams: any = {}) => {
		return await this.getAllUsers({ ...queryParams, role: "SELLER" });
	};

	getCustomers = async (queryParams: any = {}) => {
		return await this.getAllUsers({ ...queryParams, role: "CUSTOMER" });
	};
}

const userService = new UserService();

export { userService };
