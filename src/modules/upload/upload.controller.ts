import type { Request, Response, NextFunction, RequestHandler } from "express";
import { getUploadUrl } from "@/lib/upload";

class UploadController {
	/**
	 * Handle single image upload
	 * Returns the public URL of the uploaded file
	 */
	uploadImage: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			if (!req.file) {
				return res.status(400).json({
					success: false,
					message: "No file uploaded",
				});
			}

			const url = getUploadUrl(req.file.path);

			res.status(200).json({
				success: true,
				message: "File uploaded successfully",
				data: {
					url,
					originalName: req.file.originalname,
					size: req.file.size,
					mimetype: req.file.mimetype,
				},
			});
		} catch (error) {
			next(error);
		}
	};

	/**
	 * Handle multiple image uploads
	 * Returns array of public URLs
	 */
	uploadImages: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
				return res.status(400).json({
					success: false,
					message: "No files uploaded",
				});
			}

			const files = (req.files as Express.Multer.File[]).map((file) => ({
				url: getUploadUrl(file.path),
				originalName: file.originalname,
				size: file.size,
				mimetype: file.mimetype,
			}));

			res.status(200).json({
				success: true,
				message: "Files uploaded successfully",
				data: files,
			});
		} catch (error) {
			next(error);
		}
	};
}

const uploadController = new UploadController();

export { uploadController };
