import { Router } from "express";
import { userController } from "./user.controller.js";

const userRouter: Router = Router();

userRouter.get("/", userController.getAllUsers);
userRouter.get("/sellers", userController.getSellers);
userRouter.get("/customers", userController.getCustomers);
userRouter.get("/:id", userController.getUserById);
userRouter.put("/:id", userController.updateUser);
userRouter.delete("/:id", userController.deleteUser);

export default userRouter;
