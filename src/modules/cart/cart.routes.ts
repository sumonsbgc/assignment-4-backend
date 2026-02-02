import { Router } from "express";
import { cartController } from "./cart.controller";
import { isAuth, Role } from "../../middlewares/isAuthMiddleware";

const cartRoutes: Router = Router();

cartRoutes.use(isAuth(Role.CUSTOMER));

cartRoutes.get("/", cartController.getCart);
cartRoutes.get("/count", cartController.getCartCount);
cartRoutes.post("/", cartController.addToCart);
cartRoutes.put("/:id", cartController.updateCartItem);
cartRoutes.delete("/:id", cartController.removeFromCart);
cartRoutes.delete("/", cartController.clearCart);

export default cartRoutes;
