import type { Request, Response, NextFunction, RequestHandler } from "express";
import { contactService } from "./contact.service.js";
import type { CreateContactDto } from "./contact.types.js";

class ContactController {
	createContact: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const data: CreateContactDto = req.body;

			if (!data.name || !data.email || !data.subject || !data.message) {
				return res.status(400).json({
					success: false,
					message: "Name, email, subject and message are required",
				});
			}

			const contact = await contactService.createContact(data);

			res.status(201).json({
				success: true,
				message: "Message sent successfully",
				data: contact,
			});
		} catch (error) {
			next(error);
		}
	};

	getContacts: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 10;
			const status = req.query.status as string;
			const search = req.query.search as string;

			const result = await contactService.getContacts({
				page,
				limit,
				status,
				search,
			});

			res.json({
				success: true,
				data: result.contacts,
				pagination: result.pagination,
			});
		} catch (error) {
			next(error);
		}
	};

	getContactById: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { id } = req.params;
			const contact = await contactService.getContactById(id as string);

			if (!contact) {
				return res.status(404).json({
					success: false,
					message: "Contact message not found",
				});
			}

			res.json({
				success: true,
				data: contact,
			});
		} catch (error) {
			next(error);
		}
	};

	updateContactStatus: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { status } = req.body;
			const { id } = req.params;

			if (!["UNREAD", "READ", "REPLIED"].includes(status)) {
				return res.status(400).json({
					success: false,
					message: "Invalid status. Must be UNREAD, READ, or REPLIED",
				});
			}

			const contact = await contactService.updateContactStatus(
				id as string,
				status,
			);

			res.json({
				success: true,
				message: "Status updated successfully",
				data: contact,
			});
		} catch (error: any) {
			if (error.message === "Contact message not found") {
				return res.status(404).json({
					success: false,
					message: error.message,
				});
			}
			next(error);
		}
	};

	deleteContact: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { id } = req.params;
			await contactService.deleteContact(id as string);

			res.json({
				success: true,
				message: "Contact message deleted successfully",
			});
		} catch (error: any) {
			if (error.message === "Contact message not found") {
				return res.status(404).json({
					success: false,
					message: error.message,
				});
			}
			next(error);
		}
	};
}

export const contactController = new ContactController();
