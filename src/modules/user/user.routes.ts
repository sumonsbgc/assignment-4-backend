import { Router } from "express";
import { userController } from "./user.controller.js";
import { isAuth, Role } from "@/middlewares/isAuthMiddleware";

const userRouter: Router = Router();

userRouter.get("/", isAuth(Role.ADMIN), userController.getAllUsers);
userRouter.get("/sellers", isAuth(Role.ADMIN), userController.getSellers);
userRouter.get("/customers", isAuth(Role.ADMIN), userController.getCustomers);
userRouter.get("/:id", isAuth(Role.ADMIN), userController.getUserById);
userRouter.put("/:id", isAuth(Role.ADMIN), userController.updateUser);
userRouter.delete("/:id", isAuth(Role.ADMIN), userController.deleteUser);

export default userRouter;
