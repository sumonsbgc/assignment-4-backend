import { User } from "better-auth";

declare global {
	namespace Express {
		interface Request {
			user?: User & {
				role: string;
				phone?: string | null;
				status?: string | null;
			};
		}
	}
}
