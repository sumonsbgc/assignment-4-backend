import type { Request, Response, NextFunction, RequestHandler } from "express";
import { medicineService } from "./medicine.service.js";
import type { CreateMedicineDto, UpdateMedicineDto } from "./medicine.types.js";

class MedicineController {
	private service = medicineService;

	index: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			console.log("Fetching medicines with query:", req.query, req.params);
			const result = await this.service.getMedicines(req.query);

			res.status(200).json({
				success: true,
				...result,
			});
		} catch (error) {
			next(error);
		}
	};

	show: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { id } = req.params;

			const medicine = await this.service.getMedicineById(String(id));

			if (!medicine) {
				return res.status(404).json({
					success: false,
					message: "Medicine not found",
				});
			}

			res.status(200).json({
				success: true,
				data: medicine,
			});
		} catch (error) {
			next(error);
		}
	};

	getBySlug: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { slug } = req.params;

			const medicine = await this.service.getMedicineBySlug(String(slug));

			if (!medicine) {
				return res.status(404).json({
					success: false,
					message: "Medicine not found",
				});
			}

			res.status(200).json({
				success: true,
				data: medicine,
			});
		} catch (error) {
			next(error);
		}
	};

	store: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const data: CreateMedicineDto = req.body;
			const medicine = await this.service.createMedicine(data);

			res.status(201).json({
				success: true,
				message: "Medicine created successfully",
				data: medicine,
			});
		} catch (error) {
			next(error);
		}
	};

	update: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { id } = req.params;
			const data: UpdateMedicineDto = req.body;

			// Ownership is verified by middleware
			const medicine = await this.service.updateMedicine(String(id), data);

			res.status(200).json({
				success: true,
				message: "Medicine updated successfully",
				data: medicine,
			});
		} catch (error) {
			next(error);
		}
	};

	delete: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { id } = req.params;

			// Ownership is verified by middleware
			await this.service.deleteMedicine(String(id));

			res.status(200).json({
				success: true,
				message: "Medicine deleted successfully",
			});
		} catch (error) {
			next(error);
		}
	};

	getLowStock: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			// If seller, show only their medicines; if admin, show all
			const sellerId =
				(req.user as any)?.role === "SELLER" ? req.user?.id : undefined;

			const medicines = await this.service.getLowStockMedicines(sellerId);

			res.status(200).json({
				success: true,
				data: medicines,
			});
		} catch (error) {
			next(error);
		}
	};
}

const medicineController = new MedicineController();

export { medicineController };
