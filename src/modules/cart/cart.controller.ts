import type { Request, Response, NextFunction, RequestHandler } from "express";
import { cartService } from "./cart.service";
import type { AddToCartDto, UpdateCartDto } from "./cart.types";

class CartController {
	getCart: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const userId = (req.user as any)?.id;

			if (!userId) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			const cart = await cartService.getCart(userId);

			res.status(200).json({
				success: true,
				data: cart,
			});
		} catch (error) {
			next(error);
		}
	};

	addToCart: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const userId = (req.user as any)?.id;
			const data: AddToCartDto = req.body;

			if (!userId) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			const cartItem = await cartService.addToCart(userId, data);

			res.status(201).json({
				success: true,
				message: "Item added to cart",
				data: cartItem,
			});
		} catch (error: any) {
			if (error.message === "Medicine not found") {
				return res.status(404).json({
					success: false,
					message: error.message,
				});
			}
			if (error.message === "Insufficient stock") {
				return res.status(400).json({
					success: false,
					message: error.message,
				});
			}
			next(error);
		}
	};

	updateCartItem: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const userId = (req.user as any)?.id;
			const { id } = req.params;
			const data: UpdateCartDto = req.body;

			if (!userId) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			const cartItem = await cartService.updateCartItem(
				userId,
				String(id),
				data,
			);

			res.status(200).json({
				success: true,
				message: "Cart updated",
				data: cartItem,
			});
		} catch (error: any) {
			if (error.message === "Cart item not found") {
				return res.status(404).json({
					success: false,
					message: error.message,
				});
			}
			if (error.message === "Insufficient stock") {
				return res.status(400).json({
					success: false,
					message: error.message,
				});
			}
			next(error);
		}
	};

	removeFromCart: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const userId = (req.user as any)?.id;
			const { id } = req.params;

			if (!userId) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			await cartService.removeFromCart(userId, String(id));

			res.status(200).json({
				success: true,
				message: "Item removed from cart",
			});
		} catch (error: any) {
			if (error.message === "Cart item not found") {
				return res.status(404).json({
					success: false,
					message: error.message,
				});
			}
			next(error);
		}
	};

	clearCart: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const userId = (req.user as any)?.id;

			if (!userId) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			await cartService.clearCart(userId);

			res.status(200).json({
				success: true,
				message: "Cart cleared",
			});
		} catch (error) {
			next(error);
		}
	};

	getCartCount: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const userId = (req.user as any)?.id;

			if (!userId) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			const count = await cartService.getCartCount(userId);

			res.status(200).json({
				success: true,
				data: { count },
			});
		} catch (error) {
			next(error);
		}
	};
}

const cartController = new CartController();

export { cartController };
