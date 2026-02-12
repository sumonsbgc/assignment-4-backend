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
	trustedOrigins: [
		config.appUrl,
		"http://localhost:3000",
		"http://localhost:3001",
	],
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60 * 24, // 1 day
		},
	},
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
