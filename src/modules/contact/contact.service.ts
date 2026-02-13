import { prisma } from "../../lib/prisma";
import type { CreateContactDto, ContactFilters } from "./contact.types.js";

class ContactService {
	createContact = async (data: CreateContactDto) => {
		return await prisma.contact.create({
			data: {
				name: data.name,
				email: data.email,
				phone: data.phone || null,
				subject: data.subject,
				message: data.message,
			},
		});
	};

	getContacts = async (filters: ContactFilters) => {
		const page = filters.page || 1;
		const limit = filters.limit || 10;
		const skip = (page - 1) * limit;

		const where: any = {};

		if (filters.status) {
			where.status = filters.status;
		}

		if (filters.search) {
			where.OR = [
				{ name: { contains: filters.search, mode: "insensitive" } },
				{ email: { contains: filters.search, mode: "insensitive" } },
				{ subject: { contains: filters.search, mode: "insensitive" } },
			];
		}

		const [contacts, total] = await Promise.all([
			prisma.contact.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.contact.count({ where }),
		]);

		return {
			contacts,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	};

	getContactById = async (id: string) => {
		return await prisma.contact.findUnique({ where: { id } });
	};

	updateContactStatus = async (id: string, status: string) => {
		const contact = await prisma.contact.findUnique({ where: { id } });
		if (!contact) {
			throw new Error("Contact message not found");
		}

		return await prisma.contact.update({
			where: { id },
			data: { status },
		});
	};

	deleteContact = async (id: string) => {
		const contact = await prisma.contact.findUnique({ where: { id } });
		if (!contact) {
			throw new Error("Contact message not found");
		}

		return await prisma.contact.delete({ where: { id } });
	};
}

export const contactService = new ContactService();
