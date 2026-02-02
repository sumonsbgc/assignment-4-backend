import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import config from "./config";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	trustedOrigins: [config.appUrl || "http://localhost:3000"],
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
