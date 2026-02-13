import type { Request, RequestHandler, Response } from "express";
import { userService } from "./user.service.js";

class UserController {
	/**
	 * Get all users
	 */
	getAllUsers: RequestHandler = async (req: Request, res: Response) => {
		try {
			const result = await userService.getAllUsers(req.query);

			res.status(200).json({
				success: true,
				message: "Users fetched successfully",
				...result,
			});
		} catch (error: any) {
			res.status(500).json({
				success: false,
				message: "Error fetching users",
				error: error.message,
			});
		}
	};

	/**
	 * Get user by ID
	 */
	getUserById: RequestHandler = async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const user = await userService.getUserById(String(id));

			if (!user) {
				return res.status(404).json({
					success: false,
					message: "User not found",
				});
			}

			res.status(200).json({
				success: true,
				message: "User fetched successfully",
				data: user,
			});
		} catch (error: any) {
			res.status(500).json({
				success: false,
				message: "Error fetching user",
				error: error.message,
			});
		}
	};

	/**
	 * Update user
	 */
	updateUser: RequestHandler = async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const user = await userService.updateUser(String(id), req.body);

			res.status(200).json({
				success: true,
				message: "User updated successfully",
				data: user,
			});
		} catch (error: any) {
			res.status(500).json({
				success: false,
				message: "Error updating user",
				error: error.message,
			});
		}
	};

	/**
	 * Delete user
	 */
	deleteUser: RequestHandler = async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			await userService.deleteUser(String(id));

			res.status(200).json({
				success: true,
				message: "User deleted successfully",
			});
		} catch (error: any) {
			res.status(500).json({
				success: false,
				message: "Error deleting user",
				error: error.message,
			});
		}
	};

	/**
	 * Get all sellers
	 */
	getSellers: RequestHandler = async (req: Request, res: Response) => {
		try {
			const result = await userService.getSellers(req.query);

			res.status(200).json({
				success: true,
				message: "Sellers fetched successfully",
				...result,
			});
		} catch (error: any) {
			res.status(500).json({
				success: false,
				message: "Error fetching sellers",
				error: error.message,
			});
		}
	};

	/**
	 * Get all customers
	 */
	getCustomers: RequestHandler = async (req: Request, res: Response) => {
		try {
			const result = await userService.getCustomers(req.query);

			res.status(200).json({
				success: true,
				message: "Customers fetched successfully",
				...result,
			});
		} catch (error: any) {
			res.status(500).json({
				success: false,
				message: "Error fetching customers",
				error: error.message,
			});
		}
	};
}

const userController = new UserController();

export { userController };
