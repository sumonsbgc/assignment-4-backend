import multer from "multer";

// Allowed image MIME types
const ALLOWED_MIMES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"image/svg+xml",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export type UploadFolder = "medicines" | "categories" | "users";

// Use memory storage for S3 uploads
const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
	if (ALLOWED_MIMES.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error(
				`Invalid file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, GIF, SVG`,
			),
		);
	}
};

export const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: MAX_FILE_SIZE },
});

/**
 * Middleware that sets the upload folder for S3
 */
export const setUploadFolder = (folder: UploadFolder) => {
	return (req: any, _res: any, next: any) => {
		req.__uploadFolder = folder;
		next();
	};
};
