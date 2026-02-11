import { prisma } from "../../lib/prisma";
import type {
	CreateMedicineDto,
	UpdateMedicineDto,
	PaginatedResponse,
} from "./medicine.types.js";
import { buildMedicineQuery } from "./medicine.query-builder.js";
import { helper } from "../../helper";

class MedicineService {
	getMedicines = async (queryParams: any): Promise<PaginatedResponse<any>> => {
		const { where, orderBy, limit, skip } = buildMedicineQuery(queryParams);

		const [medicines, total] = await Promise.all([
			prisma.medicine.findMany({
				where,
				include: {
					category: {
						select: { id: true, name: true, slug: true },
					},
					seller: {
						select: { id: true, name: true, email: true },
					},
				},
				orderBy,
				skip,
				take: limit,
			}),
			prisma.medicine.count({ where }),
		]);

		const page = queryParams.page ? parseInt(queryParams.page) : 1;
		const totalPages = Math.ceil(total / limit);

		return {
			data: medicines,
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasMore: page < totalPages,
			},
		};
	};

	getMedicineById = async (id: string) => {
		return await prisma.medicine.findUnique({
			where: { id },
			include: {
				category: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				seller: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	};

	getMedicineBySlug = async (slug: string) => {
		return await prisma.medicine.findUnique({
			where: { slug },
			include: {
				category: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				seller: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	};

	createMedicine = async (data: CreateMedicineDto) => {
		const slug = helper.getSlug(data.name);
		const sku =
			data.sku ||
			`MED-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

		return await prisma.medicine.create({
			data: {
				...data,
				slug,
				sku,
			},
			include: {
				category: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				seller: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	};

	updateMedicine = async (id: string, data: UpdateMedicineDto) => {
		return await prisma.medicine.update({
			where: { id },
			data,
			include: {
				category: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				seller: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	};

	deleteMedicine = async (id: string) => {
		return await prisma.medicine.delete({
			where: { id },
		});
	};

	isMedicineOwnedBySeller = async (medicineId: string, sellerId: string) => {
		const medicine = await prisma.medicine.findFirst({
			where: {
				id: medicineId,
				sellerId,
			},
		});
		return !!medicine;
	};

	getLowStockMedicines = async (sellerId?: string) => {
		const where: any = {
			stockQuantity: {
				lte: prisma.medicine.fields.lowStockThreshold,
			},
		};

		if (sellerId) {
			where.sellerId = sellerId;
		}

		return await prisma.medicine.findMany({
			where,
			include: {
				category: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: {
				stockQuantity: "asc",
			},
		});
	};
}

const medicineService = new MedicineService();

export { medicineService };
