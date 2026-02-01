import { prisma } from "@lib/prisma";

import type {
	CategoryFilters,
	CreateCategoryDto,
	UpdateCategoryDto,
} from "./category.types";

class CategoryService {
	getCategories = async (filters?: CategoryFilters) => {
		const where: any = {};

		if (filters?.isActive !== undefined) {
			where.isActive = filters.isActive;
		}

		if (filters?.parentId !== undefined) {
			where.parentId = filters.parentId;
		}

		if (filters?.search) {
			where.OR = [
				{ name: { contains: filters.search, mode: "insensitive" } },
				{ description: { contains: filters.search, mode: "insensitive" } },
			];
		}

		return await prisma.category.findMany({
			where,
			include: {
				parent: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				children: {
					select: {
						id: true,
						name: true,
						slug: true,
						isActive: true,
					},
				},
				_count: {
					select: {
						medicines: true,
					},
				},
			},
			orderBy: [{ order: "asc" }, { name: "asc" }],
		});
	};

	getCategoryById = async (id: string) => {
		return await prisma.category.findUnique({
			where: { id },
			include: {
				parent: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				children: {
					select: {
						id: true,
						name: true,
						slug: true,
						isActive: true,
					},
				},
				_count: {
					select: {
						medicines: true,
					},
				},
			},
		});
	};

	getCategoryBySlug = async (slug: string) => {
		return await prisma.category.findUnique({
			where: { slug },
			include: {
				parent: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				children: {
					select: {
						id: true,
						name: true,
						slug: true,
						isActive: true,
					},
				},
				_count: {
					select: {
						medicines: true,
					},
				},
			},
		});
	};

	createCategory = async (data: CreateCategoryDto) => {
		return await prisma.category.create({
			data,
			include: {
				parent: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
		});
	};

	updateCategory = async (id: string, data: UpdateCategoryDto) => {
		return await prisma.category.update({
			where: { id },
			data,
			include: {
				parent: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				children: {
					select: {
						id: true,
						name: true,
						slug: true,
						isActive: true,
					},
				},
			},
		});
	};

	deleteCategory = async (id: string) => {
		return await prisma.category.delete({
			where: { id },
		});
	};
}

const categoryService = new CategoryService();

export { categoryService };
