import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import config from "./config.js";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	baseURL: config.betterAuthUrl,
	secret: config.betterAuthSecret,
	trustedOrigins: [
		config.appUrl,
		// "http://localhost:3000",
		// "http://localhost:3001",
	],
	// session: {
	// 	cookieCache: {
	// 		enabled: true,
	// 		maxAge: 5 * 60, // 5 minutes
	// 	},
	// },
	// advanced: {
	// 	cookiePrefix: "better-auth",
	// 	useSecureCookies: process.env.NODE_ENV === "production",
	// },
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
		requireEmailVerification: false,
	},
	socialProviders: {
		google: {
			clientId: config.gclientId,
			clientSecret: config.gclientSecret,
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
