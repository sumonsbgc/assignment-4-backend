const config = {
	port: process.env.PORT || 5000,
	databaseUrl: process.env.DATABASE_URL || "",
	betterAuthSecret: process.env.BETTER_AUTH_SECRET || "",
	gclientId: process.env.GOOGLE_CLIENT_ID || "",
	gclientSecret: process.env.GOOGLE_CLIENT_SECRET || "",

	appUrl: process.env.FRONTEND_APP_URL || "http://localhost:3000",
	betterAuthUrl: process.env.BETTER_AUTH_URL || "http://localhost:5000",
};

export default config;
