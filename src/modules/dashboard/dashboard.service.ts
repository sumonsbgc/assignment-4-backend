import { prisma } from "@lib/prisma";
import type {
	CustomerDashboardResponse,
	SellerDashboardResponse,
	AdminDashboardResponse,
} from "./dashboard.types.js";

class DashboardService {
	// ─── Customer Dashboard ───

	getCustomerDashboard = async (
		userId: string,
	): Promise<CustomerDashboardResponse> => {
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

		const [
			orderCounts,
			totalSpentResult,
			thisMonthSpent,
			lastMonthSpent,
			cartItems,
			reviewStats,
			recentOrders,
		] = await Promise.all([
			// Order counts by status
			prisma.order.groupBy({
				by: ["status"],
				where: { userId },
				_count: { id: true },
			}),

			// Total spent (delivered orders)
			prisma.order.aggregate({
				where: { userId, status: "DELIVERED" },
				_sum: { totalAmount: true },
				_avg: { totalAmount: true },
				_count: { id: true },
			}),

			// This month's spending
			prisma.order.aggregate({
				where: {
					userId,
					status: {
						in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
					},
					createdAt: { gte: startOfMonth },
				},
				_sum: { totalAmount: true },
			}),

			// Last month's spending
			prisma.order.aggregate({
				where: {
					userId,
					status: {
						in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
					},
					createdAt: { gte: startOfLastMonth, lt: startOfMonth },
				},
				_sum: { totalAmount: true },
			}),

			// Cart summary
			prisma.cart.findMany({
				where: { userId },
				include: {
					medicine: {
						select: { price: true, discountPrice: true },
					},
				},
			}),

			// Review stats
			prisma.review.aggregate({
				where: { userId, parentId: null },
				_count: { id: true },
				_avg: { rating: true },
			}),

			// Recent orders (last 5)
			prisma.order.findMany({
				where: { userId },
				select: {
					id: true,
					orderNumber: true,
					status: true,
					totalAmount: true,
					createdAt: true,
					_count: { select: { orderItems: true } },
				},
				orderBy: { createdAt: "desc" },
				take: 5,
			}),
		]);

		// Parse order counts
		const statusMap: Record<string, number> = {};
		for (const row of orderCounts) {
			statusMap[row.status] = row._count.id;
		}
		const totalOrders = Object.values(statusMap).reduce((a, b) => a + b, 0);

		// Cart total
		const cartTotal = cartItems.reduce((sum, item) => {
			const price = item.medicine.discountPrice || item.medicine.price;
			return sum + price * item.quantity;
		}, 0);

		return {
			orders: {
				total: totalOrders,
				pending: statusMap["PENDING"] || 0,
				confirmed: statusMap["CONFIRMED"] || 0,
				processing: statusMap["PROCESSING"] || 0,
				shipped: statusMap["SHIPPED"] || 0,
				delivered: statusMap["DELIVERED"] || 0,
				cancelled: statusMap["CANCELLED"] || 0,
			},
			spending: {
				totalSpent: totalSpentResult._sum.totalAmount || 0,
				averageOrderValue: totalSpentResult._avg.totalAmount || 0,
				thisMonth: thisMonthSpent._sum.totalAmount || 0,
				lastMonth: lastMonthSpent._sum.totalAmount || 0,
			},
			cart: {
				itemCount: cartItems.length,
				cartTotal: Math.round(cartTotal * 100) / 100,
			},
			reviews: {
				total: reviewStats._count.id,
				averageRating: reviewStats._avg.rating || 0,
			},
			recentOrders: recentOrders.map((order) => ({
				id: order.id,
				orderNumber: order.orderNumber,
				status: order.status,
				totalAmount: order.totalAmount,
				createdAt: order.createdAt,
				itemCount: order._count.orderItems,
			})),
		};
	};

	// ─── Seller Dashboard ───

	getSellerDashboard = async (
		sellerId: string,
	): Promise<SellerDashboardResponse> => {
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

		const [
			productCounts,
			outOfStockCount,
			lowStockProducts,
			orderItemStats,
			thisMonthRevenue,
			lastMonthRevenue,
			orderStatusCounts,
			reviewStats,
			topSellingProducts,
		] = await Promise.all([
			// Product counts
			prisma.medicine.groupBy({
				by: ["isActive", "isFeatured"],
				where: { sellerId },
				_count: { id: true },
			}),

			// Out of stock count
			prisma.medicine.count({
				where: { sellerId, stockQuantity: { lte: 0 } },
			}),

			// Low stock products
			prisma.medicine.findMany({
				where: {
					sellerId,
					stockQuantity: { gt: 0, lte: 10 },
				},
				select: {
					id: true,
					name: true,
					slug: true,
					stockQuantity: true,
					lowStockThreshold: true,
				},
				orderBy: { stockQuantity: "asc" },
				take: 10,
			}),

			// Total revenue from order items (all time, delivered)
			prisma.orderItem.aggregate({
				where: {
					medicine: { sellerId },
					order: { status: "DELIVERED" },
				},
				_sum: { subtotal: true },
				_avg: { subtotal: true },
				_count: { id: true },
			}),

			// This month revenue
			prisma.orderItem.aggregate({
				where: {
					medicine: { sellerId },
					order: {
						status: {
							in: [
								"PENDING",
								"CONFIRMED",
								"PROCESSING",
								"SHIPPED",
								"DELIVERED",
							],
						},
						createdAt: { gte: startOfMonth },
					},
				},
				_sum: { subtotal: true },
			}),

			// Last month revenue
			prisma.orderItem.aggregate({
				where: {
					medicine: { sellerId },
					order: {
						status: {
							in: [
								"PENDING",
								"CONFIRMED",
								"PROCESSING",
								"SHIPPED",
								"DELIVERED",
							],
						},
						createdAt: { gte: startOfLastMonth, lt: startOfMonth },
					},
				},
				_sum: { subtotal: true },
			}),

			// Order status counts (orders containing this seller's items)
			prisma.order.groupBy({
				by: ["status"],
				where: {
					orderItems: {
						some: { medicine: { sellerId } },
					},
				},
				_count: { id: true },
			}),

			// Review stats on seller's medicines
			prisma.review.aggregate({
				where: {
					medicine: { sellerId },
					parentId: null,
				},
				_count: { id: true },
				_avg: { rating: true },
			}),

			// Top selling products (by quantity sold in delivered orders)
			prisma.orderItem.groupBy({
				by: ["medicineId"],
				where: {
					medicine: { sellerId },
					order: { status: "DELIVERED" },
				},
				_sum: { quantity: true, subtotal: true },
				orderBy: { _sum: { quantity: "desc" } },
				take: 5,
			}),
		]);

		// Parse product counts
		let totalProducts = 0;
		let activeProducts = 0;
		let featuredProducts = 0;
		for (const row of productCounts) {
			const count = row._count.id;
			totalProducts += count;
			if (row.isActive) activeProducts += count;
			if (row.isFeatured) featuredProducts += count;
		}

		// Parse order status counts
		const orderStatusMap: Record<string, number> = {};
		for (const row of orderStatusCounts) {
			orderStatusMap[row.status] = row._count.id;
		}

		// Reported reviews count
		const reportedReviews = await prisma.review.count({
			where: {
				medicine: { sellerId },
				isReported: true,
			},
		});

		// Enrich top selling products with names
		const topProductIds = topSellingProducts.map((p) => p.medicineId);
		const topProductDetails =
			topProductIds.length > 0
				? await prisma.medicine.findMany({
						where: { id: { in: topProductIds } },
						select: { id: true, name: true, slug: true },
					})
				: [];
		const productDetailMap = new Map(topProductDetails.map((p) => [p.id, p]));

		return {
			products: {
				total: totalProducts,
				active: activeProducts,
				inactive: totalProducts - activeProducts,
				featured: featuredProducts,
				outOfStock: outOfStockCount,
				lowStock: lowStockProducts.length,
			},
			revenue: {
				totalRevenue: orderItemStats._sum.subtotal || 0,
				thisMonth: thisMonthRevenue._sum.subtotal || 0,
				lastMonth: lastMonthRevenue._sum.subtotal || 0,
				averageOrderItemValue: orderItemStats._avg.subtotal || 0,
			},
			orders: {
				totalOrderItems: orderItemStats._count.id,
				pending: orderStatusMap["PENDING"] || 0,
				processing: orderStatusMap["PROCESSING"] || 0,
				shipped: orderStatusMap["SHIPPED"] || 0,
				delivered: orderStatusMap["DELIVERED"] || 0,
				cancelled: orderStatusMap["CANCELLED"] || 0,
			},
			reviews: {
				total: reviewStats._count.id,
				averageRating: reviewStats._avg.rating || 0,
				reported: reportedReviews,
			},
			lowStockProducts,
			topSellingProducts: topSellingProducts.map((p) => {
				const detail = productDetailMap.get(p.medicineId);
				return {
					id: p.medicineId,
					name: detail?.name || "",
					slug: detail?.slug || "",
					totalSold: p._sum.quantity || 0,
					revenue: p._sum.subtotal || 0,
				};
			}),
		};
	};

	// ─── Admin Dashboard ───

	getAdminDashboard = async (): Promise<AdminDashboardResponse> => {
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

		const [
			userCounts,
			userStatusCounts,
			newUsersThisMonth,
			medicineCounts,
			outOfStockCount,
			lowStockCount,
			orderStatusCounts,
			revenueStats,
			thisMonthRevenue,
			lastMonthRevenue,
			paymentStatusCounts,
			categoryCounts,
			reviewStats,
			reportedReviews,
			unapprovedReviews,
			recentOrders,
		] = await Promise.all([
			// User counts by role
			prisma.user.groupBy({
				by: ["role"],
				_count: { id: true },
			}),

			// User status counts
			prisma.user.groupBy({
				by: ["status"],
				_count: { id: true },
			}),

			// New users this month
			prisma.user.count({
				where: { createdAt: { gte: startOfMonth } },
			}),

			// Medicine counts
			prisma.medicine.groupBy({
				by: ["isActive", "isFeatured"],
				_count: { id: true },
			}),

			// Out of stock
			prisma.medicine.count({
				where: { stockQuantity: { lte: 0 } },
			}),

			// Low stock
			prisma.medicine.count({
				where: { stockQuantity: { gt: 0, lte: 10 } },
			}),

			// Order counts by status
			prisma.order.groupBy({
				by: ["status"],
				_count: { id: true },
			}),

			// Total revenue (delivered)
			prisma.order.aggregate({
				where: { status: "DELIVERED" },
				_sum: { totalAmount: true },
			}),

			// This month revenue
			prisma.order.aggregate({
				where: {
					status: {
						in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
					},
					createdAt: { gte: startOfMonth },
				},
				_sum: { totalAmount: true },
			}),

			// Last month revenue
			prisma.order.aggregate({
				where: {
					status: {
						in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
					},
					createdAt: { gte: startOfLastMonth, lt: startOfMonth },
				},
				_sum: { totalAmount: true },
			}),

			// Payment status counts
			prisma.order.groupBy({
				by: ["paymentStatus"],
				_sum: { totalAmount: true },
			}),

			// Category counts
			prisma.category.aggregate({
				_count: { id: true },
			}),

			// Active categories
			prisma.review.aggregate({
				where: { parentId: null },
				_count: { id: true },
				_avg: { rating: true },
			}),

			// Reported reviews
			prisma.review.count({ where: { isReported: true } }),

			// Unapproved reviews
			prisma.review.count({ where: { isApproved: false } }),

			// Recent orders
			prisma.order.findMany({
				select: {
					id: true,
					orderNumber: true,
					status: true,
					totalAmount: true,
					paymentStatus: true,
					createdAt: true,
					user: {
						select: { id: true, name: true, email: true },
					},
				},
				orderBy: { createdAt: "desc" },
				take: 10,
			}),
		]);

		// Parse user counts
		const roleMap: Record<string, number> = {};
		for (const row of userCounts) {
			roleMap[row.role || "CUSTOMER"] = row._count.id;
		}
		const totalUsers = Object.values(roleMap).reduce((a, b) => a + b, 0);

		// Parse user status
		const statusMap: Record<string, number> = {};
		for (const row of userStatusCounts) {
			statusMap[row.status || "ACTIVE"] = row._count.id;
		}

		// Parse medicine counts
		let totalMedicines = 0;
		let activeMedicines = 0;
		let featuredMedicines = 0;
		for (const row of medicineCounts) {
			const count = row._count.id;
			totalMedicines += count;
			if (row.isActive) activeMedicines += count;
			if (row.isFeatured) featuredMedicines += count;
		}

		// Parse order status
		const orderMap: Record<string, number> = {};
		let totalOrders = 0;
		for (const row of orderStatusCounts) {
			orderMap[row.status] = row._count.id;
			totalOrders += row._count.id;
		}

		// Parse payment status
		const paymentMap: Record<string, number> = {};
		for (const row of paymentStatusCounts) {
			paymentMap[row.paymentStatus] = row._sum.totalAmount || 0;
		}

		// Active categories count
		const activeCategories = await prisma.category.count({
			where: { isActive: true },
		});

		return {
			users: {
				total: totalUsers,
				customers: roleMap["CUSTOMER"] || 0,
				sellers: roleMap["SELLER"] || 0,
				admins: roleMap["ADMIN"] || 0,
				activeUsers: statusMap["ACTIVE"] || 0,
				bannedUsers: statusMap["BANNED"] || 0,
				newThisMonth: newUsersThisMonth,
			},
			medicines: {
				total: totalMedicines,
				active: activeMedicines,
				inactive: totalMedicines - activeMedicines,
				featured: featuredMedicines,
				outOfStock: outOfStockCount,
				lowStock: lowStockCount,
			},
			orders: {
				total: totalOrders,
				pending: orderMap["PENDING"] || 0,
				confirmed: orderMap["CONFIRMED"] || 0,
				processing: orderMap["PROCESSING"] || 0,
				shipped: orderMap["SHIPPED"] || 0,
				delivered: orderMap["DELIVERED"] || 0,
				cancelled: orderMap["CANCELLED"] || 0,
				returned: orderMap["RETURNED"] || 0,
			},
			revenue: {
				totalRevenue: revenueStats._sum.totalAmount || 0,
				thisMonth: thisMonthRevenue._sum.totalAmount || 0,
				lastMonth: lastMonthRevenue._sum.totalAmount || 0,
				totalPaid: paymentMap["PAID"] || 0,
				totalUnpaid: paymentMap["UNPAID"] || 0,
			},
			categories: {
				total: categoryCounts._count.id,
				active: activeCategories,
			},
			reviews: {
				total: reviewStats._count.id,
				averageRating: reviewStats._avg.rating || 0,
				reported: reportedReviews,
				unapproved: unapprovedReviews,
			},
			recentOrders,
		};
	};
}

const dashboardService = new DashboardService();
export { dashboardService };
