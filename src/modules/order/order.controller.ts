import type { Request, Response, NextFunction, RequestHandler } from "express";
import { orderService } from "./order.service.js";
import type {
	CreateOrderDto,
	UpdateOrderStatusDto,
	UpdatePaymentStatusDto,
	OrderStatus,
} from "./order.types.js";

class OrderController {
	createOrder: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const userId = (req.user as any)?.id;
			const data: CreateOrderDto = req.body;

			if (!userId) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			const order = await orderService.createOrder(userId, data);

			res.status(201).json({
				success: true,
				message: "Order created successfully",
				data: order,
			});
		} catch (error: any) {
			if (
				error.message === "Cart is empty" ||
				error.message?.includes("Insufficient stock")
			) {
				return res.status(400).json({
					success: false,
					message: error.message,
				});
			}
			next(error);
		}
	};

	getUserOrders: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const userId = (req.user as any)?.id;
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;

			if (!userId) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			const result = await orderService.getUserOrders(userId, page, limit);

			res.status(200).json({
				success: true,
				data: result.data,
				pagination: result.pagination,
			});
		} catch (error) {
			next(error);
		}
	};

	getOrderById: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const user = req.user as any;
			const userId = user?.id;
			const userRole = user?.role;
			const { id } = req.params;

			if (!userId || !userRole) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			const order = await orderService.getOrderById(
				String(id),
				userId,
				userRole,
			);

			if (!order) {
				return res.status(404).json({
					success: false,
					message: "Order not found",
				});
			}

			res.status(200).json({
				success: true,
				data: order,
			});
		} catch (error) {
			next(error);
		}
	};

	getAllOrders: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 20;
			const status = req.query.status as OrderStatus | undefined;
			const search = req.query.search as string | undefined;

			const result = await orderService.getAllOrders(
				page,
				limit,
				status,
				search,
			);

			res.status(200).json({
				success: true,
				data: result.data,
				pagination: result.pagination,
			});
		} catch (error) {
			next(error);
		}
	};

	getSellerOrders: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const sellerId = (req.user as any)?.id;
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 20;
			const status = req.query.status as OrderStatus | undefined;
			const search = req.query.search as string | undefined;

			if (!sellerId) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			const result = await orderService.getSellerOrders(
				sellerId,
				page,
				limit,
				status,
				search,
			);

			res.status(200).json({
				success: true,
				data: result.data,
				pagination: result.pagination,
			});
		} catch (error) {
			next(error);
		}
	};

	updateOrderStatus: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { id } = req.params;
			const data: UpdateOrderStatusDto = req.body;

			const order = await orderService.updateOrderStatus(
				String(id),
				data,
				req.user?.id,
				req.user?.role,
			);

			res.status(200).json({
				success: true,
				message: "Order status updated",
				data: order,
			});
		} catch (error) {
			next(error);
		}
	};

	updatePaymentStatus: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { id } = req.params;
			const data: UpdatePaymentStatusDto = req.body;

			const order = await orderService.updatePaymentStatus(String(id), data);

			res.status(200).json({
				success: true,
				message: "Payment status updated",
				data: order,
			});
		} catch (error) {
			next(error);
		}
	};

	cancelOrder: RequestHandler = async (
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

			const order = await orderService.cancelOrder(String(id), userId);

			res.status(200).json({
				success: true,
				message: "Order cancelled",
				data: order,
			});
		} catch (error: any) {
			if (
				error.message === "Order not found" ||
				error.message === "Cannot cancel order at this stage"
			) {
				return res.status(400).json({
					success: false,
					message: error.message,
				});
			}
			next(error);
		}
	};
}

const orderController = new OrderController();
export { orderController };
