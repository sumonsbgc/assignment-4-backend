import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";
import config from "./config.js";

// Initialize S3 Client
const s3Client = new S3Client({
	region: config.awsRegion,
	credentials: {
		accessKeyId: config.awsAccessKeyId,
		secretAccessKey: config.awsSecretAccessKey,
	},
});

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

/**
 * Validate file before upload
 */
export const validateFile = (
	file: Express.Multer.File,
): { valid: boolean; error?: string } => {
	if (!ALLOWED_MIMES.includes(file.mimetype)) {
		return {
			valid: false,
			error: `Invalid file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, GIF, SVG`,
		};
	}

	if (file.size > MAX_FILE_SIZE) {
		return {
			valid: false,
			error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
		};
	}

	return { valid: true };
};

/**
 * Generate unique filename for S3
 */
const generateFileName = (
	originalName: string,
	folder: UploadFolder,
): string => {
	const ext = path.extname(originalName).toLowerCase();
	const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
	return `${folder}/${uniqueName}`;
};

/**
 * Upload file to S3
 */
export const uploadToS3 = async (
	file: Express.Multer.File,
	folder: UploadFolder,
): Promise<{ url: string; key: string }> => {
	const key = generateFileName(file.originalname, folder);

	const command = new PutObjectCommand({
		Bucket: config.awsS3Bucket,
		Key: key,
		Body: file.buffer,
		ContentType: file.mimetype,
		// Make file publicly readable
		ACL: "public-read",
	});

	await s3Client.send(command);

	// Return the public URL
	const url = `https://${config.awsS3Bucket}.s3.${config.awsRegion}.amazonaws.com/${key}`;

	return { url, key };
};

/**
 * Delete file from S3
 */
export const deleteFromS3 = async (urlOrKey: string): Promise<void> => {
	try {
		let key = urlOrKey;

		// If it's a full URL, extract the key
		if (urlOrKey.includes("amazonaws.com/")) {
			const urlParts = urlOrKey.split("amazonaws.com/");
			key = urlParts[1] ?? urlOrKey;
		} else if (urlOrKey.includes(config.awsS3Bucket)) {
			const bucketIndex = urlOrKey.indexOf(config.awsS3Bucket);
			key = urlOrKey.substring(bucketIndex + config.awsS3Bucket.length + 1);
		}

		const command = new DeleteObjectCommand({
			Bucket: config.awsS3Bucket,
			Key: key,
		});

		await s3Client.send(command);
	} catch (error) {
		console.error("Error deleting file from S3:", error);
	}
};

/**
 * Get the public URL for an S3 object
 */
export const getS3Url = (key: string): string => {
	return `https://${config.awsS3Bucket}.s3.${config.awsRegion}.amazonaws.com/${key}`;
};

export { s3Client };
