# MediStore Backend

Express.js REST API for the MediStore medicine e-commerce platform.

## Tech Stack

- **Runtime:** Node.js (v22+)
- **Framework:** Express 5
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Better Auth (email/password + Google OAuth)
- **File Upload:** AWS S3 + Multer
- **Language:** TypeScript (ESM)

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Create a `.env` file:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/medistore
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:5000
FRONTEND_APP_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS S3 Configuration
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET=your-s3-bucket-name
```

### 3. AWS S3 Setup (for image uploads)

1. Create an S3 bucket in AWS Console
2. Disable "Block all public access" in bucket permissions
3. Add bucket policy for public read access:

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "PublicReadGetObject",
			"Effect": "Allow",
			"Principal": "*",
			"Action": "s3:GetObject",
			"Resource": "arn:aws:s3:::your-bucket-name/*"
		}
	]
}
```

4. Create IAM user with `AmazonS3FullAccess` policy and get access keys

### 4. Run database migrations

```bash
pnpm prisma:migrate
```

### 5. Seed the database

```bash
pnpm prisma:seed
```

### 6. Start the dev server

```bash
pnpm dev
```

Server runs at `http://localhost:5000`

## Scripts

| Command               | Description                      |
| --------------------- | -------------------------------- |
| `pnpm dev`            | Start dev server with hot reload |
| `pnpm build`          | Build for production             |
| `pnpm start`          | Run production build             |
| `pnpm prisma:migrate` | Run database migrations          |
| `pnpm prisma:seed`    | Seed database with sample data   |
| `pnpm prisma:studio`  | Open Prisma Studio               |

## API Endpoints

| Group      | Base Path         | Description                            |
| ---------- | ----------------- | -------------------------------------- |
| Auth       | `/api/auth/*`     | Register, login, session (Better Auth) |
| Users      | `/api/users`      | User management (Admin)                |
| Categories | `/api/categories` | Category CRUD                          |
| Medicines  | `/api/medicines`  | Medicine listing & CRUD                |
| Cart       | `/api/carts`      | Shopping cart operations               |
| Orders     | `/api/orders`     | Order placement & management           |
| Reviews    | `/api/reviews`    | Product reviews & ratings              |
| Dashboard  | `/api/dashboard`  | Role-based dashboard stats             |
| Contacts   | `/api/contacts`   | Contact form submissions               |
| Uploads    | `/api/uploads`    | Image uploads                          |

## Roles

- **Customer** — Browse, cart, orders, reviews
- **Seller** — Manage own medicines & fulfill orders
- **Admin** — Manage users, categories, and oversee platform

## Deployment (Render.com)

1. Connect your GitHub repository
2. Set build command: `pnpm build`
3. Set start command: `pnpm start`
4. Add environment variables:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL` (your Render URL)
   - `FRONTEND_APP_URL`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET`
