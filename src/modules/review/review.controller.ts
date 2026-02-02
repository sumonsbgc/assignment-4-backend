import type { Request, Response, NextFunction, RequestHandler } from "express";
import { reviewService } from "./review.service";
import type { CreateReviewDto, UpdateReviewDto } from "./review.types";

class ReviewController {
	createReview: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const userId = (req.user as any)?.id;
			const data: CreateReviewDto = req.body;

			if (!userId) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			const review = await reviewService.createReview(userId, data);

			res.status(201).json({
				success: true,
				message: data.parentId
					? "Reply added successfully"
					: "Review created successfully",
				data: review,
			});
		} catch (error: any) {
			if (
				error.message === "Medicine not found" ||
				error.message === "Parent review not found" ||
				error.message === "You have already reviewed this medicine"
			) {
				return res.status(400).json({
					success: false,
					message: error.message,
				});
			}
			next(error);
		}
	};

	getMedicineReviews: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { medicineId } = req.params;
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;

			if (!medicineId) {
				return res.status(400).json({
					success: false,
					message: "Medicine ID is required",
				});
			}

			const result = await reviewService.getMedicineReviews(
				String(medicineId),
				page,
				limit,
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

	getMedicineReviewStats: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { medicineId } = req.params;

			if (!medicineId) {
				return res.status(400).json({
					success: false,
					message: "Medicine ID is required",
				});
			}

			const stats = await reviewService.getMedicineReviewStats(
				String(medicineId),
			);

			res.status(200).json({
				success: true,
				data: stats,
			});
		} catch (error) {
			next(error);
		}
	};

	updateReview: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const userId = (req.user as any)?.id;
			const { id } = req.params;
			const data: UpdateReviewDto = req.body;

			if (!userId) {
				return res.status(401).json({
					success: false,
					message: "Unauthorized",
				});
			}

			const review = await reviewService.updateReview(String(id), userId, data);

			res.status(200).json({
				success: true,
				message: "Review updated successfully",
				data: review,
			});
		} catch (error: any) {
			if (error.message === "Review not found") {
				return res.status(404).json({
					success: false,
					message: error.message,
				});
			}
			next(error);
		}
	};

	deleteReview: RequestHandler = async (
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

			await reviewService.deleteReview(String(id), userId);

			res.status(200).json({
				success: true,
				message: "Review deleted successfully",
			});
		} catch (error: any) {
			if (error.message === "Review not found") {
				return res.status(404).json({
					success: false,
					message: error.message,
				});
			}
			next(error);
		}
	};

	getUserReviews: RequestHandler = async (
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

			const reviews = await reviewService.getUserReviews(userId);

			res.status(200).json({
				success: true,
				data: reviews,
			});
		} catch (error) {
			next(error);
		}
	};
}

const reviewController = new ReviewController();

export { reviewController };
