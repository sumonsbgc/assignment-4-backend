export interface CreateCategoryDto {
	name: string;
	slug: string;
	description?: string;
	image?: string;
	parentId?: string;
	order?: number;
}

export interface UpdateCategoryDto {
	name?: string;
	slug?: string;
	description?: string;
	image?: string;
	parentId?: string;
	order?: number;
	isActive?: boolean;
}

export interface CategoryFilters {
	isActive?: boolean;
	parentId?: string | null;
	search?: string;
	page?: number;
	limit?: number;
}
