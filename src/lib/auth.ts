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
	trustedOrigins: [config.appUrl],
	advanced: {
		useSecureCookies: true,
		cookiePrefix: "medishop",
		crossSubDomainCookies: {
			enabled: true,
		},
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
