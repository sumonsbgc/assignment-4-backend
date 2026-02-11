const getSlug = (name: string): string => {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
};

export async function hashPassword(password: string): Promise<string> {
	const crypto = await import("crypto");
	const salt = crypto.randomBytes(16).toString("hex");
	const hash = crypto
		.pbkdf2Sync(password, salt, 1000, 64, "sha512")
		.toString("hex");
	return `${salt}:${hash}`;
}

export async function verifyPassword(
	password: string,
	hashedPassword: string,
): Promise<boolean> {
	const crypto = await import("crypto");
	const [salt, hash] = hashedPassword.split(":");
	if (!salt || !hash) {
		return false;
	}
	const verifyHash = crypto
		.pbkdf2Sync(password, salt, 1000, 64, "sha512")
		.toString("hex");
	return hash === verifyHash;
}

export const helper = {
	getSlug,
	hashPassword,
	verifyPassword,
};
