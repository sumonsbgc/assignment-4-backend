import { Router } from "express";
import { categoryController } from "./category.controller.js";
import { isAuth, Role } from "@/middlewares/isAuthMiddleware";

const categoryRoutes: Router = Router();

// Public routes
categoryRoutes.get("/", categoryController.index);
categoryRoutes.get("/slug/:slug", categoryController.getBySlug);
categoryRoutes.get("/:id", categoryController.getById);

// Admin-only routes
categoryRoutes.post("/", isAuth(Role.ADMIN), categoryController.store);
categoryRoutes.put("/:id", isAuth(Role.ADMIN), categoryController.update);
categoryRoutes.delete("/:id", isAuth(Role.ADMIN), categoryController.delete);

export default categoryRoutes;
