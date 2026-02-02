export enum UserRole {
	CUSTOMER = "CUSTOMER",
	SELLER = "SELLER",
	ADMIN = "ADMIN",
}

export enum UserStatus {
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
	SUSPENDED = "SUSPENDED",
}

export interface CreateUserDto {
	name: string;
	email: string;
	password: string;
	role?: UserRole;
	phone?: string;
	image?: string;
	emailVerified?: boolean;
	status?: UserStatus;
}

export interface UpdateUserDto {
	name?: string;
	email?: string;
	phone?: string;
	image?: string;
	role?: UserRole;
	status?: UserStatus;
	emailVerified?: boolean;
}

export interface UserResponse {
	id: string;
	name: string;
	email: string;
	role: string;
	phone?: string;
	image?: string;
	status: string;
	emailVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
}
