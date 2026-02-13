import { Router } from "express";
import { userController } from "./user.controller.js";
import { isAuth, Role } from "@/middlewares/isAuthMiddleware";

const userRouter: Router = Router();

// Profile routes (any authenticated user)
userRouter.get("/me", isAuth(), userController.getMe);
userRouter.put("/me", isAuth(), userController.updateMe);

// Admin-only routes
userRouter.get("/", isAuth(Role.ADMIN), userController.getAllUsers);
userRouter.get("/sellers", isAuth(Role.ADMIN), userController.getSellers);
userRouter.get("/customers", isAuth(Role.ADMIN), userController.getCustomers);
userRouter.get("/:id", isAuth(Role.ADMIN), userController.getUserById);
userRouter.put("/:id", isAuth(Role.ADMIN), userController.updateUser);
userRouter.delete("/:id", isAuth(Role.ADMIN), userController.deleteUser);

export default userRouter;
