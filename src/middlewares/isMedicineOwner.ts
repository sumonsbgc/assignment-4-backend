import { NextFunction, Request, RequestHandler, Response } from "express";
import { medicineService } from "../modules/medicine/medicine.service";

export const isMedicineOwner: RequestHandler = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const medicineId = req.params.id;
		const sellerId = req.user?.id;

		if (!sellerId) {
			res.status(401).json({
				success: false,
				message: "You are not authorized",
			});
			return;
		}

		if (!medicineId || typeof medicineId !== "string") {
			res.status(400).json({
				success: false,
				message: "Invalid medicine ID",
			});
			return;
		}

		const isOwner = await medicineService.isMedicineOwnedBySeller(
			medicineId,
			sellerId,
		);

		if (!isOwner) {
			res.status(403).json({
				success: false,
				message: "You do not have permission to modify this medicine",
			});
			return;
		}

		next();
	} catch (error) {
		next(error);
	}
};

export const attachSellerId: RequestHandler = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	if (req.user?.id) {
		req.body.sellerId = req.user.id;
	}
	next();
};
