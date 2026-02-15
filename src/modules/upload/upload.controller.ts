import type { Request, Response, NextFunction, RequestHandler } from "express";
import { uploadToS3, validateFile, type UploadFolder } from "@/lib/s3";

class UploadController {
	/**
	 * Handle single image upload to S3
	 * Returns the public URL of the uploaded file
	 */
	uploadImage: RequestHandler = async (
		req: Request,
		res: Response,
		_next: NextFunction,
	) => {
		try {
			if (!req.file) {
				return res.status(400).json({
					success: false,
					message: "No file uploaded",
				});
			}

			// Validate file
			const validation = validateFile(req.file);
			if (!validation.valid) {
				return res.status(400).json({
					success: false,
					message: validation.error,
				});
			}

			// Get folder from middleware
			const folder = (req as any).__uploadFolder as UploadFolder;

			// Upload to S3
			const { url } = await uploadToS3(req.file, folder);

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
		} catch (error: any) {
			console.error("Upload error:", error);
			return res.status(500).json({
				success: false,
				message: error.message || "Failed to upload file to S3",
			});
		}
	};

	/**
	 * Handle multiple image uploads to S3
	 * Returns array of public URLs
	 */
	uploadImages: RequestHandler = async (
		req: Request,
		res: Response,
		_next: NextFunction,
	) => {
		try {
			if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
				return res.status(400).json({
					success: false,
					message: "No files uploaded",
				});
			}

			// Get folder from middleware
			const folder = (req as any).__uploadFolder as UploadFolder;

			// Upload all files to S3
			const uploadPromises = (req.files as Express.Multer.File[]).map(
				async (file) => {
					const validation = validateFile(file);
					if (!validation.valid) {
						throw new Error(validation.error);
					}

					const { url } = await uploadToS3(file, folder);
					return {
						url,
						originalName: file.originalname,
						size: file.size,
						mimetype: file.mimetype,
					};
				},
			);

			const files = await Promise.all(uploadPromises);

			res.status(200).json({
				success: true,
				message: "Files uploaded successfully",
				data: files,
			});
		} catch (error: any) {
			console.error("Upload error:", error);
			return res.status(500).json({
				success: false,
				message: error.message || "Failed to upload files to S3",
			});
		}
	};
}

const uploadController = new UploadController();

export { uploadController };
