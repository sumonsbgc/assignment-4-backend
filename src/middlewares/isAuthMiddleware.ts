import { NextFunction, Request, Response } from "express";
import { auth } from "@/lib/auth";

export enum Role {
	ADMIN = "ADMIN",
	SELLER = "SELLER",
	CUSTOMER = "CUSTOMER",
}

type MiddlewareFunction = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<void>;

export const isAuth = (...roles: Role[]): MiddlewareFunction => {
	return async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const session = await auth.api.getSession({
				headers: req.headers as Record<string, string>,
			});

			console.log(session, "Session in isAuth Middleware");

			if (!session || !session.user) {
				res
					.status(401)
					.json({ success: false, message: "You are not authorized" });
				return;
			}

			// if (!session.user.emailVerified) {
			// 	res.status(403).json({
			// 		success: false,
			// 		message:
			// 			"Email Verification Required. Please verify your email address",
			// 	});
			// 	return;
			// }

			// Check if user is banned/suspended
			if (
				session.user.status === "SUSPENDED" ||
				session.user.status === "INACTIVE"
			) {
				res.status(403).json({
					success: false,
					message: "Your account has been suspended. Please contact support.",
				});
				return;
			}

			if (roles.length && !roles.includes(session.user.role as Role)) {
				res.status(403).json({
					success: false,
					message:
						"Forbidden! You do not have permission to access this resource",
				});
				return;
			}

			req.user = session.user;

			next();
		} catch (error) {
			next(error);
		}
	};
};
