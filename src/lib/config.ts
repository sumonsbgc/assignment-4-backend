const config = {
	appUrl: process.env.FRONTEND_APP_URL || "http://localhost:3000",
	databaseUrl: process.env.DATABASE_URL || "",
	port: process.env.PORT || 5000,
	betterAuthUrl: process.env.BETTER_AUTH_URL || "http://localhost:5000",
	betterAuthSecret: process.env.BETTER_AUTH_SECRET || "",
	gclientId: process.env.GOOGLE_CLIENT_ID || "",
	gclientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
};

export default config;
