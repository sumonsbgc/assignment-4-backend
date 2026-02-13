import type { Request, Response, NextFunction, RequestHandler } from "express";
import { dashboardService } from "./dashboard.service.js";

class DashboardController {
	private service = dashboardService;

	customer: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const userId = req.user!.id;
			const data = await this.service.getCustomerDashboard(userId);

			res.status(200).json({
				success: true,
				data,
			});
		} catch (error) {
			next(error);
		}
	};

	seller: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const sellerId = req.user!.id;
			const data = await this.service.getSellerDashboard(sellerId);

			res.status(200).json({
				success: true,
				data,
			});
		} catch (error) {
			next(error);
		}
	};

	admin: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const data = await this.service.getAdminDashboard();

			res.status(200).json({
				success: true,
				data,
			});
		} catch (error) {
			next(error);
		}
	};
}

const dashboardController = new DashboardController();
export { dashboardController };
