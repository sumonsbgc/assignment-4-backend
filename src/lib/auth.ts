import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import config from "./config.js";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	baseURL: config.betterAuthUrl,
	secret: config.betterAuthSecret,
	// trustedOrigins: [config.appUrl],
	trustedOrigins: async (request) => {
		const origin = request?.headers.get("origin");

		const allowedOrigins = [
			config.appUrl,
			config.betterAuthUrl,
			"http://localhost:3000",
			"http://localhost:4000",
			"http://localhost:5000",
			"https://assignment-4-frontend-ruddy.vercel.app",
			"https://backend-ten-theta-88.vercel.app",
		].filter(Boolean);

		// Check if origin matches allowed origins or Vercel pattern
		if (
			!origin ||
			allowedOrigins.includes(origin) ||
			/^https:\/\/.*\.vercel\.app$/.test(origin)
		) {
			return [origin];
		}

		return [];
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
	},
	advanced: {
		cookiePrefix: "better-auth",
		useSecureCookies: process.env.NODE_ENV === "production",
		crossSubDomainCookies: {
			enabled: false,
		},
		disableCSRFCheck: true, // Allow requests without Origin header (Postman, mobile apps, etc.)
	},
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
		requireEmailVerification: false,
	},
	socialProviders: {
		google: {
			enabled: true,
			clientId: config.gclientId,
			clientSecret: config.gclientSecret,
			redirectURI: `${config.betterAuthUrl}/api/auth/callback/google`,
		},
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				defaultValue: "CUSTOMER",
				required: false,
			},
			phone: {
				type: "string",
				required: false,
			},
			status: {
				type: "string",
				defaultValue: "ACTIVE",
				required: false,
			},
		},
	},
});
