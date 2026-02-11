import { Router } from "express";
import { reviewController } from "./review.controller.js";
import { isAuth, Role } from "../../middlewares/isAuthMiddleware";

const reviewRoutes: Router = Router();

reviewRoutes.post("/", isAuth(Role.CUSTOMER), reviewController.createReview);
reviewRoutes.get("/medicine/:medicineId", reviewController.getMedicineReviews);
reviewRoutes.get(
	"/medicine/:medicineId/stats",
	reviewController.getMedicineReviewStats,
);

reviewRoutes.get(
	"/my-reviews",
	isAuth(Role.CUSTOMER),
	reviewController.getUserReviews,
);

reviewRoutes.put("/:id", isAuth(Role.CUSTOMER), reviewController.updateReview);
reviewRoutes.delete(
	"/:id",
	isAuth(Role.CUSTOMER),
	reviewController.deleteReview,
);

export default reviewRoutes;
