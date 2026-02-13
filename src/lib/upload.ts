import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Ensure upload directories exist
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const SUBDIRS = ["medicines", "categories", "users"] as const;

export type UploadFolder = (typeof SUBDIRS)[number];

for (const sub of SUBDIRS) {
	const dir = path.join(UPLOAD_DIR, sub);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

// Allowed image MIME types
const ALLOWED_MIMES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"image/svg+xml",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Dynamic storage — folder is set via route param or default
const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		// The folder is injected into req by the route handler before multer runs,
		// so we read it from a custom property. Default to "uploads/"
		const folder = (_req as any).__uploadFolder || "";
		const dest = path.join(UPLOAD_DIR, folder);
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest, { recursive: true });
		}
		cb(null, dest);
	},
	filename: (_req, file, cb) => {
		const ext = path.extname(file.originalname).toLowerCase();
		const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
		cb(null, uniqueName);
	},
});

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
 * Middleware that sets the upload folder for multer's destination callback
 */
export const setUploadFolder = (folder: UploadFolder) => {
	return (req: any, _res: any, next: any) => {
		req.__uploadFolder = folder;
		next();
	};
};

/**
 * Get the public URL path for an uploaded file
 */
export const getUploadUrl = (filePath: string): string => {
	// filePath comes from multer as an absolute path; extract relative from "uploads/"
	const idx = filePath.replace(/\\/g, "/").indexOf("uploads/");
	if (idx !== -1) {
		return `/${filePath.replace(/\\/g, "/").substring(idx)}`;
	}
	return filePath;
};

/**
 * Delete a previously uploaded file given its URL path (e.g. /uploads/medicines/abc.jpg)
 */
export const deleteUploadedFile = (urlPath: string): void => {
	try {
		const filePath = path.join(process.cwd(), urlPath);
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
	} catch (error) {
		console.error("Error deleting file:", error);
	}
};
