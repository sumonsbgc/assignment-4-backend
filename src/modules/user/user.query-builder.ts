import { Prisma } from "../../../prisma/generated/prisma/client.js";

export interface UserQueryBuilderResult {
	where: any;
	orderBy: any;
	skip: number;
	limit: number;
}

export function buildUserQuery(queryParams: any): UserQueryBuilderResult {
	const where: any = {};
	const page = queryParams.page ? parseInt(queryParams.page) : 1;
	const limit = queryParams.limit ? parseInt(queryParams.limit) : 10;
	const skip = (page - 1) * limit;

	// Role filter
	if (queryParams.role) {
		where.role = queryParams.role;
	}

	// Status filter
	if (queryParams.status) {
		where.status = queryParams.status;
	}

	// Email verified filter
	if (queryParams.emailVerified !== undefined) {
		where.emailVerified = queryParams.emailVerified === "true";
	}

	// Search by name or email
	if (queryParams.search) {
		where.OR = [
			{
				name: {
					contains: queryParams.search,
					mode: "insensitive" as Prisma.QueryMode,
				},
			},
			{
				email: {
					contains: queryParams.search,
					mode: "insensitive" as Prisma.QueryMode,
				},
			},
		];
	}

	// Sorting
	const sortBy = queryParams.sortBy || "createdAt";
	const sortOrder = queryParams.sortOrder || "desc";
	const orderBy: any = {};
	orderBy[sortBy] = sortOrder;

	return { where, orderBy, skip, limit };
}
