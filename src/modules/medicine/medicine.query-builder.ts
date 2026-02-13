import { Prisma } from "../../../prisma/generated/prisma/client.js";

export interface QueryBuilderResult {
	where: any;
	orderBy: any;
	skip: number;
	limit: number;
}

export function buildMedicineQuery(queryParams: any): QueryBuilderResult {
	const where: any = {};
	const page = queryParams.page ? parseInt(queryParams.page) : 1;
	const limit = queryParams.limit ? parseInt(queryParams.limit) : 10;
	const skip = (page - 1) * limit;

	// Filters
	if (queryParams.categoryId) where.categoryId = queryParams.categoryId;
	if (queryParams.sellerId) where.sellerId = queryParams.sellerId;
	if (queryParams.isActive !== undefined)
		where.isActive = queryParams.isActive === "true";
	if (queryParams.isFeatured !== undefined)
		where.isFeatured = queryParams.isFeatured === "true";
	if (queryParams.inStock === "true") where.stockQuantity = { gt: 0 };

	if (queryParams.manufacturer) {
		where.manufacturer = {
			contains: queryParams.manufacturer,
			mode: "insensitive" as Prisma.QueryMode,
		};
	}

	if (queryParams.minPrice || queryParams.maxPrice) {
		where.price = {};
		if (queryParams.minPrice)
			where.price.gte = parseFloat(queryParams.minPrice);
		if (queryParams.maxPrice)
			where.price.lte = parseFloat(queryParams.maxPrice);
	}

	if (queryParams.search) {
		where.OR = [
			{
				name: {
					contains: queryParams.search,
					mode: "insensitive" as Prisma.QueryMode,
				},
			},
			{
				description: {
					contains: queryParams.search,
					mode: "insensitive" as Prisma.QueryMode,
				},
			},
			{
				genericName: {
					contains: queryParams.search,
					mode: "insensitive" as Prisma.QueryMode,
				},
			},
		];
	}

	// Sorting
	const orderBy: any = {};
	const sortBy = queryParams.sortBy || "createdAt";
	const sortOrder = queryParams.sortOrder || "desc";
	orderBy[sortBy] = sortOrder;

	return { where, orderBy, skip, limit };
}
