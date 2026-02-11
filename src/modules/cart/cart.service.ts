import { prisma } from "../../lib/prisma";
import type { AddToCartDto, UpdateCartDto, CartSummary } from "./cart.types.js";

class CartService {
	getCart = async (userId: string): Promise<CartSummary> => {
		const cartItems = await prisma.cart.findMany({
			where: { userId },
			include: {
				medicine: {
					include: {
						category: {
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

		const items = cartItems.map((item) => ({
			id: item.id,
			userId: item.userId,
			medicineId: item.medicineId,
			quantity: item.quantity,
			medicine: {
				id: item.medicine.id,
				name: item.medicine.name,
				slug: item.medicine.slug,
				price: item.medicine.price,
				discountPrice: item.medicine.discountPrice || 0,
				stockQuantity: item.medicine.stockQuantity,
				imageUrl: item.medicine.imageUrl || "",
				category: item.medicine.category,
			},
			createdAt: item.createdAt,
			updatedAt: item.updatedAt,
		}));

		const subtotal = items.reduce((sum, item) => {
			const price = item.medicine.discountPrice || item.medicine.price;
			return sum + price * item.quantity;
		}, 0);

		const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

		return {
			items,
			subtotal,
			totalItems: items.length,
			totalQuantity,
		};
	};

	addToCart = async (userId: string, data: AddToCartDto) => {
		const medicine = await prisma.medicine.findUnique({
			where: { id: data.medicineId },
		});

		if (!medicine) {
			throw new Error("Medicine not found");
		}

		if (medicine.stockQuantity < data.quantity) {
			throw new Error("Insufficient stock");
		}

		const existingItem = await prisma.cart.findUnique({
			where: {
				userId_medicineId: {
					userId,
					medicineId: data.medicineId,
				},
			},
		});

		if (existingItem) {
			return await prisma.cart.update({
				where: { id: existingItem.id },
				data: {
					quantity: existingItem.quantity + data.quantity,
				},
				include: {
					medicine: {
						include: {
							category: true,
						},
					},
				},
			});
		}

		return await prisma.cart.create({
			data: {
				userId,
				medicineId: data.medicineId,
				quantity: data.quantity,
			},
			include: {
				medicine: {
					include: {
						category: true,
					},
				},
			},
		});
	};

	updateCartItem = async (
		userId: string,
		cartItemId: string,
		data: UpdateCartDto,
	) => {
		const cartItem = await prisma.cart.findFirst({
			where: {
				id: cartItemId,
				userId,
			},
			include: {
				medicine: true,
			},
		});

		if (!cartItem) {
			throw new Error("Cart item not found");
		}

		if (cartItem.medicine.stockQuantity < data.quantity) {
			throw new Error("Insufficient stock");
		}

		return await prisma.cart.update({
			where: { id: cartItemId },
			data: { quantity: data.quantity },
			include: {
				medicine: {
					include: {
						category: true,
					},
				},
			},
		});
	};

	removeFromCart = async (userId: string, cartItemId: string) => {
		const cartItem = await prisma.cart.findFirst({
			where: {
				id: cartItemId,
				userId,
			},
		});

		if (!cartItem) {
			throw new Error("Cart item not found");
		}

		return await prisma.cart.delete({
			where: { id: cartItemId },
		});
	};

	clearCart = async (userId: string) => {
		return await prisma.cart.deleteMany({
			where: { userId },
		});
	};

	getCartCount = async (userId: string): Promise<number> => {
		return await prisma.cart.count({
			where: { userId },
		});
	};
}

const cartService = new CartService();

export { cartService };
