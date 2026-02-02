export interface CreateMedicineDto {
	name: string;
	slug: string;
	sku?: string;
	description?: string;
	genericName?: string;
	manufacturer: string;
	price: number;
	discountPrice?: number;
	discountPercentage?: number;
	stockQuantity?: number;
	lowStockThreshold?: number;
	unit?: string;
	imageUrl?: string;
	images?: string[];
	dosageForm?: string;
	strength?: string;
	packSize?: string;
	requiresPrescription?: boolean;
	expiryDate?: Date;
	ingredients?: string;
	sideEffects?: string;
	warnings?: string;
	storage?: string;
	categoryId: string;
	sellerId: string;
	isFeatured?: boolean;
}

export interface UpdateMedicineDto {
	name?: string;
	slug?: string;
	sku?: string;
	description?: string;
	genericName?: string;
	manufacturer?: string;
	price?: number;
	discountPrice?: number;
	discountPercentage?: number;
	stockQuantity?: number;
	lowStockThreshold?: number;
	unit?: string;
	imageUrl?: string;
	images?: string[];
	dosageForm?: string;
	strength?: string;
	packSize?: string;
	requiresPrescription?: boolean;
	expiryDate?: Date;
	ingredients?: string;
	sideEffects?: string;
	warnings?: string;
	storage?: string;
	categoryId?: string;
	isActive?: boolean;
	isFeatured?: boolean;
}

export interface MedicineFilters {
	categoryId?: string;
	manufacturer?: string;
	minPrice?: number;
	maxPrice?: number;
	isActive?: boolean;
	isFeatured?: boolean;
	sellerId?: string;
	search?: string;
	inStock?: boolean;
}

export interface MedicineSortOptions {
	sortBy?: "price" | "name" | "createdAt";
	sortOrder?: "asc" | "desc";
}

export interface PaginationOptions {
	page?: number;
	limit?: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasMore: boolean;
	};
}
