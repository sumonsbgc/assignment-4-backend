import { Router } from "express";
import { dashboardController } from "./dashboard.controller.js";
import { isAuth, Role } from "@/middlewares/isAuthMiddleware";

const dashboardRoutes: Router = Router();

dashboardRoutes.get(
	"/customer",
	isAuth(Role.CUSTOMER),
	dashboardController.customer,
);

dashboardRoutes.get("/seller", isAuth(Role.SELLER), dashboardController.seller);

dashboardRoutes.get("/admin", isAuth(Role.ADMIN), dashboardController.admin);

export default dashboardRoutes;
