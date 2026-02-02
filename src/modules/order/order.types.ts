export interface CreateOrderDto {
	shippingAddress: string;
	city: string;
	state?: string;
	zipCode: string;
	country?: string;
	phone: string;
	paymentMethod: string;
	notes?: string;
}

export interface UpdateOrderStatusDto {
	status: OrderStatus;
	trackingNumber?: string;
}

export interface UpdatePaymentStatusDto {
	paymentStatus: PaymentStatus;
}

export enum OrderStatus {
	PENDING = "PENDING",
	CONFIRMED = "CONFIRMED",
	PROCESSING = "PROCESSING",
	SHIPPED = "SHIPPED",
	DELIVERED = "DELIVERED",
	CANCELLED = "CANCELLED",
	RETURNED = "RETURNED",
}

export enum PaymentStatus {
	UNPAID = "UNPAID",
	PAID = "PAID",
	FAILED = "FAILED",
	REFUNDED = "REFUNDED",
}

export interface OrderItemDto {
	medicineId: string;
	quantity: number;
	price: number;
	discount: number;
}

export interface OrderResponse {
	id: string;
	orderNumber: string;
	userId: string;
	status: string;
	subtotal: number;
	shippingCost: number;
	tax: number;
	totalAmount: number;
	discount: number;
	shippingAddress: string;
	city: string;
	state?: string;
	zipCode: string;
	country: string;
	phone: string;
	paymentMethod: string;
	paymentStatus: string;
	paidAt?: Date;
	notes?: string;
	trackingNumber?: string;
	createdAt: Date;
	updatedAt: Date;
	deliveredAt?: Date;
	cancelledAt?: Date;
	orderItems: Array<{
		id: string;
		medicineId: string;
		quantity: number;
		price: number;
		discount: number;
		subtotal: number;
		medicine: {
			id: string;
			name: string;
			slug: string;
			imageUrl?: string;
		};
	}>;
}

export interface PaginatedOrdersResponse {
	data: OrderResponse[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasMore: boolean;
	};
}
