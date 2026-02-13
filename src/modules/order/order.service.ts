import { prisma } from "@lib/prisma";

import type {
	CreateOrderDto,
	UpdateOrderStatusDto,
	UpdatePaymentStatusDto,
	OrderStatus,
	PaginatedOrdersResponse,
} from "./order.types.js";

class OrderService {
	private generateOrderNumber = (): string => {
		const timestamp = Date.now().toString();
		const random = Math.random().toString(36).substring(2, 8).toUpperCase();
		return `ORD-${timestamp}-${random}`;
	};

	createOrder = async (userId: string, data: CreateOrderDto) => {
		const cartItems = await prisma.cart.findMany({
			where: { userId },
			include: {
				medicine: true,
			},
		});

		if (cartItems.length === 0) {
			throw new Error("Cart is empty");
		}

		for (const item of cartItems) {
			if (item.medicine.stockQuantity < item.quantity) {
				throw new Error(`Insufficient stock for ${item.medicine.name}`);
			}
		}

		const subtotal = cartItems.reduce((sum, item) => {
			const price = item.medicine.discountPrice || item.medicine.price;
			return sum + price * item.quantity;
		}, 0);

		const shippingCost = subtotal > 500 ? 0 : 50;
		const tax = subtotal * 0.05;
		const totalAmount = subtotal + shippingCost + tax;

		const order = await prisma.order.create({
			data: {
				orderNumber: this.generateOrderNumber(),
				userId,
				status: "PENDING",
				subtotal,
				shippingCost,
				tax,
				totalAmount,
				discount: 0,
				shippingAddress: data.shippingAddress,
				city: data.city,
				state: data.state ?? null,
				zipCode: data.zipCode,
				country: data.country || "Bangladesh",
				phone: data.phone,
				paymentMethod: data.paymentMethod,
				paymentStatus: "UNPAID",
				notes: data.notes ?? null,
				orderItems: {
					create: cartItems.map((item) => ({
						medicineId: item.medicineId,
						quantity: item.quantity,
						price: item.medicine.discountPrice || item.medicine.price,
						discount:
							item.medicine.price -
							(item.medicine.discountPrice || item.medicine.price),
						subtotal:
							(item.medicine.discountPrice || item.medicine.price) *
							item.quantity,
					})),
				},
			},
			include: {
				orderItems: {
					include: {
						medicine: {
							select: {
								id: true,
								name: true,
								slug: true,
								imageUrl: true,
							},
						},
					},
				},
			},
		});

		for (const item of cartItems) {
			await prisma.medicine.update({
				where: { id: item.medicineId },
				data: {
					stockQuantity: {
						decrement: item.quantity,
					},
				},
			});
		}

		await prisma.cart.deleteMany({
			where: { userId },
		});

		return order;
	};

	getUserOrders = async (
		userId: string,
		page: number = 1,
		limit: number = 10,
	): Promise<PaginatedOrdersResponse> => {
		const skip = (page - 1) * limit;

		const [orders, total] = await Promise.all([
			prisma.order.findMany({
				where: { userId },
				include: {
					orderItems: {
						include: {
							medicine: {
								select: {
									id: true,
									name: true,
									slug: true,
									imageUrl: true,
								},
							},
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				skip,
				take: limit,
			}),
			prisma.order.count({ where: { userId } }),
		]);

		const totalPages = Math.ceil(total / limit);

		return {
			data: orders as any,
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasMore: page < totalPages,
			},
		};
	};

	getOrderById = async (orderId: string, userId: string, role: string) => {
		const where: any = { id: orderId };

		if (role === "CUSTOMER") {
			where.userId = userId;
		} else if (role === "SELLER") {
			where.orderItems = {
				some: {
					medicine: {
						sellerId: userId,
					},
				},
			};
		}

		return await prisma.order.findFirst({
			where,
			include: {
				orderItems: {
					include: {
						medicine: {
							select: {
								id: true,
								name: true,
								slug: true,
								imageUrl: true,
								category: true,
							},
						},
					},
				},
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						phone: true,
					},
				},
			},
		});
	};

	getAllOrders = async (
		page: number = 1,
		limit: number = 20,
		status?: OrderStatus,
	): Promise<PaginatedOrdersResponse> => {
		const skip = (page - 1) * limit;
		const where = status ? { status } : {};

		const [orders, total] = await Promise.all([
			prisma.order.findMany({
				where,
				include: {
					orderItems: {
						include: {
							medicine: {
								select: {
									id: true,
									name: true,
									slug: true,
									imageUrl: true,
								},
							},
						},
					},
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				skip,
				take: limit,
			}),
			prisma.order.count({ where }),
		]);

		const totalPages = Math.ceil(total / limit);

		return {
			data: orders as any,
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasMore: page < totalPages,
			},
		};
	};

	getSellerOrders = async (
		sellerId: string,
		page: number = 1,
		limit: number = 20,
		status?: OrderStatus,
	): Promise<PaginatedOrdersResponse> => {
		const skip = (page - 1) * limit;

		// Build where clause
		const where: any = {
			orderItems: {
				some: {
					medicine: {
						sellerId: sellerId,
					},
				},
			},
		};

		if (status) {
			where.status = status;
		}

		const [orders, total] = await Promise.all([
			prisma.order.findMany({
				where,
				include: {
					orderItems: {
						include: {
							medicine: {
								select: {
									id: true,
									name: true,
									slug: true,
									imageUrl: true,
								},
							},
						},
					},
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				skip,
				take: limit,
			}),
			prisma.order.count({ where }),
		]);

		const totalPages = Math.ceil(total / limit);

		return {
			data: orders as any,
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasMore: page < totalPages,
			},
		};
	};

	updateOrderStatus = async (
		orderId: string,
		data: UpdateOrderStatusDto,
		userId?: string,
		role?: string,
	) => {
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				orderItems: {
					include: { medicine: true },
				},
			},
		});

		if (!order) {
			throw new Error("Order not found");
		}

		// Seller can only update orders that contain their medicines
		if (role === "SELLER" && userId) {
			const hasSellerItems = order.orderItems.some(
				(item) => item.medicine.sellerId === userId,
			);
			if (!hasSellerItems) {
				throw new Error("You can only update orders containing your medicines");
			}
		}

		// Validate status transitions
		const allowedTransitions: Record<string, string[]> = {
			PENDING: ["CONFIRMED", "CANCELLED"],
			CONFIRMED: ["PROCESSING", "CANCELLED"],
			PROCESSING: ["SHIPPED", "CANCELLED"],
			SHIPPED: ["DELIVERED", "RETURNED"],
			DELIVERED: ["RETURNED"],
			CANCELLED: [],
			RETURNED: [],
		};

		const allowed = allowedTransitions[order.status] || [];
		if (!allowed.includes(data.status)) {
			throw new Error(
				`Cannot transition from ${order.status} to ${data.status}`,
			);
		}

		const updateData: any = {
			status: data.status,
		};

		if (data.trackingNumber) {
			updateData.trackingNumber = data.trackingNumber;
		}

		if (data.status === "DELIVERED") {
			updateData.deliveredAt = new Date();
		}

		if (data.status === "CANCELLED") {
			updateData.cancelledAt = new Date();
			// Restore stock for cancelled orders
			for (const item of order.orderItems) {
				await prisma.medicine.update({
					where: { id: item.medicineId },
					data: {
						stockQuantity: { increment: item.quantity },
					},
				});
			}
		}

		return await prisma.order.update({
			where: { id: orderId },
			data: updateData,
			include: {
				orderItems: {
					include: {
						medicine: true,
					},
				},
			},
		});
	};

	updatePaymentStatus = async (
		orderId: string,
		data: UpdatePaymentStatusDto,
	) => {
		const updateData: any = {
			paymentStatus: data.paymentStatus,
		};

		if (data.paymentStatus === "PAID") {
			updateData.paidAt = new Date();
		}

		return await prisma.order.update({
			where: { id: orderId },
			data: updateData,
		});
	};

	cancelOrder = async (orderId: string, userId: string) => {
		const order = await prisma.order.findFirst({
			where: {
				id: orderId,
				userId,
			},
			include: {
				orderItems: true,
			},
		});

		if (!order) {
			throw new Error("Order not found");
		}

		if (!["PENDING", "CONFIRMED"].includes(order.status)) {
			throw new Error("Cannot cancel order at this stage");
		}

		// Restore stock for cancelled items
		for (const item of order.orderItems) {
			await prisma.medicine.update({
				where: { id: item.medicineId },
				data: {
					stockQuantity: { increment: item.quantity },
				},
			});
		}

		return await prisma.order.update({
			where: { id: orderId },
			data: {
				status: "CANCELLED",
				cancelledAt: new Date(),
			},
		});
	};
}

const orderService = new OrderService();

export { orderService };
