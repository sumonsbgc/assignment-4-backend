import { auth } from "./lib/auth.js";
import { User } from "better-auth";

type Session = typeof auth.$Infer.Session;

declare global {
	namespace Express {
		interface Request {
			user?: Session["user"];
			user?: User & {
				role: string;
				phone?: string | null;
				status?: string | null;
			};
		}
	}
}
