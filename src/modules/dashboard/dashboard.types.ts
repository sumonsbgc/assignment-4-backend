// ─── Customer Dashboard ───

export interface CustomerDashboardResponse {
	orders: {
		total: number;
		pending: number;
		confirmed: number;
		processing: number;
		shipped: number;
		delivered: number;
		cancelled: number;
	};
	spending: {
		totalSpent: number;
		averageOrderValue: number;
		thisMonth: number;
		lastMonth: number;
	};
	cart: {
		itemCount: number;
		cartTotal: number;
	};
	reviews: {
		total: number;
		averageRating: number;
	};
	recentOrders: {
		id: string;
		orderNumber: string;
		status: string;
		totalAmount: number;
		createdAt: Date;
		itemCount: number;
	}[];
}

// ─── Seller Dashboard ───

export interface SellerDashboardResponse {
	products: {
		total: number;
		active: number;
		inactive: number;
		featured: number;
		outOfStock: number;
		lowStock: number;
	};
	revenue: {
		totalRevenue: number;
		thisMonth: number;
		lastMonth: number;
		averageOrderItemValue: number;
	};
	orders: {
		totalOrderItems: number;
		pending: number;
		processing: number;
		shipped: number;
		delivered: number;
		cancelled: number;
	};
	reviews: {
		total: number;
		averageRating: number;
		reported: number;
	};
	lowStockProducts: {
		id: string;
		name: string;
		slug: string;
		stockQuantity: number;
		lowStockThreshold: number;
	}[];
	topSellingProducts: {
		id: string;
		name: string;
		slug: string;
		totalSold: number;
		revenue: number;
	}[];
}

// ─── Admin Dashboard ───

export interface AdminDashboardResponse {
	users: {
		total: number;
		customers: number;
		sellers: number;
		admins: number;
		activeUsers: number;
		bannedUsers: number;
		newThisMonth: number;
	};
	medicines: {
		total: number;
		active: number;
		inactive: number;
		featured: number;
		outOfStock: number;
		lowStock: number;
	};
	orders: {
		total: number;
		pending: number;
		confirmed: number;
		processing: number;
		shipped: number;
		delivered: number;
		cancelled: number;
		returned: number;
	};
	revenue: {
		totalRevenue: number;
		thisMonth: number;
		lastMonth: number;
		totalPaid: number;
		totalUnpaid: number;
	};
	categories: {
		total: number;
		active: number;
	};
	reviews: {
		total: number;
		averageRating: number;
		reported: number;
		unapproved: number;
	};
	recentOrders: {
		id: string;
		orderNumber: string;
		status: string;
		totalAmount: number;
		paymentStatus: string;
		createdAt: Date;
		user: { id: string; name: string; email: string };
	}[];
}
