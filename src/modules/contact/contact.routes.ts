import { Router } from "express";
import { contactController } from "./contact.controller.js";
import { isAuth, Role } from "../../middlewares/isAuthMiddleware";

const contactRoutes: Router = Router();

// Public - anyone can submit a contact message
contactRoutes.post("/", contactController.createContact);

// Admin only - manage contact messages
contactRoutes.get("/", isAuth(Role.ADMIN), contactController.getContacts);
contactRoutes.get("/:id", isAuth(Role.ADMIN), contactController.getContactById);
contactRoutes.put(
	"/:id/status",
	isAuth(Role.ADMIN),
	contactController.updateContactStatus,
);
contactRoutes.delete(
	"/:id",
	isAuth(Role.ADMIN),
	contactController.deleteContact,
);

export default contactRoutes;
