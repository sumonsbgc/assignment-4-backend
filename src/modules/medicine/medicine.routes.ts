import { Router } from "express";
import { medicineController } from "./medicine.controller.js";
import { isAuth, Role } from "@/middlewares/isAuthMiddleware";
import { isMedicineOwner, attachSellerId } from "@/middlewares/isMedicineOwner";

const medicineRoutes: Router = Router();

// Public routes
medicineRoutes.get("/", medicineController.index);
medicineRoutes.get("/slug/:slug", medicineController.getBySlug);

// Low stock must be before /:id to avoid being caught by the param
medicineRoutes.get(
	"/low-stock",
	isAuth(Role.SELLER, Role.ADMIN),
	medicineController.getLowStock,
);

medicineRoutes.get("/:id", medicineController.show);

medicineRoutes.post(
	"/",
	isAuth(Role.SELLER),
	attachSellerId,
	medicineController.store,
);

medicineRoutes.put(
	"/:id",
	isAuth(Role.SELLER),
	isMedicineOwner,
	medicineController.update,
);

medicineRoutes.delete(
	"/:id",
	isAuth(Role.SELLER),
	isMedicineOwner,
	medicineController.delete,
);

export default medicineRoutes;
