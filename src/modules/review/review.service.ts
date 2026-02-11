import { prisma } from "../../lib/prisma";
import type {
	CreateReviewDto,
	UpdateReviewDto,
	MedicineReviewsResponse,
	PaginatedReviewsResponse,
} from "./review.types.js";

class ReviewService {
	createReview = async (userId: string, data: CreateReviewDto) => {
		const medicine = await prisma.medicine.findUnique({
			where: { id: data.medicineId },
		});

		if (!medicine) {
			throw new Error("Medicine not found");
		}

		if (data.parentId) {
			const parentReview = await prisma.review.findUnique({
				where: { id: data.parentId },
			});

			if (!parentReview) {
				throw new Error("Parent review not found");
			}

			return await prisma.review.create({
				data: {
					userId,
					medicineId: data.medicineId,
					parentId: data.parentId,
					comment: data.comment,
					rating: null,
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			});
		}

		const existingReview = await prisma.review.findFirst({
			where: {
				userId,
				medicineId: data.medicineId,
				parentId: null,
			},
		});

		if (existingReview) {
			throw new Error("You have already reviewed this medicine");
		}

		return await prisma.review.create({
			data: {
				userId,
				medicineId: data.medicineId,
				rating: data.rating,
				comment: data.comment,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	};

	getMedicineReviews = async (
		medicineId: string,
		page: number = 1,
		limit: number = 10,
	): Promise<PaginatedReviewsResponse> => {
		const skip = (page - 1) * limit;

		const [reviews, total] = await Promise.all([
			prisma.review.findMany({
				where: {
					medicineId,
					parentId: null,
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					replies: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
								},
							},
						},
						orderBy: {
							createdAt: "asc",
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				skip,
				take: limit,
			}),
			prisma.review.count({
				where: {
					medicineId,
					parentId: null,
				},
			}),
		]);

		const totalPages = Math.ceil(total / limit);

		return {
			data: reviews as any,
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasMore: page < totalPages,
			},
		};
	};

	getMedicineReviewStats = async (
		medicineId: string,
	): Promise<MedicineReviewsResponse> => {
		const reviews = await prisma.review.findMany({
			where: {
				medicineId,
				parentId: null,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				replies: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
					orderBy: {
						createdAt: "asc",
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		const totalReviews = reviews.length;

		const averageRating =
			totalReviews > 0
				? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
					totalReviews
				: 0;

		const ratingDistribution = {
			1: 0,
			2: 0,
			3: 0,
			4: 0,
			5: 0,
		};

		reviews.forEach((review) => {
			if (review.rating) {
				ratingDistribution[review.rating as 1 | 2 | 3 | 4 | 5]++;
			}
		});

		return {
			reviews: reviews as any,
			averageRating: Math.round(averageRating * 10) / 10,
			totalReviews,
			ratingDistribution,
		};
	};

	updateReview = async (
		reviewId: string,
		userId: string,
		data: UpdateReviewDto,
	) => {
		const review = await prisma.review.findFirst({
			where: {
				id: reviewId,
				userId,
			},
		});

		if (!review) {
			throw new Error("Review not found");
		}

		return await prisma.review.update({
			where: { id: reviewId },
			data,
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});
	};

	deleteReview = async (reviewId: string, userId: string) => {
		const review = await prisma.review.findFirst({
			where: {
				id: reviewId,
				userId,
			},
		});

		if (!review) {
			throw new Error("Review not found");
		}

		return await prisma.review.delete({
			where: { id: reviewId },
		});
	};

	getUserReviews = async (userId: string) => {
		return await prisma.review.findMany({
			where: { userId },
			include: {
				medicine: {
					select: {
						id: true,
						name: true,
						slug: true,
						imageUrl: true,
					},
				},
				replies: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	};
}

const reviewService = new ReviewService();

export { reviewService };
