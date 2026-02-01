const getSlug = (name: string): string => {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
};

export const helper = {
	getSlug,
};
