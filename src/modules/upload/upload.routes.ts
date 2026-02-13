import { Router } from "express";
import { uploadController } from "./upload.controller.js";
import { upload, setUploadFolder } from "@/lib/upload";
import { isAuth } from "@/middlewares/isAuthMiddleware";

const uploadRoutes: Router = Router();

// All upload routes require authentication
// POST /api/uploads/medicines — single medicine image
uploadRoutes.post(
	"/medicines",
	isAuth(),
	setUploadFolder("medicines"),
	upload.single("image"),
	uploadController.uploadImage,
);

// POST /api/uploads/medicines/multiple — multiple medicine images
uploadRoutes.post(
	"/medicines/multiple",
	isAuth(),
	setUploadFolder("medicines"),
	upload.array("images", 5),
	uploadController.uploadImages,
);

// POST /api/uploads/categories — single category image
uploadRoutes.post(
	"/categories",
	isAuth(),
	setUploadFolder("categories"),
	upload.single("image"),
	uploadController.uploadImage,
);

// POST /api/uploads/users — single profile image
uploadRoutes.post(
	"/users",
	isAuth(),
	setUploadFolder("users"),
	upload.single("image"),
	uploadController.uploadImage,
);

export default uploadRoutes;
