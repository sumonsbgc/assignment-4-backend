import type { Request, Response, NextFunction, RequestHandler } from "express";
import { categoryService } from "./category.services";
import type { CreateCategoryDto, UpdateCategoryDto } from "./category.types";

class CategoryController {
	private service = categoryService;

	index: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			console.log("Category Controller", req.query);
			const { isActive, parentId, search } = req.query;

			const filters: any = {
				parentId: parentId === "null" ? null : (parentId as string | undefined),
				search: search as string | undefined,
			};

			if (isActive === "true" || isActive === "false") {
				filters.isActive = isActive === "true";
			}

			const categories = await this.service.getCategories(filters);

			res.status(200).json({
				success: true,
				data: categories,
			});
		} catch (error) {
			next(error);
		}
	};

	getById: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { id } = req.params;

			const category = await this.service.getCategoryById(String(id));

			if (!category) {
				return res.status(404).json({
					success: false,
					message: "Category not found",
				});
			}

			res.status(200).json({
				success: true,
				data: category,
			});
		} catch (error) {
			next(error);
		}
	};

	getBySlug: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { slug } = req.params;

			const category = await this.service.getCategoryBySlug(String(slug));

			if (!category) {
				return res.status(404).json({
					success: false,
					message: "Category not found",
				});
			}

			res.status(200).json({
				success: true,
				data: category,
			});
		} catch (error) {
			next(error);
		}
	};

	store: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const data: CreateCategoryDto = req.body;

			const category = await this.service.createCategory(data);

			res.status(201).json({
				success: true,
				message: "Category created successfully",
				data: category,
			});
		} catch (error) {
			next(error);
		}
	};

	update: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { id } = req.params;
			const data: UpdateCategoryDto = req.body;

			const category = await this.service.updateCategory(String(id), data);

			res.status(200).json({
				success: true,
				message: "Category updated successfully",
				data: category,
			});
		} catch (error) {
			next(error);
		}
	};

	delete: RequestHandler = async (
		req: Request,
		res: Response,
		next: NextFunction,
	) => {
		try {
			const { id } = req.params;

			await this.service.deleteCategory(String(id));

			res.status(200).json({
				success: true,
				message: "Category deleted successfully",
			});
		} catch (error) {
			next(error);
		}
	};
}

const categoryController = new CategoryController();

export { categoryController };
