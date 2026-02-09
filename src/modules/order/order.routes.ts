import { Router } from "express";
import { orderController } from "./order.controller";
import { isAuth, Role } from "../../middlewares/isAuthMiddleware";

const orderRoutes: Router = Router();

orderRoutes.post("/", isAuth(Role.CUSTOMER), orderController.createOrder);
orderRoutes.get("/", isAuth(Role.CUSTOMER), orderController.getUserOrders);
orderRoutes.get("/all", isAuth(Role.ADMIN), orderController.getAllOrders);
orderRoutes.get(
	"/seller",
	isAuth(Role.SELLER),
	orderController.getSellerOrders,
);

orderRoutes.get(
	"/:id",
	isAuth(Role.CUSTOMER, Role.ADMIN, Role.SELLER),
	orderController.getOrderById,
);

orderRoutes.put(
	"/:id/status",
	isAuth(Role.ADMIN, Role.SELLER),
	orderController.updateOrderStatus,
);

orderRoutes.put(
	"/:id/payment",
	isAuth(Role.ADMIN),
	orderController.updatePaymentStatus,
);

orderRoutes.put(
	"/:id/cancel",
	isAuth(Role.CUSTOMER),
	orderController.cancelOrder,
);

export default orderRoutes;
