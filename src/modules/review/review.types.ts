export interface CreateReviewDto {
	medicineId: string;
	rating: number;
	comment: string;
	parentId?: string;
}

export interface UpdateReviewDto {
	rating?: number;
	comment?: string;
}

export interface ReviewResponse {
	id: string;
	userId: string;
	medicineId: string;
	parentId?: string;
	rating?: number;
	comment: string;
	createdAt: Date;
	updatedAt: Date;
	user: {
		id: string;
		name: string;
		email: string;
	};
	replies?: ReviewResponse[];
}

export interface MedicineReviewsResponse {
	reviews: ReviewResponse[];
	averageRating: number;
	totalReviews: number;
	ratingDistribution: {
		1: number;
		2: number;
		3: number;
		4: number;
		5: number;
	};
}

export interface PaginatedReviewsResponse {
	data: ReviewResponse[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasMore: boolean;
	};
}
