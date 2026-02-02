export interface AddToCartDto {
	medicineId: string;
	quantity: number;
}

export interface UpdateCartDto {
	quantity: number;
}

export interface CartItemResponse {
	id: string;
	userId: string;
	medicineId: string;
	quantity: number;
	medicine: {
		id: string;
		name: string;
		slug: string;
		price: number;
		discountPrice?: number;
		stockQuantity: number;
		imageUrl?: string;
		category: {
			id: string;
			name: string;
		};
	};
	createdAt: Date;
	updatedAt: Date;
}

export interface CartSummary {
	items: CartItemResponse[];
	subtotal: number;
	totalItems: number;
	totalQuantity: number;
}
