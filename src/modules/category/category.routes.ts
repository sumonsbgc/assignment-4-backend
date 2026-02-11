import { Router } from "express";
import { categoryController } from "./category.controller.js";

const categoryRoutes: Router = Router();

// Public routes
categoryRoutes.get("/", categoryController.index);
categoryRoutes.get("/slug/:slug", categoryController.getBySlug);
categoryRoutes.get("/:id", categoryController.getById);

categoryRoutes.post("/", categoryController.store);
categoryRoutes.put("/:id", categoryController.update);
categoryRoutes.delete("/:id", categoryController.delete);

export default categoryRoutes;
