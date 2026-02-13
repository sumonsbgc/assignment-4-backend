export interface CreateContactDto {
	name: string;
	email: string;
	phone?: string;
	subject: string;
	message: string;
}

export interface ContactFilters {
	page?: number;
	limit?: number;
	status?: string;
	search?: string;
}

export interface ContactResponse {
	id: string;
	name: string;
	email: string;
	phone?: string | null;
	subject: string;
	message: string;
	status: string;
	createdAt: Date;
	updatedAt: Date;
}
