// src/app.ts
import express from "express";
import cors from "cors";

// src/modules/category/category.routes.ts
import { Router } from "express";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// prisma/generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// prisma/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.4.0",
  "engineVersion": "ab56fe763f921d033a6c195e7ddeb3e255bdbb57",
  "activeProvider": "postgresql",
  "inlineSchema": `model Cart {
  id         String   @id @default(cuid())
  userId     String
  medicineId String
  quantity   Int      @default(1)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  medicine Medicine @relation(fields: [medicineId], references: [id], onDelete: Cascade)

  @@unique([userId, medicineId]) // A user can have only one cart item per medicine
  @@index([userId])
  @@index([medicineId])
  @@map("cart")
}

model Category {
  id          String  @id @default(cuid())
  name        String
  slug        String  @unique
  description String?
  image       String?
  isActive    Boolean @default(true)
  order       Int     @default(0)

  parentId String?
  parent   Category?  @relation("CategoryToCategory", fields: [parentId], references: [id], onDelete: Cascade)
  children Category[] @relation("CategoryToCategory")

  medicines Medicine[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([parentId])
  @@index([slug])
  @@map("category")
}

model Medicine {
  id           String  @id @default(cuid())
  name         String
  slug         String  @unique
  sku          String? @unique // Stock Keeping Unit
  description  String?
  genericName  String?
  manufacturer String

  // Pricing & Stock
  price              Float
  discountPrice      Float?
  discountPercentage Float? // Calculated discount %
  stockQuantity      Int    @default(0)
  lowStockThreshold  Int    @default(10) // Alert when stock is low
  unit               String @default("pcs") // pcs, bottle, box, strip, pack

  // Product Details
  imageUrl   String?
  images     String[] // Multiple images as array
  dosageForm String? // tablet, capsule, syrup, injection, cream, ointment
  strength   String? // e.g., "500mg", "10ml", "5%"
  packSize   String? // e.g., "10 tablets", "100ml bottle"

  // Safety & Compliance
  requiresPrescription Boolean   @default(false) // Even if all OTC, good to have
  expiryDate           DateTime? // Important for medicines!
  ingredients          String? // Active ingredients
  sideEffects          String? // Possible side effects
  warnings             String? // Usage warnings
  storage              String? // Storage instructions

  // Relations
  categoryId String
  category   Category    @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  sellerId   String
  seller     User        @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  carts      Cart[] // Cart items
  orderItems OrderItem[] // Order items
  reviews    Review[] // Medicine reviews

  // Status
  isActive   Boolean @default(true)
  isFeatured Boolean @default(false) // For homepage display

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([categoryId])
  @@index([sellerId])
  @@index([slug])
  @@index([sku])
  @@map("medicine")
}

model Order {
  id          String      @id @default(cuid())
  orderNumber String      @unique
  userId      String
  status      OrderStatus @default(PENDING)

  // Pricing
  subtotal     Float // Sum of all items
  shippingCost Float @default(0)
  tax          Float @default(0)
  totalAmount  Float // subtotal + shipping + tax
  discount     Float @default(0)

  // Shipping Information
  shippingAddress String
  city            String
  state           String?
  zipCode         String
  country         String  @default("Bangladesh")
  phone           String

  // Payment Information
  paymentMethod String // COD, Card, Mobile Banking
  paymentStatus PaymentStatus @default(UNPAID)
  paidAt        DateTime?

  // Additional Info
  notes          String?
  trackingNumber String?

  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deliveredAt DateTime?
  cancelledAt DateTime?

  // Relations
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  orderItems OrderItem[]

  @@index([userId])
  @@index([orderNumber])
  @@index([status])
  @@index([createdAt])
  @@map("order")
}

model OrderItem {
  id         String @id @default(cuid())
  orderId    String
  medicineId String
  quantity   Int
  price      Float // Price at the time of order
  discount   Float  @default(0)
  subtotal   Float // quantity * (price - discount)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  order    Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  medicine Medicine @relation(fields: [medicineId], references: [id], onDelete: Restrict)

  @@index([orderId])
  @@index([medicineId])
  @@map("order_item")
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  RETURNED
}

enum PaymentStatus {
  UNPAID
  PAID
  FAILED
  REFUNDED
}

model Review {
  id         String  @id @default(cuid())
  userId     String
  medicineId String
  rating     Int? // 1-5 stars (null for replies)
  title      String?
  comment    String?
  isVerified Boolean @default(false) // Verified purchase

  // Parent-Child relationship for replies
  parentId String? // Null for main reviews, set for replies
  parent   Review?  @relation("ReviewReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies  Review[] @relation("ReviewReplies")

  // Moderation
  isApproved Boolean @default(true)
  isReported Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  medicine Medicine @relation(fields: [medicineId], references: [id], onDelete: Cascade)

  @@unique([userId, medicineId, parentId]) // One main review per user per medicine, multiple replies allowed
  @@index([medicineId])
  @@index([userId])
  @@index([rating])
  @@index([parentId])
  @@map("review")
}

// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id            String     @id
  name          String
  email         String
  emailVerified Boolean    @default(false)
  image         String?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  role          String?    @default("CUSTOMER")
  phone         String?
  status        String?    @default("ACTIVE")
  sessions      Session[]
  accounts      Account[]
  medicines     Medicine[] // Medicines added by seller
  carts         Cart[] // User's shopping cart
  orders        Order[] // User's orders
  reviews       Review[] // User's reviews

  @@unique([email])
  @@map("user")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId])
  @@map("account")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
  @@map("verification")
}
`,
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Cart":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"CartToUser"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"CartToMedicine"}],"dbName":"cart"},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"image","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"order","kind":"scalar","type":"Int"},{"name":"parentId","kind":"scalar","type":"String"},{"name":"parent","kind":"object","type":"Category","relationName":"CategoryToCategory"},{"name":"children","kind":"object","type":"Category","relationName":"CategoryToCategory"},{"name":"medicines","kind":"object","type":"Medicine","relationName":"CategoryToMedicine"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"category"},"Medicine":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"sku","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"genericName","kind":"scalar","type":"String"},{"name":"manufacturer","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"discountPrice","kind":"scalar","type":"Float"},{"name":"discountPercentage","kind":"scalar","type":"Float"},{"name":"stockQuantity","kind":"scalar","type":"Int"},{"name":"lowStockThreshold","kind":"scalar","type":"Int"},{"name":"unit","kind":"scalar","type":"String"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"images","kind":"scalar","type":"String"},{"name":"dosageForm","kind":"scalar","type":"String"},{"name":"strength","kind":"scalar","type":"String"},{"name":"packSize","kind":"scalar","type":"String"},{"name":"requiresPrescription","kind":"scalar","type":"Boolean"},{"name":"expiryDate","kind":"scalar","type":"DateTime"},{"name":"ingredients","kind":"scalar","type":"String"},{"name":"sideEffects","kind":"scalar","type":"String"},{"name":"warnings","kind":"scalar","type":"String"},{"name":"storage","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToMedicine"},{"name":"sellerId","kind":"scalar","type":"String"},{"name":"seller","kind":"object","type":"User","relationName":"MedicineToUser"},{"name":"carts","kind":"object","type":"Cart","relationName":"CartToMedicine"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"MedicineToOrderItem"},{"name":"reviews","kind":"object","type":"Review","relationName":"MedicineToReview"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"isFeatured","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"medicine"},"Order":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderNumber","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"subtotal","kind":"scalar","type":"Float"},{"name":"shippingCost","kind":"scalar","type":"Float"},{"name":"tax","kind":"scalar","type":"Float"},{"name":"totalAmount","kind":"scalar","type":"Float"},{"name":"discount","kind":"scalar","type":"Float"},{"name":"shippingAddress","kind":"scalar","type":"String"},{"name":"city","kind":"scalar","type":"String"},{"name":"state","kind":"scalar","type":"String"},{"name":"zipCode","kind":"scalar","type":"String"},{"name":"country","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"paymentMethod","kind":"scalar","type":"String"},{"name":"paymentStatus","kind":"enum","type":"PaymentStatus"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"notes","kind":"scalar","type":"String"},{"name":"trackingNumber","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deliveredAt","kind":"scalar","type":"DateTime"},{"name":"cancelledAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"OrderToUser"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"OrderToOrderItem"}],"dbName":"order"},"OrderItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"price","kind":"scalar","type":"Float"},{"name":"discount","kind":"scalar","type":"Float"},{"name":"subtotal","kind":"scalar","type":"Float"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToOrderItem"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"MedicineToOrderItem"}],"dbName":"order_item"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"medicineId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"title","kind":"scalar","type":"String"},{"name":"comment","kind":"scalar","type":"String"},{"name":"isVerified","kind":"scalar","type":"Boolean"},{"name":"parentId","kind":"scalar","type":"String"},{"name":"parent","kind":"object","type":"Review","relationName":"ReviewReplies"},{"name":"replies","kind":"object","type":"Review","relationName":"ReviewReplies"},{"name":"isApproved","kind":"scalar","type":"Boolean"},{"name":"isReported","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"medicine","kind":"object","type":"Medicine","relationName":"MedicineToReview"}],"dbName":"review"},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"role","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"medicines","kind":"object","type":"Medicine","relationName":"MedicineToUser"},{"name":"carts","kind":"object","type":"Cart","relationName":"CartToUser"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","parent","children","medicines","_count","category","seller","carts","orderItems","order","medicine","replies","reviews","orders","Cart.findUnique","Cart.findUniqueOrThrow","Cart.findFirst","Cart.findFirstOrThrow","Cart.findMany","data","Cart.createOne","Cart.createMany","Cart.createManyAndReturn","Cart.updateOne","Cart.updateMany","Cart.updateManyAndReturn","create","update","Cart.upsertOne","Cart.deleteOne","Cart.deleteMany","having","_avg","_sum","_min","_max","Cart.groupBy","Cart.aggregate","Category.findUnique","Category.findUniqueOrThrow","Category.findFirst","Category.findFirstOrThrow","Category.findMany","Category.createOne","Category.createMany","Category.createManyAndReturn","Category.updateOne","Category.updateMany","Category.updateManyAndReturn","Category.upsertOne","Category.deleteOne","Category.deleteMany","Category.groupBy","Category.aggregate","Medicine.findUnique","Medicine.findUniqueOrThrow","Medicine.findFirst","Medicine.findFirstOrThrow","Medicine.findMany","Medicine.createOne","Medicine.createMany","Medicine.createManyAndReturn","Medicine.updateOne","Medicine.updateMany","Medicine.updateManyAndReturn","Medicine.upsertOne","Medicine.deleteOne","Medicine.deleteMany","Medicine.groupBy","Medicine.aggregate","Order.findUnique","Order.findUniqueOrThrow","Order.findFirst","Order.findFirstOrThrow","Order.findMany","Order.createOne","Order.createMany","Order.createManyAndReturn","Order.updateOne","Order.updateMany","Order.updateManyAndReturn","Order.upsertOne","Order.deleteOne","Order.deleteMany","Order.groupBy","Order.aggregate","OrderItem.findUnique","OrderItem.findUniqueOrThrow","OrderItem.findFirst","OrderItem.findFirstOrThrow","OrderItem.findMany","OrderItem.createOne","OrderItem.createMany","OrderItem.createManyAndReturn","OrderItem.updateOne","OrderItem.updateMany","OrderItem.updateManyAndReturn","OrderItem.upsertOne","OrderItem.deleteOne","OrderItem.deleteMany","OrderItem.groupBy","OrderItem.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","AND","OR","NOT","id","identifier","value","expiresAt","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","accountId","providerId","userId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","name","email","emailVerified","image","role","phone","status","every","some","none","medicineId","rating","title","comment","isVerified","parentId","isApproved","isReported","orderId","quantity","price","discount","subtotal","orderNumber","OrderStatus","shippingCost","tax","totalAmount","shippingAddress","city","state","zipCode","country","paymentMethod","PaymentStatus","paymentStatus","paidAt","notes","trackingNumber","deliveredAt","cancelledAt","slug","sku","description","genericName","manufacturer","discountPrice","discountPercentage","stockQuantity","lowStockThreshold","unit","imageUrl","images","dosageForm","strength","packSize","requiresPrescription","expiryDate","ingredients","sideEffects","warnings","storage","categoryId","sellerId","isActive","isFeatured","has","hasEvery","hasSome","userId_medicineId_parentId","userId_medicineId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","push","increment","decrement","multiply","divide"]'),
  graph: "vwVioAEMAwAA2AIAIA8AAN4CACC7AQAA4gIAMLwBAAAXABC9AQAA4gIAML4BAQAAAAHCAUAApQIAIcMBQAClAgAh0QEBAKQCACHmAQEApAIAIe8BAgDgAgAhogIAAOsCACABAAAAAQAgDAMAANgCACC7AQAA6gIAMLwBAAADABC9AQAA6gIAML4BAQCkAgAhwQFAAKUCACHCAUAApQIAIcMBQAClAgAh0QEBAKQCACHZAQEApAIAIdoBAQC1AgAh2wEBALUCACEDAwAA6wQAINoBAADxAgAg2wEAAPECACAMAwAA2AIAILsBAADqAgAwvAEAAAMAEL0BAADqAgAwvgEBAAAAAcEBQAClAgAhwgFAAKUCACHDAUAApQIAIdEBAQCkAgAh2QEBAAAAAdoBAQC1AgAh2wEBALUCACEDAAAAAwAgAQAABAAwAgAABQAgEQMAANgCACC7AQAA6QIAMLwBAAAHABC9AQAA6QIAML4BAQCkAgAhwgFAAKUCACHDAUAApQIAIc8BAQCkAgAh0AEBAKQCACHRAQEApAIAIdIBAQC1AgAh0wEBALUCACHUAQEAtQIAIdUBQADXAgAh1gFAANcCACHXAQEAtQIAIdgBAQC1AgAhCAMAAOsEACDSAQAA8QIAINMBAADxAgAg1AEAAPECACDVAQAA8QIAINYBAADxAgAg1wEAAPECACDYAQAA8QIAIBEDAADYAgAguwEAAOkCADC8AQAABwAQvQEAAOkCADC-AQEAAAABwgFAAKUCACHDAUAApQIAIc8BAQCkAgAh0AEBAKQCACHRAQEApAIAIdIBAQC1AgAh0wEBALUCACHUAQEAtQIAIdUBQADXAgAh1gFAANcCACHXAQEAtQIAIdgBAQC1AgAhAwAAAAcAIAEAAAgAMAIAAAkAICYKAADoAgAgCwAA2AIAIAwAALkCACANAADZAgAgEQAAuwIAILsBAADmAgAwvAEAAAsAEL0BAADmAgAwvgEBAKQCACHCAUAApQIAIcMBQAClAgAh3AEBAKQCACHwAQgA1QIAIYUCAQCkAgAhhgIBALUCACGHAgEAtQIAIYgCAQC1AgAhiQIBAKQCACGKAggA5wIAIYsCCADnAgAhjAICAOACACGNAgIA4AIAIY4CAQCkAgAhjwIBALUCACGQAgAAzwIAIJECAQC1AgAhkgIBALUCACGTAgEAtQIAIZQCIAC0AgAhlQJAANcCACGWAgEAtQIAIZcCAQC1AgAhmAIBALUCACGZAgEAtQIAIZoCAQCkAgAhmwIBAKQCACGcAiAAtAIAIZ0CIAC0AgAhEwoAAPAEACALAADrBAAgDAAAqwQAIA0AAOwEACARAACtBAAghgIAAPECACCHAgAA8QIAIIgCAADxAgAgigIAAPECACCLAgAA8QIAII8CAADxAgAgkQIAAPECACCSAgAA8QIAIJMCAADxAgAglQIAAPECACCWAgAA8QIAIJcCAADxAgAgmAIAAPECACCZAgAA8QIAICYKAADoAgAgCwAA2AIAIAwAALkCACANAADZAgAgEQAAuwIAILsBAADmAgAwvAEAAAsAEL0BAADmAgAwvgEBAAAAAcIBQAClAgAhwwFAAKUCACHcAQEApAIAIfABCADVAgAhhQIBAAAAAYYCAQAAAAGHAgEAtQIAIYgCAQC1AgAhiQIBAKQCACGKAggA5wIAIYsCCADnAgAhjAICAOACACGNAgIA4AIAIY4CAQCkAgAhjwIBALUCACGQAgAAzwIAIJECAQC1AgAhkgIBALUCACGTAgEAtQIAIZQCIAC0AgAhlQJAANcCACGWAgEAtQIAIZcCAQC1AgAhmAIBALUCACGZAgEAtQIAIZoCAQCkAgAhmwIBAKQCACGcAiAAtAIAIZ0CIAC0AgAhAwAAAAsAIAEAAAwAMAIAAA0AIBAGAADkAgAgBwAA5QIAIAgAALgCACAOAgDgAgAhuwEAAOMCADC8AQAADwAQvQEAAOMCADC-AQEApAIAIcIBQAClAgAhwwFAAKUCACHcAQEApAIAId8BAQC1AgAh6wEBALUCACGFAgEApAIAIYcCAQC1AgAhnAIgALQCACEBAAAADwAgBgYAAPAEACAHAADxBAAgCAAAqgQAIN8BAADxAgAg6wEAAPECACCHAgAA8QIAIBAGAADkAgAgBwAA5QIAIAgAALgCACAOAgDgAgAhuwEAAOMCADC8AQAADwAQvQEAAOMCADC-AQEAAAABwgFAAKUCACHDAUAApQIAIdwBAQCkAgAh3wEBALUCACHrAQEAtQIAIYUCAQAAAAGHAgEAtQIAIZwCIAC0AgAhAwAAAA8AIAEAABEAMAIAABIAIAMAAAALACABAAAMADACAAANACABAAAADwAgAQAAAAsAIAsDAADYAgAgDwAA3gIAILsBAADiAgAwvAEAABcAEL0BAADiAgAwvgEBAKQCACHCAUAApQIAIcMBQAClAgAh0QEBAKQCACHmAQEApAIAIe8BAgDgAgAhAgMAAOsEACAPAADuBAAgAwAAABcAIAEAABgAMAIAAAEAIA4OAADhAgAgDwAA3gIAILsBAADfAgAwvAEAABoAEL0BAADfAgAwvgEBAKQCACHCAUAApQIAIcMBQAClAgAh5gEBAKQCACHuAQEApAIAIe8BAgDgAgAh8AEIANUCACHxAQgA1QIAIfIBCADVAgAhAg4AAO8EACAPAADuBAAgDg4AAOECACAPAADeAgAguwEAAN8CADC8AQAAGgAQvQEAAN8CADC-AQEAAAABwgFAAKUCACHDAUAApQIAIeYBAQCkAgAh7gEBAKQCACHvAQIA4AIAIfABCADVAgAh8QEIANUCACHyAQgA1QIAIQMAAAAaACABAAAbADACAAAcACADAAAAGgAgAQAAGwAwAgAAHAAgAQAAABoAIBMDAADYAgAgBgAA3QIAIA8AAN4CACAQAAC7AgAguwEAANsCADC8AQAAIAAQvQEAANsCADC-AQEApAIAIcIBQAClAgAhwwFAAKUCACHRAQEApAIAIeYBAQCkAgAh5wECANwCACHoAQEAtQIAIekBAQC1AgAh6gEgALQCACHrAQEAtQIAIewBIAC0AgAh7QEgALQCACEIAwAA6wQAIAYAAO0EACAPAADuBAAgEAAArQQAIOcBAADxAgAg6AEAAPECACDpAQAA8QIAIOsBAADxAgAgFAMAANgCACAGAADdAgAgDwAA3gIAIBAAALsCACC7AQAA2wIAMLwBAAAgABC9AQAA2wIAML4BAQAAAAHCAUAApQIAIcMBQAClAgAh0QEBAKQCACHmAQEApAIAIecBAgDcAgAh6AEBALUCACHpAQEAtQIAIeoBIAC0AgAh6wEBALUCACHsASAAtAIAIe0BIAC0AgAhoQIAANoCACADAAAAIAAgAQAAIQAwAgAAIgAgAQAAACAAIAMAAAAgACABAAAhADACAAAiACABAAAAIAAgAQAAABcAIAEAAAAaACABAAAAIAAgAwAAABcAIAEAABgAMAIAAAEAIB0DAADYAgAgDQAA2QIAILsBAADTAgAwvAEAACsAEL0BAADTAgAwvgEBAKQCACHCAUAApQIAIcMBQAClAgAh0QEBAKQCACHhAQEApAIAIeIBAADUAvUBIvEBCADVAgAh8gEIANUCACHzAQEApAIAIfUBCADVAgAh9gEIANUCACH3AQgA1QIAIfgBAQCkAgAh-QEBAKQCACH6AQEAtQIAIfsBAQCkAgAh_AEBAKQCACH9AQEApAIAIf8BAADWAv8BIoACQADXAgAhgQIBALUCACGCAgEAtQIAIYMCQADXAgAhhAJAANcCACEIAwAA6wQAIA0AAOwEACD6AQAA8QIAIIACAADxAgAggQIAAPECACCCAgAA8QIAIIMCAADxAgAghAIAAPECACAdAwAA2AIAIA0AANkCACC7AQAA0wIAMLwBAAArABC9AQAA0wIAML4BAQAAAAHCAUAApQIAIcMBQAClAgAh0QEBAKQCACHhAQEApAIAIeIBAADUAvUBIvEBCADVAgAh8gEIANUCACHzAQEAAAAB9QEIANUCACH2AQgA1QIAIfcBCADVAgAh-AEBAKQCACH5AQEApAIAIfoBAQC1AgAh-wEBAKQCACH8AQEApAIAIf0BAQCkAgAh_wEAANYC_wEigAJAANcCACGBAgEAtQIAIYICAQC1AgAhgwJAANcCACGEAkAA1wIAIQMAAAArACABAAAsADACAAAtACADAAAAIAAgAQAAIQAwAgAAIgAgAQAAAAMAIAEAAAAHACABAAAACwAgAQAAABcAIAEAAAArACABAAAAIAAgAQAAAAEAIAMAAAAXACABAAAYADACAAABACADAAAAFwAgAQAAGAAwAgAAAQAgAwAAABcAIAEAABgAMAIAAAEAIAgDAACDBAAgDwAA0wMAIL4BAQAAAAHCAUAAAAABwwFAAAAAAdEBAQAAAAHmAQEAAAAB7wECAAAAAQEYAAA6ACAGvgEBAAAAAcIBQAAAAAHDAUAAAAAB0QEBAAAAAeYBAQAAAAHvAQIAAAABARgAADwAMAEYAAA8ADAIAwAAgQQAIA8AANEDACC-AQEA7wIAIcIBQADwAgAhwwFAAPACACHRAQEA7wIAIeYBAQDvAgAh7wECAL8DACECAAAAAQAgGAAAPwAgBr4BAQDvAgAhwgFAAPACACHDAUAA8AIAIdEBAQDvAgAh5gEBAO8CACHvAQIAvwMAIQIAAAAXACAYAABBACACAAAAFwAgGAAAQQAgAwAAAAEAIB8AADoAICAAAD8AIAEAAAABACABAAAAFwAgBQkAAOYEACAlAADnBAAgJgAA6gQAICcAAOkEACAoAADoBAAgCbsBAADSAgAwvAEAAEgAEL0BAADSAgAwvgEBAJwCACHCAUAAnQIAIcMBQACdAgAh0QEBAJwCACHmAQEAnAIAIe8BAgDBAgAhAwAAABcAIAEAAEcAMCQAAEgAIAMAAAAXACABAAAYADACAAABACABAAAAEgAgAQAAABIAIAMAAAAPACABAAARADACAAASACADAAAADwAgAQAAEQAwAgAAEgAgAwAAAA8AIAEAABEAMAIAABIAIA0GAADlBAAgBwAA4wQAIAgAAOQEACAOAgAAAAG-AQEAAAABwgFAAAAAAcMBQAAAAAHcAQEAAAAB3wEBAAAAAesBAQAAAAGFAgEAAAABhwIBAAAAAZwCIAAAAAEBGAAAUAAgCg4CAAAAAb4BAQAAAAHCAUAAAAABwwFAAAAAAdwBAQAAAAHfAQEAAAAB6wEBAAAAAYUCAQAAAAGHAgEAAAABnAIgAAAAAQEYAABSADABGAAAUgAwAQAAAA8AIA0GAADLBAAgBwAAzAQAIAgAAM0EACAOAgC_AwAhvgEBAO8CACHCAUAA8AIAIcMBQADwAgAh3AEBAO8CACHfAQEA9QIAIesBAQD1AgAhhQIBAO8CACGHAgEA9QIAIZwCIACBAwAhAgAAABIAIBgAAFYAIAoOAgC_AwAhvgEBAO8CACHCAUAA8AIAIcMBQADwAgAh3AEBAO8CACHfAQEA9QIAIesBAQD1AgAhhQIBAO8CACGHAgEA9QIAIZwCIACBAwAhAgAAAA8AIBgAAFgAIAIAAAAPACAYAABYACABAAAADwAgAwAAABIAIB8AAFAAICAAAFYAIAEAAAASACABAAAADwAgCAkAAMYEACAlAADHBAAgJgAAygQAICcAAMkEACAoAADIBAAg3wEAAPECACDrAQAA8QIAIIcCAADxAgAgDQ4CAMECACG7AQAA0QIAMLwBAABgABC9AQAA0QIAML4BAQCcAgAhwgFAAJ0CACHDAUAAnQIAIdwBAQCcAgAh3wEBAKcCACHrAQEApwIAIYUCAQCcAgAhhwIBAKcCACGcAiAAsAIAIQMAAAAPACABAABfADAkAABgACADAAAADwAgAQAAEQAwAgAAEgAgAQAAAA0AIAEAAAANACADAAAACwAgAQAADAAwAgAADQAgAwAAAAsAIAEAAAwAMAIAAA0AIAMAAAALACABAAAMADACAAANACAjCgAAhgQAIAsAAMUEACAMAACHBAAgDQAAiAQAIBEAAIkEACC-AQEAAAABwgFAAAAAAcMBQAAAAAHcAQEAAAAB8AEIAAAAAYUCAQAAAAGGAgEAAAABhwIBAAAAAYgCAQAAAAGJAgEAAAABigIIAAAAAYsCCAAAAAGMAgIAAAABjQICAAAAAY4CAQAAAAGPAgEAAAABkAIAAIUEACCRAgEAAAABkgIBAAAAAZMCAQAAAAGUAiAAAAABlQJAAAAAAZYCAQAAAAGXAgEAAAABmAIBAAAAAZkCAQAAAAGaAgEAAAABmwIBAAAAAZwCIAAAAAGdAiAAAAABARgAAGgAIB6-AQEAAAABwgFAAAAAAcMBQAAAAAHcAQEAAAAB8AEIAAAAAYUCAQAAAAGGAgEAAAABhwIBAAAAAYgCAQAAAAGJAgEAAAABigIIAAAAAYsCCAAAAAGMAgIAAAABjQICAAAAAY4CAQAAAAGPAgEAAAABkAIAAIUEACCRAgEAAAABkgIBAAAAAZMCAQAAAAGUAiAAAAABlQJAAAAAAZYCAQAAAAGXAgEAAAABmAIBAAAAAZkCAQAAAAGaAgEAAAABmwIBAAAAAZwCIAAAAAGdAiAAAAABARgAAGoAMAEYAABqADAjCgAA4QMAIAsAAMQEACAMAADiAwAgDQAA4wMAIBEAAOQDACC-AQEA7wIAIcIBQADwAgAhwwFAAPACACHcAQEA7wIAIfABCACxAwAhhQIBAO8CACGGAgEA9QIAIYcCAQD1AgAhiAIBAPUCACGJAgEA7wIAIYoCCADeAwAhiwIIAN4DACGMAgIAvwMAIY0CAgC_AwAhjgIBAO8CACGPAgEA9QIAIZACAADfAwAgkQIBAPUCACGSAgEA9QIAIZMCAQD1AgAhlAIgAIEDACGVAkAA9gIAIZYCAQD1AgAhlwIBAPUCACGYAgEA9QIAIZkCAQD1AgAhmgIBAO8CACGbAgEA7wIAIZwCIACBAwAhnQIgAIEDACECAAAADQAgGAAAbQAgHr4BAQDvAgAhwgFAAPACACHDAUAA8AIAIdwBAQDvAgAh8AEIALEDACGFAgEA7wIAIYYCAQD1AgAhhwIBAPUCACGIAgEA9QIAIYkCAQDvAgAhigIIAN4DACGLAggA3gMAIYwCAgC_AwAhjQICAL8DACGOAgEA7wIAIY8CAQD1AgAhkAIAAN8DACCRAgEA9QIAIZICAQD1AgAhkwIBAPUCACGUAiAAgQMAIZUCQAD2AgAhlgIBAPUCACGXAgEA9QIAIZgCAQD1AgAhmQIBAPUCACGaAgEA7wIAIZsCAQDvAgAhnAIgAIEDACGdAiAAgQMAIQIAAAALACAYAABvACACAAAACwAgGAAAbwAgAwAAAA0AIB8AAGgAICAAAG0AIAEAAAANACABAAAACwAgEwkAAL8EACAlAADABAAgJgAAwwQAICcAAMIEACAoAADBBAAghgIAAPECACCHAgAA8QIAIIgCAADxAgAgigIAAPECACCLAgAA8QIAII8CAADxAgAgkQIAAPECACCSAgAA8QIAIJMCAADxAgAglQIAAPECACCWAgAA8QIAIJcCAADxAgAgmAIAAPECACCZAgAA8QIAICG7AQAAzQIAMLwBAAB2ABC9AQAAzQIAML4BAQCcAgAhwgFAAJ0CACHDAUAAnQIAIdwBAQCcAgAh8AEIAMICACGFAgEAnAIAIYYCAQCnAgAhhwIBAKcCACGIAgEApwIAIYkCAQCcAgAhigIIAM4CACGLAggAzgIAIYwCAgDBAgAhjQICAMECACGOAgEAnAIAIY8CAQCnAgAhkAIAAM8CACCRAgEApwIAIZICAQCnAgAhkwIBAKcCACGUAiAAsAIAIZUCQACoAgAhlgIBAKcCACGXAgEApwIAIZgCAQCnAgAhmQIBAKcCACGaAgEAnAIAIZsCAQCcAgAhnAIgALACACGdAiAAsAIAIQMAAAALACABAAB1ADAkAAB2ACADAAAACwAgAQAADAAwAgAADQAgAQAAAC0AIAEAAAAtACADAAAAKwAgAQAALAAwAgAALQAgAwAAACsAIAEAACwAMAIAAC0AIAMAAAArACABAAAsADACAAAtACAaAwAAvgQAIA0AAMUDACC-AQEAAAABwgFAAAAAAcMBQAAAAAHRAQEAAAAB4QEBAAAAAeIBAAAA9QEC8QEIAAAAAfIBCAAAAAHzAQEAAAAB9QEIAAAAAfYBCAAAAAH3AQgAAAAB-AEBAAAAAfkBAQAAAAH6AQEAAAAB-wEBAAAAAfwBAQAAAAH9AQEAAAAB_wEAAAD_AQKAAkAAAAABgQIBAAAAAYICAQAAAAGDAkAAAAABhAJAAAAAAQEYAAB-ACAYvgEBAAAAAcIBQAAAAAHDAUAAAAAB0QEBAAAAAeEBAQAAAAHiAQAAAPUBAvEBCAAAAAHyAQgAAAAB8wEBAAAAAfUBCAAAAAH2AQgAAAAB9wEIAAAAAfgBAQAAAAH5AQEAAAAB-gEBAAAAAfsBAQAAAAH8AQEAAAAB_QEBAAAAAf8BAAAA_wECgAJAAAAAAYECAQAAAAGCAgEAAAABgwJAAAAAAYQCQAAAAAEBGAAAgAEAMAEYAACAAQAwGgMAAL0EACANAAC0AwAgvgEBAO8CACHCAUAA8AIAIcMBQADwAgAh0QEBAO8CACHhAQEA7wIAIeIBAACwA_UBIvEBCACxAwAh8gEIALEDACHzAQEA7wIAIfUBCACxAwAh9gEIALEDACH3AQgAsQMAIfgBAQDvAgAh-QEBAO8CACH6AQEA9QIAIfsBAQDvAgAh_AEBAO8CACH9AQEA7wIAIf8BAACyA_8BIoACQAD2AgAhgQIBAPUCACGCAgEA9QIAIYMCQAD2AgAhhAJAAPYCACECAAAALQAgGAAAgwEAIBi-AQEA7wIAIcIBQADwAgAhwwFAAPACACHRAQEA7wIAIeEBAQDvAgAh4gEAALAD9QEi8QEIALEDACHyAQgAsQMAIfMBAQDvAgAh9QEIALEDACH2AQgAsQMAIfcBCACxAwAh-AEBAO8CACH5AQEA7wIAIfoBAQD1AgAh-wEBAO8CACH8AQEA7wIAIf0BAQDvAgAh_wEAALID_wEigAJAAPYCACGBAgEA9QIAIYICAQD1AgAhgwJAAPYCACGEAkAA9gIAIQIAAAArACAYAACFAQAgAgAAACsAIBgAAIUBACADAAAALQAgHwAAfgAgIAAAgwEAIAEAAAAtACABAAAAKwAgCwkAALgEACAlAAC5BAAgJgAAvAQAICcAALsEACAoAAC6BAAg-gEAAPECACCAAgAA8QIAIIECAADxAgAgggIAAPECACCDAgAA8QIAIIQCAADxAgAgG7sBAADGAgAwvAEAAIwBABC9AQAAxgIAML4BAQCcAgAhwgFAAJ0CACHDAUAAnQIAIdEBAQCcAgAh4QEBAJwCACHiAQAAxwL1ASLxAQgAwgIAIfIBCADCAgAh8wEBAJwCACH1AQgAwgIAIfYBCADCAgAh9wEIAMICACH4AQEAnAIAIfkBAQCcAgAh-gEBAKcCACH7AQEAnAIAIfwBAQCcAgAh_QEBAJwCACH_AQAAyAL_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_wIAIN8BAADxAgAg4AEAAPECACDhAQAA8QIAIOIBAADxAgAgDbsBAACvAgAwvAEAANMBABC9AQAArwIAML4BAQCcAgAhwgFAAJ0CACHDAUAAnQIAIdwBAQCcAgAh3QEBAJwCACHeASAAsAIAId8BAQCnAgAh4AEBAKcCACHhAQEApwIAIeIBAQCnAgAhAwAAAMABACABAADSAQAwJAAA0wEAIAMAAADAAQAgAQAAwQEAMAIAAL0BACABAAAABQAgAQAAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAkDAAD9AgAgvgEBAAAAAcEBQAAAAAHCAUAAAAABwwFAAAAAAdEBAQAAAAHZAQEAAAAB2gEBAAAAAdsBAQAAAAEBGAAA2wEAIAi-AQEAAAABwQFAAAAAAcIBQAAAAAHDAUAAAAAB0QEBAAAAAdkBAQAAAAHaAQEAAAAB2wEBAAAAAQEYAADdAQAwARgAAN0BADAJAwAA_AIAIL4BAQDvAgAhwQFAAPACACHCAUAA8AIAIcMBQADwAgAh0QEBAO8CACHZAQEA7wIAIdoBAQD1AgAh2wEBAPUCACECAAAABQAgGAAA4AEAIAi-AQEA7wIAIcEBQADwAgAhwgFAAPACACHDAUAA8AIAIdEBAQDvAgAh2QEBAO8CACHaAQEA9QIAIdsBAQD1AgAhAgAAAAMAIBgAAOIBACACAAAAAwAgGAAA4gEAIAMAAAAFACAfAADbAQAgIAAA4AEAIAEAAAAFACABAAAAAwAgBQkAAPkCACAnAAD7AgAgKAAA-gIAINoBAADxAgAg2wEAAPECACALuwEAAK4CADC8AQAA6QEAEL0BAACuAgAwvgEBAJwCACHBAUAAnQIAIcIBQACdAgAhwwFAAJ0CACHRAQEAnAIAIdkBAQCcAgAh2gEBAKcCACHbAQEApwIAIQMAAAADACABAADoAQAwJAAA6QEAIAMAAAADACABAAAEADACAAAFACABAAAACQAgAQAAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIA4DAAD4AgAgvgEBAAAAAcIBQAAAAAHDAUAAAAABzwEBAAAAAdABAQAAAAHRAQEAAAAB0gEBAAAAAdMBAQAAAAHUAQEAAAAB1QFAAAAAAdYBQAAAAAHXAQEAAAAB2AEBAAAAAQEYAADxAQAgDb4BAQAAAAHCAUAAAAABwwFAAAAAAc8BAQAAAAHQAQEAAAAB0QEBAAAAAdIBAQAAAAHTAQEAAAAB1AEBAAAAAdUBQAAAAAHWAUAAAAAB1wEBAAAAAdgBAQAAAAEBGAAA8wEAMAEYAADzAQAwDgMAAPcCACC-AQEA7wIAIcIBQADwAgAhwwFAAPACACHPAQEA7wIAIdABAQDvAgAh0QEBAO8CACHSAQEA9QIAIdMBAQD1AgAh1AEBAPUCACHVAUAA9gIAIdYBQAD2AgAh1wEBAPUCACHYAQEA9QIAIQIAAAAJACAYAAD2AQAgDb4BAQDvAgAhwgFAAPACACHDAUAA8AIAIc8BAQDvAgAh0AEBAO8CACHRAQEA7wIAIdIBAQD1AgAh0wEBAPUCACHUAQEA9QIAIdUBQAD2AgAh1gFAAPYCACHXAQEA9QIAIdgBAQD1AgAhAgAAAAcAIBgAAPgBACACAAAABwAgGAAA-AEAIAMAAAAJACAfAADxAQAgIAAA9gEAIAEAAAAJACABAAAABwAgCgkAAPICACAnAAD0AgAgKAAA8wIAINIBAADxAgAg0wEAAPECACDUAQAA8QIAINUBAADxAgAg1gEAAPECACDXAQAA8QIAINgBAADxAgAgELsBAACmAgAwvAEAAP8BABC9AQAApgIAML4BAQCcAgAhwgFAAJ0CACHDAUAAnQIAIc8BAQCcAgAh0AEBAJwCACHRAQEAnAIAIdIBAQCnAgAh0wEBAKcCACHUAQEApwIAIdUBQACoAgAh1gFAAKgCACHXAQEApwIAIdgBAQCnAgAhAwAAAAcAIAEAAP4BADAkAAD_AQAgAwAAAAcAIAEAAAgAMAIAAAkAIAm7AQAAowIAMLwBAACFAgAQvQEAAKMCADC-AQEAAAABvwEBAKQCACHAAQEApAIAIcEBQAClAgAhwgFAAKUCACHDAUAApQIAIQEAAACCAgAgAQAAAIICACAJuwEAAKMCADC8AQAAhQIAEL0BAACjAgAwvgEBAKQCACG_AQEApAIAIcABAQCkAgAhwQFAAKUCACHCAUAApQIAIcMBQAClAgAhAAMAAACFAgAgAQAAhgIAMAIAAIICACADAAAAhQIAIAEAAIYCADACAACCAgAgAwAAAIUCACABAACGAgAwAgAAggIAIAa-AQEAAAABvwEBAAAAAcABAQAAAAHBAUAAAAABwgFAAAAAAcMBQAAAAAEBGAAAigIAIAa-AQEAAAABvwEBAAAAAcABAQAAAAHBAUAAAAABwgFAAAAAAcMBQAAAAAEBGAAAjAIAMAEYAACMAgAwBr4BAQDvAgAhvwEBAO8CACHAAQEA7wIAIcEBQADwAgAhwgFAAPACACHDAUAA8AIAIQIAAACCAgAgGAAAjwIAIAa-AQEA7wIAIb8BAQDvAgAhwAEBAO8CACHBAUAA8AIAIcIBQADwAgAhwwFAAPACACECAAAAhQIAIBgAAJECACACAAAAhQIAIBgAAJECACADAAAAggIAIB8AAIoCACAgAACPAgAgAQAAAIICACABAAAAhQIAIAMJAADsAgAgJwAA7gIAICgAAO0CACAJuwEAAJsCADC8AQAAmAIAEL0BAACbAgAwvgEBAJwCACG_AQEAnAIAIcABAQCcAgAhwQFAAJ0CACHCAUAAnQIAIcMBQACdAgAhAwAAAIUCACABAACXAgAwJAAAmAIAIAMAAACFAgAgAQAAhgIAMAIAAIICACAJuwEAAJsCADC8AQAAmAIAEL0BAACbAgAwvgEBAJwCACG_AQEAnAIAIcABAQCcAgAhwQFAAJ0CACHCAUAAnQIAIcMBQACdAgAhDgkAAJ8CACAnAACiAgAgKAAAogIAIMQBAQAAAAHFAQEAAAAExgEBAAAABMcBAQAAAAHIAQEAAAAByQEBAAAAAcoBAQAAAAHLAQEAoQIAIcwBAQAAAAHNAQEAAAABzgEBAAAAAQsJAACfAgAgJwAAoAIAICgAAKACACDEAUAAAAABxQFAAAAABMYBQAAAAATHAUAAAAAByAFAAAAAAckBQAAAAAHKAUAAAAABywFAAJ4CACELCQAAnwIAICcAAKACACAoAACgAgAgxAFAAAAAAcUBQAAAAATGAUAAAAAExwFAAAAAAcgBQAAAAAHJAUAAAAABygFAAAAAAcsBQACeAgAhCMQBAgAAAAHFAQIAAAAExgECAAAABMcBAgAAAAHIAQIAAAAByQECAAAAAcoBAgAAAAHLAQIAnwIAIQjEAUAAAAABxQFAAAAABMYBQAAAAATHAUAAAAAByAFAAAAAAckBQAAAAAHKAUAAAAABywFAAKACACEOCQAAnwIAICcAAKICACAoAACiAgAgxAEBAAAAAcUBAQAAAATGAQEAAAAExwEBAAAAAcgBAQAAAAHJAQEAAAABygEBAAAAAcsBAQChAgAhzAEBAAAAAc0BAQAAAAHOAQEAAAABC8QBAQAAAAHFAQEAAAAExgEBAAAABMcBAQAAAAHIAQEAAAAByQEBAAAAAcoBAQAAAAHLAQEAogIAIcwBAQAAAAHNAQEAAAABzgEBAAAAAQm7AQAAowIAMLwBAACFAgAQvQEAAKMCADC-AQEApAIAIb8BAQCkAgAhwAEBAKQCACHBAUAApQIAIcIBQAClAgAhwwFAAKUCACELxAEBAAAAAcUBAQAAAATGAQEAAAAExwEBAAAAAcgBAQAAAAHJAQEAAAABygEBAAAAAcsBAQCiAgAhzAEBAAAAAc0BAQAAAAHOAQEAAAABCMQBQAAAAAHFAUAAAAAExgFAAAAABMcBQAAAAAHIAUAAAAAByQFAAAAAAcoBQAAAAAHLAUAAoAIAIRC7AQAApgIAMLwBAAD_AQAQvQEAAKYCADC-AQEAnAIAIcIBQACdAgAhwwFAAJ0CACHPAQEAnAIAIdABAQCcAgAh0QEBAJwCACHSAQEApwIAIdMBAQCnAgAh1AEBAKcCACHVAUAAqAIAIdYBQACoAgAh1wEBAKcCACHYAQEApwIAIQ4JAACqAgAgJwAArQIAICgAAK0CACDEAQEAAAABxQEBAAAABcYBAQAAAAXHAQEAAAAByAEBAAAAAckBAQAAAAHKAQEAAAABywEBAKwCACHMAQEAAAABzQEBAAAAAc4BAQAAAAELCQAAqgIAICcAAKsCACAoAACrAgAgxAFAAAAAAcUBQAAAAAXGAUAAAAAFxwFAAAAAAcgBQAAAAAHJAUAAAAABygFAAAAAAcsBQACpAgAhCwkAAKoCACAnAACrAgAgKAAAqwIAIMQBQAAAAAHFAUAAAAAFxgFAAAAABccBQAAAAAHIAUAAAAAByQFAAAAAAcoBQAAAAAHLAUAAqQIAIQjEAQIAAAABxQECAAAABcYBAgAAAAXHAQIAAAAByAECAAAAAckBAgAAAAHKAQIAAAABywECAKoCACEIxAFAAAAAAcUBQAAAAAXGAUAAAAAFxwFAAAAAAcgBQAAAAAHJAUAAAAABygFAAAAAAcsBQACrAgAhDgkAAKoCACAnAACtAgAgKAAArQIAIMQBAQAAAAHFAQEAAAAFxgEBAAAABccBAQAAAAHIAQEAAAAByQEBAAAAAcoBAQAAAAHLAQEArAIAIcwBAQAAAAHNAQEAAAABzgEBAAAAAQvEAQEAAAABxQEBAAAABcYBAQAAAAXHAQEAAAAByAEBAAAAAckBAQAAAAHKAQEAAAABywEBAK0CACHMAQEAAAABzQEBAAAAAc4BAQAAAAELuwEAAK4CADC8AQAA6QEAEL0BAACuAgAwvgEBAJwCACHBAUAAnQIAIcIBQACdAgAhwwFAAJ0CACHRAQEAnAIAIdkBAQCcAgAh2gEBAKcCACHbAQEApwIAIQ27AQAArwIAMLwBAADTAQAQvQEAAK8CADC-AQEAnAIAIcIBQACdAgAhwwFAAJ0CACHcAQEAnAIAId0BAQCcAgAh3gEgALACACHfAQEApwIAIeABAQCnAgAh4QEBAKcCACHiAQEApwIAIQUJAACfAgAgJwAAsgIAICgAALICACDEASAAAAABywEgALECACEFCQAAnwIAICcAALICACAoAACyAgAgxAEgAAAAAcsBIACxAgAhAsQBIAAAAAHLASAAsgIAIRMEAAC2AgAgBQAAtwIAIAgAALgCACAMAAC5AgAgEQAAuwIAIBIAALoCACC7AQAAswIAMLwBAADAAQAQvQEAALMCADC-AQEApAIAIcIBQAClAgAhwwFAAKUCACHcAQEApAIAId0BAQCkAgAh3gEgALQCACHfAQEAtQIAIeABAQC1AgAh4QEBALUCACHiAQEAtQIAIQLEASAAAAABywEgALICACELxAEBAAAAAcUBAQAAAAXGAQEAAAAFxwEBAAAAAcgBAQAAAAHJAQEAAAABygEBAAAAAcsBAQCtAgAhzAEBAAAAAc0BAQAAAAHOAQEAAAABA-MBAAADACDkAQAAAwAg5QEAAAMAIAPjAQAABwAg5AEAAAcAIOUBAAAHACAD4wEAAAsAIOQBAAALACDlAQAACwAgA-MBAAAXACDkAQAAFwAg5QEAABcAIAPjAQAAKwAg5AEAACsAIOUBAAArACAD4wEAACAAIOQBAAAgACDlAQAAIAAgD7sBAAC8AgAwvAEAALoBABC9AQAAvAIAML4BAQCcAgAhwgFAAJ0CACHDAUAAnQIAIdEBAQCcAgAh5gEBAJwCACHnAQIAvQIAIegBAQCnAgAh6QEBAKcCACHqASAAsAIAIesBAQCnAgAh7AEgALACACHtASAAsAIAIQ0JAACqAgAgJQAAvwIAICYAAKoCACAnAACqAgAgKAAAqgIAIMQBAgAAAAHFAQIAAAAFxgECAAAABccBAgAAAAHIAQIAAAAByQECAAAAAcoBAgAAAAHLAQIAvgIAIQ0JAACqAgAgJQAAvwIAICYAAKoCACAnAACqAgAgKAAAqgIAIMQBAgAAAAHFAQIAAAAFxgECAAAABccBAgAAAAHIAQIAAAAByQECAAAAAcoBAgAAAAHLAQIAvgIAIQjEAQgAAAABxQEIAAAABcYBCAAAAAXHAQgAAAAByAEIAAAAAckBCAAAAAHKAQgAAAABywEIAL8CACEMuwEAAMACADC8AQAAogEAEL0BAADAAgAwvgEBAJwCACHCAUAAnQIAIcMBQACdAgAh5gEBAJwCACHuAQEAnAIAIe8BAgDBAgAh8AEIAMICACHxAQgAwgIAIfIBCADCAgAhDQkAAJ8CACAlAADEAgAgJgAAnwIAICcAAJ8CACAoAACfAgAgxAECAAAAAcUBAgAAAATGAQIAAAAExwECAAAAAcgBAgAAAAHJAQIAAAABygECAAAAAcsBAgDFAgAhDQkAAJ8CACAlAADEAgAgJgAAxAIAICcAAMQCACAoAADEAgAgxAEIAAAAAcUBCAAAAATGAQgAAAAExwEIAAAAAcgBCAAAAAHJAQgAAAABygEIAAAAAcsBCADDAgAhDQkAAJ8CACAlAADEAgAgJgAAxAIAICcAAMQCACAoAADEAgAgxAEIAAAAAcUBCAAAAATGAQgAAAAExwEIAAAAAcgBCAAAAAHJAQgAAAABygEIAAAAAcsBCADDAgAhCMQBCAAAAAHFAQgAAAAExgEIAAAABMcBCAAAAAHIAQgAAAAByQEIAAAAAcoBCAAAAAHLAQgAxAIAIQ0JAACfAgAgJQAAxAIAICYAAJ8CACAnAACfAgAgKAAAnwIAIMQBAgAAAAHFAQIAAAAExgECAAAABMcBAgAAAAHIAQIAAAAByQECAAAAAcoBAgAAAAHLAQIAxQIAIRu7AQAAxgIAMLwBAACMAQAQvQEAAMYCADC-AQEAnAIAIcIBQACdAgAhwwFAAJ0CACHRAQEAnAIAIeEBAQCcAgAh4gEAAMcC9QEi8QEIAMICACHyAQgAwgIAIfMBAQCcAgAh9QEIAMICACH2AQgAwgIAIfcBCADCAgAh-AEBAJwCACH5AQEAnAIAIfoBAQCnAgAh-wEBAJwCACH8AQEAnAIAIf0BAQCcAgAh_wEAAMgC_wEigAJAAKgCACGBAgEApwIAIYICAQCnAgAhgwJAAKgCACGEAkAAqAIAIQcJAACfAgAgJwAAzAIAICgAAMwCACDEAQAAAPUBAsUBAAAA9QEIxgEAAAD1AQjLAQAAywL1ASIHCQAAnwIAICcAAMoCACAoAADKAgAgxAEAAAD_AQLFAQAAAP8BCMYBAAAA_wEIywEAAMkC_wEiBwkAAJ8CACAnAADKAgAgKAAAygIAIMQBAAAA_wECxQEAAAD_AQjGAQAAAP8BCMsBAADJAv8BIgTEAQAAAP8BAsUBAAAA_wEIxgEAAAD_AQjLAQAAygL_ASIHCQAAnwIAICcAAMwCACAoAADMAgAgxAEAAAD1AQLFAQAAAPUBCMYBAAAA9QEIywEAAMsC9QEiBMQBAAAA9QECxQEAAAD1AQjGAQAAAPUBCMsBAADMAvUBIiG7AQAAzQIAMLwBAAB2ABC9AQAAzQIAML4BAQCcAgAhwgFAAJ0CACHDAUAAnQIAIdwBAQCcAgAh8AEIAMICACGFAgEAnAIAIYYCAQCnAgAhhwIBAKcCACGIAgEApwIAIYkCAQCcAgAhigIIAM4CACGLAggAzgIAIYwCAgDBAgAhjQICAMECACGOAgEAnAIAIY8CAQCnAgAhkAIAAM8CACCRAgEApwIAIZICAQCnAgAhkwIBAKcCACGUAiAAsAIAIZUCQACoAgAhlgIBAKcCACGXAgEApwIAIZgCAQCnAgAhmQIBAKcCACGaAgEAnAIAIZsCAQCcAgAhnAIgALACACGdAiAAsAIAIQ0JAACqAgAgJQAAvwIAICYAAL8CACAnAAC_AgAgKAAAvwIAIMQBCAAAAAHFAQgAAAAFxgEIAAAABccBCAAAAAHIAQgAAAAByQEIAAAAAcoBCAAAAAHLAQgA0AIAIQTEAQEAAAAFngIBAAAAAZ8CAQAAAASgAgEAAAAEDQkAAKoCACAlAAC_AgAgJgAAvwIAICcAAL8CACAoAAC_AgAgxAEIAAAAAcUBCAAAAAXGAQgAAAAFxwEIAAAAAcgBCAAAAAHJAQgAAAABygEIAAAAAcsBCADQAgAhDQ4CAMECACG7AQAA0QIAMLwBAABgABC9AQAA0QIAML4BAQCcAgAhwgFAAJ0CACHDAUAAnQIAIdwBAQCcAgAh3wEBAKcCACHrAQEApwIAIYUCAQCcAgAhhwIBAKcCACGcAiAAsAIAIQm7AQAA0gIAMLwBAABIABC9AQAA0gIAML4BAQCcAgAhwgFAAJ0CACHDAUAAnQIAIdEBAQCcAgAh5gEBAJwCACHvAQIAwQIAIR0DAADYAgAgDQAA2QIAILsBAADTAgAwvAEAACsAEL0BAADTAgAwvgEBAKQCACHCAUAApQIAIcMBQAClAgAh0QEBAKQCACHhAQEApAIAIeIBAADUAvUBIvEBCADVAgAh8gEIANUCACHzAQEApAIAIfUBCADVAgAh9gEIANUCACH3AQgA1QIAIfgBAQCkAgAh-QEBAKQCACH6AQEAtQIAIfsBAQCkAgAh_AEBAKQCACH9AQEApAIAIf8BAADWAv8BIoACQADXAgAhgQIBALUCACGCAgEAtQIAIYMCQADXAgAhhAJAANcCACEExAEAAAD1AQLFAQAAAPUBCMYBAAAA9QEIywEAAMwC9QEiCMQBCAAAAAHFAQgAAAAExgEIAAAABMcBCAAAAAHIAQgAAAAByQEIAAAAAcoBCAAAAAHLAQgAxAIAIQTEAQAAAP8BAsUBAAAA_wEIxgEAAAD_AQjLAQAAygL_ASIIxAFAAAAAAcUBQAAAAAXGAUAAAAAFxwFAAAAAAcgBQAAAAAHJAUAAAAABygFAAAAAAcsBQACrAgAhFQQAALYCACAFAAC3AgAgCAAAuAIAIAwAALkCACARAAC7AgAgEgAAugIAILsBAACzAgAwvAEAAMABABC9AQAAswIAML4BAQCkAgAhwgFAAKUCACHDAUAApQIAIdwBAQCkAgAh3QEBAKQCACHeASAAtAIAId8BAQC1AgAh4AEBALUCACHhAQEAtQIAIeIBAQC1AgAhowIAAMABACCkAgAAwAEAIAPjAQAAGgAg5AEAABoAIOUBAAAaACAD0QEBAAAAAeYBAQAAAAHrAQEAAAABEwMAANgCACAGAADdAgAgDwAA3gIAIBAAALsCACC7AQAA2wIAMLwBAAAgABC9AQAA2wIAML4BAQCkAgAhwgFAAKUCACHDAUAApQIAIdEBAQCkAgAh5gEBAKQCACHnAQIA3AIAIegBAQC1AgAh6QEBALUCACHqASAAtAIAIesBAQC1AgAh7AEgALQCACHtASAAtAIAIQjEAQIAAAABxQECAAAABcYBAgAAAAXHAQIAAAAByAECAAAAAckBAgAAAAHKAQIAAAABywECAKoCACEVAwAA2AIAIAYAAN0CACAPAADeAgAgEAAAuwIAILsBAADbAgAwvAEAACAAEL0BAADbAgAwvgEBAKQCACHCAUAApQIAIcMBQAClAgAh0QEBAKQCACHmAQEApAIAIecBAgDcAgAh6AEBALUCACHpAQEAtQIAIeoBIAC0AgAh6wEBALUCACHsASAAtAIAIe0BIAC0AgAhowIAACAAIKQCAAAgACAoCgAA6AIAIAsAANgCACAMAAC5AgAgDQAA2QIAIBEAALsCACC7AQAA5gIAMLwBAAALABC9AQAA5gIAML4BAQCkAgAhwgFAAKUCACHDAUAApQIAIdwBAQCkAgAh8AEIANUCACGFAgEApAIAIYYCAQC1AgAhhwIBALUCACGIAgEAtQIAIYkCAQCkAgAhigIIAOcCACGLAggA5wIAIYwCAgDgAgAhjQICAOACACGOAgEApAIAIY8CAQC1AgAhkAIAAM8CACCRAgEAtQIAIZICAQC1AgAhkwIBALUCACGUAiAAtAIAIZUCQADXAgAhlgIBALUCACGXAgEAtQIAIZgCAQC1AgAhmQIBALUCACGaAgEApAIAIZsCAQCkAgAhnAIgALQCACGdAiAAtAIAIaMCAAALACCkAgAACwAgDg4AAOECACAPAADeAgAguwEAAN8CADC8AQAAGgAQvQEAAN8CADC-AQEApAIAIcIBQAClAgAhwwFAAKUCACHmAQEApAIAIe4BAQCkAgAh7wECAOACACHwAQgA1QIAIfEBCADVAgAh8gEIANUCACEIxAECAAAAAcUBAgAAAATGAQIAAAAExwECAAAAAcgBAgAAAAHJAQIAAAABygECAAAAAcsBAgCfAgAhHwMAANgCACANAADZAgAguwEAANMCADC8AQAAKwAQvQEAANMCADC-AQEApAIAIcIBQAClAgAhwwFAAKUCACHRAQEApAIAIeEBAQCkAgAh4gEAANQC9QEi8QEIANUCACHyAQgA1QIAIfMBAQCkAgAh9QEIANUCACH2AQgA1QIAIfcBCADVAgAh-AEBAKQCACH5AQEApAIAIfoBAQC1AgAh-wEBAKQCACH8AQEApAIAIf0BAQCkAgAh_wEAANYC_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-7AQAAjwMAMLwBAACQAwAQvQEAAI8DADC-AQEApAIAIcIBQAClAgAhwwFAAKUCACHRAQEApAIAIeYBAQCkAgAh5wECANwCACHoAQEAtQIAIekBAQC1AgAh6gEgALQCACHrAQEAtQIAIewBIAC0AgAh7QEgALQCACEPuwEAAI8DADC8AQAAkAMAEL0BAACPAwAwvgEBAKQCACHCAUAApQIAIcMBQAClAgAh0QEBAKQCACHmAQEApAIAIecBAgDcAgAh6AEBALUCACHpAQEAtQIAIeoBIAC0AgAh6wEBALUCACHsASAAtAIAIe0BIAC0AgAhC74BAQDvAgAhwgFAAPACACHDAUAA8AIAIeYBAQDvAgAh5wECAJIDACHoAQEA9QIAIekBAQD1AgAh6gEgAIEDACHrAQEA9QIAIewBIACBAwAh7QEgAIEDACEFqAICAAAAAa8CAgAAAAGwAgIAAAABsQICAAAAAbICAgAAAAEOBgAAlAMAIA8AAJYDACAQAACVAwAgvgEBAO8CACHCAUAA8AIAIcMBQADwAgAh5gEBAO8CACHnAQIAkgMAIegBAQD1AgAh6QEBAPUCACHqASAAgQMAIesBAQD1AgAh7AEgAIEDACHtASAAgQMAIQcfAAClBQAgIAAAswUAIKUCAACmBQAgpgIAALIFACCpAgAAIAAgqgIAACAAIKsCAAAiACALHwAAlwMAMCAAAJsDADClAgAAmAMAMKYCAACZAwAwpwIAAJoDACCoAgAAjAMAMKkCAACMAwAwqgIAAIwDADCrAgAAjAMAMKwCAACcAwAwrQIAAI8DADAFHwAApwUAICAAALAFACClAgAAqAUAIKYCAACvBQAgqwIAAA0AIA4DAACiAwAgDwAAowMAIBAAAKEDACC-AQEAAAABwgFAAAAAAcMBQAAAAAHRAQEAAAAB5gEBAAAAAecBAgAAAAHoAQEAAAAB6QEBAAAAAeoBIAAAAAHsASAAAAAB7QEgAAAAAQIAAAAiACAfAACgAwAgAwAAACIAIB8AAKADACAgAACeAwAgARgAAK4FADACAAAAIgAgGAAAngMAIAIAAACQAwAgGAAAnQMAIAu-AQEA7wIAIcIBQADwAgAhwwFAAPACACHRAQEA7wIAIeYBAQDvAgAh5wECAJIDACHoAQEA9QIAIekBAQD1AgAh6gEgAIEDACHsASAAgQMAIe0BIACBAwAhDgMAAJ8DACAPAACWAwAgEAAAlQMAIL4BAQDvAgAhwgFAAPACACHDAUAA8AIAIdEBAQDvAgAh5gEBAO8CACHnAQIAkgMAIegBAQD1AgAh6QEBAPUCACHqASAAgQMAIewBIACBAwAh7QEgAIEDACEFHwAAqQUAICAAAKwFACClAgAAqgUAIKYCAACrBQAgqwIAAL0BACAOAwAAogMAIA8AAKMDACAQAAChAwAgvgEBAAAAAcIBQAAAAAHDAUAAAAAB0QEBAAAAAeYBAQAAAAHnAQIAAAAB6AEBAAAAAekBAQAAAAHqASAAAAAB7AEgAAAAAe0BIAAAAAEEHwAAlwMAMKUCAACYAwAwpwIAAJoDACCrAgAAjAMAMAMfAACpBQAgpQIAAKoFACCrAgAAvQEAIAMfAACnBQAgpQIAAKgFACCrAgAADQAgDgYAAKUDACAPAACjAwAgEAAAoQMAIL4BAQAAAAHCAUAAAAABwwFAAAAAAeYBAQAAAAHnAQIAAAAB6AEBAAAAAekBAQAAAAHqASAAAAAB6wEBAAAAAewBIAAAAAHtASAAAAABAx8AAKUFACClAgAApgUAIKsCAAAiACAYDQAAxQMAIL4BAQAAAAHCAUAAAAABwwFAAAAAAeEBAQAAAAHiAQAAAPUBAvEBCAAAAAHyAQgAAAAB8wEBAAAAAfUBCAAAAAH2AQgAAAAB9wEIAAAAAfgBAQAAAAH5AQEAAAAB-gEBAAAAAfsBAQAAAAH8AQEAAAAB_QEBAAAAAf8BAAAA_wECgAJAAAAAAYECAQAAAAGCAgEAAAABgwJAAAAAAYQCQAAAAAECAAAALQAgHwAAxAMAIAMAAAAtACAfAADEAwAgIAAAswMAIAEYAACkBQAwHQMAANgCACANAADZAgAguwEAANMCADC8AQAAKwAQvQEAANMCADC-AQEAAAABwgFAAKUCACHDAUAApQIAIdEBAQCkAgAh4QEBAKQCACHiAQAA1AL1ASLxAQgA1QIAIfIBCADVAgAh8wEBAAAAAfUBCADVAgAh9gEIANUCACH3AQgA1QIAIfgBAQCkAgAh-QEBAKQCACH6AQEAtQIAIfsBAQCkAgAh_AEBAKQCACH9AQEApAIAIf8BAADWAv8BIoACQADXAgAhgQIBALUCACGCAgEAtQIAIYMCQADXAgAhhAJAANcCACECAAAALQAgGAAAswMAIAIAAACuAwAgGAAArwMAIBu7AQAArQMAMLwBAACuAwAQvQEAAK0DADC-AQEApAIAIcIBQAClAgAhwwFAAKUCACHRAQEApAIAIeEBAQCkAgAh4gEAANQC9QEi8QEIANUCACHyAQgA1QIAIfMBAQCkAgAh9QEIANUCACH2AQgA1QIAIfcBCADVAgAh-AEBAKQCACH5AQEApAIAIfoBAQC1AgAh-wEBAKQCACH8AQEApAIAIf0BAQCkAgAh_wEAANYC_wEigAJAANcCACGBAgEAtQIAIYICAQC1AgAhgwJAANcCACGEAkAA1wIAIRu7AQAArQMAMLwBAACuAwAQvQEAAK0DADC-AQEApAIAIcIBQAClAgAhwwFAAKUCACHRAQEApAIAIeEBAQCkAgAh4gEAANQC9QEi8QEIANUCACHyAQgA1QIAIfMBAQCkAgAh9QEIANUCACH2AQgA1QIAIfcBCADVAgAh-AEBAKQCACH5AQEApAIAIfoBAQC1AgAh-wEBAKQCACH8AQEApAIAIf0BAQCkAgAh_wEAANYC_wEigAJAANcCACGBAgEAtQIAIYICAQC1AgAhgwJAANcCACGEAkAA1wIAIRe-AQEA7wIAIcIBQADwAgAhwwFAAPACACHhAQEA7wIAIeIBAACwA_UBIvEBCACxAwAh8gEIALEDACHzAQEA7wIAIfUBCACxAwAh9gEIALEDACH3AQgAsQMAIfgBAQDvAgAh-QEBAO8CACH6AQEA9QIAIfsBAQDvAgAh_AEBAO8CACH9AQEA7wIAIf8BAACyA_8BIoACQAD2AgAhgQIBAPUCACGCAgEA9QIAIYMCQAD2AgAhhAJAAPYCACEBqAIAAAD1AQIFqAIIAAAAAa8CCAAAAAGwAggAAAABsQIIAAAAAbICCAAAAAEBqAIAAAD_AQIYDQAAtAMAIL4BAQDvAgAhwgFAAPACACHDAUAA8AIAIeEBAQDvAgAh4gEAALAD9QEi8QEIALEDACHyAQgAsQMAIfMBAQDvAgAh9QEIALEDACH2AQgAsQMAIfcBCACxAwAh-AEBAO8CACH5AQEA7wIAIfoBAQD1AgAh-wEBAO8CACH8AQEA7wIAIf0BAQDvAgAh_wEAALID_wEigAJAAPYCACGBAgEA9QIAIYICAQD1AgAhgwJAAPYCACGEAkAA9gIAIQsfAAC1AwAwIAAAugMAMKUCAAC2AwAwpgIAALcDADCnAgAAuAMAIKgCAAC5AwAwqQIAALkDADCqAgAAuQMAMKsCAAC5AwAwrAIAALsDADCtAgAAvAMAMAkPAADDAwAgvgEBAAAAAcIBQAAAAAHDAUAAAAAB5gEBAAAAAe8BAgAAAAHwAQgAAAAB8QEIAAAAAfIBCAAAAAECAAAAHAAgHwAAwgMAIAMAAAAcACAfAADCAwAgIAAAwAMAIAEYAACjBQAwDg4AAOECACAPAADeAgAguwEAAN8CADC8AQAAGgAQvQEAAN8CADC-AQEAAAABwgFAAKUCACHDAUAApQIAIeYBAQCkAgAh7gEBAKQCACHvAQIA4AIAIfABCADVAgAh8QEIANUCACHyAQgA1QIAIQIAAAAcACAYAADAAwAgAgAAAL0DACAYAAC-AwAgDLsBAAC8AwAwvAEAAL0DABC9AQAAvAMAML4BAQCkAgAhwgFAAKUCACHDAUAApQIAIeYBAQCkAgAh7gEBAKQCACHvAQIA4AIAIfABCADVAgAh8QEIANUCACHyAQgA1QIAIQy7AQAAvAMAMLwBAAC9AwAQvQEAALwDADC-AQEApAIAIcIBQAClAgAhwwFAAKUCACHmAQEApAIAIe4BAQCkAgAh7wECAOACACHwAQgA1QIAIfEBCADVAgAh8gEIANUCACEIvgEBAO8CACHCAUAA8AIAIcMBQADwAgAh5gEBAO8CACHvAQIAvwMAIfABCACxAwAh8QEIALEDACHyAQgAsQMAIQWoAgIAAAABrwICAAAAAbACAgAAAAGxAgIAAAABsgICAAAAAQkPAADBAwAgvgEBAO8CACHCAUAA8AIAIcMBQADwAgAh5gEBAO8CACHvAQIAvwMAIfABCACxAwAh8QEIALEDACHyAQgAsQMAIQUfAACeBQAgIAAAoQUAIKUCAACfBQAgpgIAAKAFACCrAgAADQAgCQ8AAMMDACC-AQEAAAABwgFAAAAAAcMBQAAAAAHmAQEAAAAB7wECAAAAAfABCAAAAAHxAQgAAAAB8gEIAAAAAQMfAACeBQAgpQIAAJ8FACCrAgAADQAgGA0AAMUDACC-AQEAAAABwgFAAAAAAcMBQAAAAAHhAQEAAAAB4gEAAAD1AQLxAQgAAAAB8gEIAAAAAfMBAQAAAAH1AQgAAAAB9gEIAAAAAfcBCAAAAAH4AQEAAAAB-QEBAAAAAfoBAQAAAAH7AQEAAAAB_AEBAAAAAf0BAQAAAAH_AQAAAP8BAoACQAAAAAGBAgEAAAABggIBAAAAAYMCQAAAAAGEAkAAAAABBB8AALUDADClAgAAtgMAMKcCAAC4AwAgqwIAALkDADAGDwAA0wMAIL4BAQAAAAHCAUAAAAABwwFAAAAAAeYBAQAAAAHvAQIAAAABAgAAAAEAIB8AANIDACADAAAAAQAgHwAA0gMAICAAANADACABGAAAnQUAMAwDAADYAgAgDwAA3gIAILsBAADiAgAwvAEAABcAEL0BAADiAgAwvgEBAAAAAcIBQAClAgAhwwFAAKUCACHRAQEApAIAIeYBAQCkAgAh7wECAOACACGiAgAA6wIAIAIAAAABACAYAADQAwAgAgAAAM4DACAYAADPAwAgCbsBAADNAwAwvAEAAM4DABC9AQAAzQMAML4BAQCkAgAhwgFAAKUCACHDAUAApQIAIdEBAQCkAgAh5gEBAKQCACHvAQIA4AIAIQm7AQAAzQMAMLwBAADOAwAQvQEAAM0DADC-AQEApAIAIcIBQAClAgAhwwFAAKUCACHRAQEApAIAIeYBAQCkAgAh7wECAOACACEFvgEBAO8CACHCAUAA8AIAIcMBQADwAgAh5gEBAO8CACHvAQIAvwMAIQYPAADRAwAgvgEBAO8CACHCAUAA8AIAIcMBQADwAgAh5gEBAO8CACHvAQIAvwMAIQUfAACYBQAgIAAAmwUAIKUCAACZBQAgpgIAAJoFACCrAgAADQAgBg8AANMDACC-AQEAAAABwgFAAAAAAcMBQAAAAAHmAQEAAAAB7wECAAAAAQMfAACYBQAgpQIAAJkFACCrAgAADQAgIQoAAIYEACAMAACHBAAgDQAAiAQAIBEAAIkEACC-AQEAAAABwgFAAAAAAcMBQAAAAAHcAQEAAAAB8AEIAAAAAYUCAQAAAAGGAgEAAAABhwIBAAAAAYgCAQAAAAGJAgEAAAABigIIAAAAAYsCCAAAAAGMAgIAAAABjQICAAAAAY4CAQAAAAGPAgEAAAABkAIAAIUEACCRAgEAAAABkgIBAAAAAZMCAQAAAAGUAiAAAAABlQJAAAAAAZYCAQAAAAGXAgEAAAABmAIBAAAAAZkCAQAAAAGaAgEAAAABnAIgAAAAAZ0CIAAAAAECAAAADQAgHwAAhAQAIAMAAAANACAfAACEBAAgIAAA4AMAIAEYAACXBQAwJgoAAOgCACALAADYAgAgDAAAuQIAIA0AANkCACARAAC7AgAguwEAAOYCADC8AQAACwAQvQEAAOYCADC-AQEAAAABwgFAAKUCACHDAUAApQIAIdwBAQCkAgAh8AEIANUCACGFAgEAAAABhgIBAAAAAYcCAQC1AgAhiAIBALUCACGJAgEApAIAIYoCCADnAgAhiwIIAOcCACGMAgIA4AIAIY0CAgDgAgAhjgIBAKQCACGPAgEAtQIAIZACAADPAgAgkQIBALUCACGSAgEAtQIAIZMCAQC1AgAhlAIgALQCACGVAkAA1wIAIZYCAQC1AgAhlwIBALUCACGYAgEAtQIAIZkCAQC1AgAhmgIBAKQCACGbAgEApAIAIZwCIAC0AgAhnQIgALQCACECAAAADQAgGAAA4AMAIAIAAADcAwAgGAAA3QMAICG7AQAA2wMAMLwBAADcAwAQvQEAANsDADC-AQEApAIAIcIBQAClAgAhwwFAAKUCACHcAQEApAIAIfABCADVAgAhhQIBAKQCACGGAgEAtQIAIYcCAQC1AgAhiAIBALUCACGJAgEApAIAIYoCCADnAgAhiwIIAOcCACGMAgIA4AIAIY0CAgDgAgAhjgIBAKQCACGPAgEAtQIAIZACAADPAgAgkQIBALUCACGSAgEAtQIAIZMCAQC1AgAhlAIgALQCACGVAkAA1wIAIZYCAQC1AgAhlwIBALUCACGYAgEAtQIAIZkCAQC1AgAhmgIBAKQCACGbAgEApAIAIZwCIAC0AgAhnQIgALQCACEhuwEAANsDADC8AQAA3AMAEL0BAADbAwAwvgEBAKQCACHCAUAApQIAIcMBQAClAgAh3AEBAKQCACHwAQgA1QIAIYUCAQCkAgAhhgIBALUCACGHAgEAtQIAIYgCAQC1AgAhiQIBAKQCACGKAggA5wIAIYsCCADnAgAhjAICAOACACGNAgIA4AIAIY4CAQCkAgAhjwIBALUCACGQAgAAzwIAIJECAQC1AgAhkgIBALUCACGTAgEAtQIAIZQCIAC0AgAhlQJAANcCACGWAgEAtQIAIZcCAQC1AgAhmAIBALUCACGZAgEAtQIAIZoCAQCkAgAhmwIBAKQCACGcAiAAtAIAIZ0CIAC0AgAhHb4BAQDvAgAhwgFAAPACACHDAUAA8AIAIdwBAQDvAgAh8AEIALEDACGFAgEA7wIAIYYCAQD1AgAhhwIBAPUCACGIAgEA9QIAIYkCAQDvAgAhigIIAN4DACGLAggA3gMAIYwCAgC_AwAhjQICAL8DACGOAgEA7wIAIY8CAQD1AgAhkAIAAN8DACCRAgEA9QIAIZICAQD1AgAhkwIBAPUCACGUAiAAgQMAIZUCQAD2AgAhlgIBAPUCACGXAgEA9QIAIZgCAQD1AgAhmQIBAPUCACGaAgEA7wIAIZwCIACBAwAhnQIgAIEDACEFqAIIAAAAAa8CCAAAAAGwAggAAAABsQIIAAAAAbICCAAAAAECqAIBAAAABK4CAQAAAAUhCgAA4QMAIAwAAOIDACANAADjAwAgEQAA5AMAIL4BAQDvAgAhwgFAAPACACHDAUAA8AIAIdwBAQDvAgAh8AEIALEDACGFAgEA7wIAIYYCAQD1AgAhhwIBAPUCACGIAgEA9QIAIYkCAQDvAgAhigIIAN4DACGLAggA3gMAIYwCAgC_AwAhjQICAL8DACGOAgEA7wIAIY8CAQD1AgAhkAIAAN8DACCRAgEA9QIAIZICAQD1AgAhkwIBAPUCACGUAiAAgQMAIZUCQAD2AgAhlgIBAPUCACGXAgEA9QIAIZgCAQD1AgAhmQIBAPUCACGaAgEA7wIAIZwCIACBAwAhnQIgAIEDACEFHwAAhQUAICAAAJUFACClAgAAhgUAIKYCAACUBQAgqwIAABIAIAsfAAD5AwAwIAAA_QMAMKUCAAD6AwAwpgIAAPsDADCnAgAA_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-BAAgIAAAgQUAIKUCAAD_BAAgpgIAAIAFACCrAgAAvQEAIAMfAAD-BAAgpQIAAP8EACCrAgAAvQEAIAAAAAAABR8AAPkEACAgAAD8BAAgpQIAAPoEACCmAgAA-wQAIKsCAAC9AQAgAx8AAPkEACClAgAA-gQAIKsCAAC9AQAgAAAAAAAHHwAA8gQAICAAAPcEACClAgAA8wQAIKYCAAD2BAAgqQIAAA8AIKoCAAAPACCrAgAAEgAgCx8AANcEADAgAADcBAAwpQIAANgEADCmAgAA2QQAMKcCAADaBAAgqAIAANsEADCpAgAA2wQAMKoCAADbBAAwqwIAANsEADCsAgAA3QQAMK0CAADeBAAwCx8AAM4EADAgAADSBAAwpQIAAM8EADCmAgAA0AQAMKcCAADRBAAgqAIAANgDADCpAgAA2AMAMKoCAADYAwAwqwIAANgDADCsAgAA0wQAMK0CAADbAwAwIQsAAMUEACAMAACHBAAgDQAAiAQAIBEAAIkEACC-AQEAAAABwgFAAAAAAcMBQAAAAAHcAQEAAAAB8AEIAAAAAYUCAQAAAAGGAgEAAAABhwIBAAAAAYgCAQAAAAGJAgEAAAABigIIAAAAAYsCCAAAAAGMAgIAAAABjQICAAAAAY4CAQAAAAGPAgEAAAABkAIAAIUEACCRAgEAAAABkgIBAAAAAZMCAQAAAAGUAiAAAAABlQJAAAAAAZYCAQAAAAGXAgEAAAABmAIBAAAAAZkCAQAAAAGbAgEAAAABnAIgAAAAAZ0CIAAAAAECAAAADQAgHwAA1gQAIAMAAAANACAfAADWBAAgIAAA1QQAIAEYAAD1BAAwAgAAAA0AIBgAANUEACACAAAA3AMAIBgAANQEACAdvgEBAO8CACHCAUAA8AIAIcMBQADwAgAh3AEBAO8CACHwAQgAsQMAIYUCAQDvAgAhhgIBAPUCACGHAgEA9QIAIYgCAQD1AgAhiQIBAO8CACGKAggA3gMAIYsCCADeAwAhjAICAL8DACGNAgIAvwMAIY4CAQDvAgAhjwIBAPUCACGQAgAA3wMAIJECAQD1AgAhkgIBAPUCACGTAgEA9QIAIZQCIACBAwAhlQJAAPYCACGWAgEA9QIAIZcCAQD1AgAhmAIBAPUCACGZAgEA9QIAIZsCAQDvAgAhnAIgAIEDACGdAiAAgQMAISELAADEBAAgDAAA4gMAIA0AAOMDACARAADkAwAgvgEBAO8CACHCAUAA8AIAIcMBQADwAgAh3AEBAO8CACHwAQgAsQMAIYUCAQDvAgAhhgIBAPUCACGHAgEA9QIAIYgCAQD1AgAhiQIBAO8CACGKAggA3gMAIYsCCADeAwAhjAICAL8DACGNAgIAvwMAIY4CAQDvAgAhjwIBAPUCACGQAgAA3wMAIJECAQD1AgAhkgIBAPUCACGTAgEA9QIAIZQCIACBAwAhlQJAAPYCACGWAgEA9QIAIZcCAQD1AgAhmAIBAPUCACGZAgEA9QIAIZsCAQDvAgAhnAIgAIEDACGdAiAAgQMAISELAADFBAAgDAAAhwQAIA0AAIgEACARAACJBAAgvgEBAAAAAcIBQAAAAAHDAUAAAAAB3AEBAAAAAfABCAAAAAGFAgEAAAABhgIBAAAAAYcCAQAAAAGIAgEAAAABiQIBAAAAAYoCCAAAAAGLAggAAAABjAICAAAAAY0CAgAAAAGOAgEAAAABjwIBAAAAAZACAACFBAAgkQIBAAAAAZICAQAAAAGTAgEAAAABlAIgAAAAAZUCQAAAAAGWAgEAAAABlwIBAAAAAZgCAQAAAAGZAgEAAAABmwIBAAAAAZwCIAAAAAGdAiAAAAABCwcAAOMEACAIAADkBAAgDgIAAAABvgEBAAAAAcIBQAAAAAHDAUAAAAAB3AEBAAAAAd8BAQAAAAGFAgEAAAABhwIBAAAAAZwCIAAAAAECAAAAEgAgHwAA4gQAIAMAAAASACAfAADiBAAgIAAA4QQAIAEYAAD0BAAwEAYAAOQCACAHAADlAgAgCAAAuAIAIA4CAOACACG7AQAA4wIAMLwBAAAPABC9AQAA4wIAML4BAQAAAAHCAUAApQIAIcMBQAClAgAh3AEBAKQCACHfAQEAtQIAIesBAQC1AgAhhQIBAAAAAYcCAQC1AgAhnAIgALQCACECAAAAEgAgGAAA4QQAIAIAAADfBAAgGAAA4AQAIA0OAgDgAgAhuwEAAN4EADC8AQAA3wQAEL0BAADeBAAwvgEBAKQCACHCAUAApQIAIcMBQAClAgAh3AEBAKQCACHfAQEAtQIAIesBAQC1AgAhhQIBAKQCACGHAgEAtQIAIZwCIAC0AgAhDQ4CAOACACG7AQAA3gQAMLwBAADfBAAQvQEAAN4EADC-AQEApAIAIcIBQAClAgAhwwFAAKUCACHcAQEApAIAId8BAQC1AgAh6wEBALUCACGFAgEApAIAIYcCAQC1AgAhnAIgALQCACEJDgIAvwMAIb4BAQDvAgAhwgFAAPACACHDAUAA8AIAIdwBAQDvAgAh3wEBAPUCACGFAgEA7wIAIYcCAQD1AgAhnAIgAIEDACELBwAAzAQAIAgAAM0EACAOAgC_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_gQAIAMAAADAAQAgHwAA_gQAICAAAIIFACARAAAAwAEAIAQAAIIDACAFAACDAwAgCAAAhAMAIAwAAIUDACARAACHAwAgGAAAggUAIL4BAQDvAgAhwgFAAPACACHDAUAA8AIAIdwBAQDvAgAh3QEBAO8CACHeASAAgQMAId8BAQD1AgAh4AEBAPUCACHhAQEA9QIAIeIBAQD1AgAhDwQAAIIDACAFAACDAwAgCAAAhAMAIAwAAIUDACARAACHAwAgvgEBAO8CACHCAUAA8AIAIcMBQADwAgAh3AEBAO8CACHdAQEA7wIAId4BIACBAwAh3wEBAPUCACHgAQEA9QIAIeEBAQD1AgAh4gEBAPUCACEHvgEBAAAAAcEBQAAAAAHCAUAAAAABwwFAAAAAAdkBAQAAAAHaAQEAAAAB2wEBAAAAAQy-AQEAAAABwgFAAAAAAcMBQAAAAAHPAQEAAAAB0AEBAAAAAdIBAQAAAAHTAQEAAAAB1AEBAAAAAdUBQAAAAAHWAUAAAAAB1wEBAAAAAdgBAQAAAAEMBgAA5QQAIAcAAOMEACAOAgAAAAG-AQEAAAABwgFAAAAAAcMBQAAAAAHcAQEAAAAB3wEBAAAAAesBAQAAAAGFAgEAAAABhwIBAAAAAZwCIAAAAAECAAAAEgAgHwAAhQUAIA8EAACiBAAgBQAAowQAIAgAAKQEACARAACnBAAgEgAApgQAIL4BAQAAAAHCAUAAAAABwwFAAAAAAdwBAQAAAAHdAQEAAAAB3gEgAAAAAd8BAQAAAAHgAQEAAAAB4QEBAAAAAeIBAQAAAAECAAAAvQEAIB8AAIcFACADAAAAwAEAIB8AAIcFACAgAACLBQAgEQAAAMABACAEAACCAwAgBQAAgwMAIAgAAIQDACARAACHAwAgEgAAhgMAIBgAAIsFACC-AQEA7wIAIcIBQADwAgAhwwFAAPACACHcAQEA7wIAId0BAQDvAgAh3gEgAIEDACHfAQEA9QIAIeABAQD1AgAh4QEBAPUCACHiAQEA9QIAIQ8EAACCAwAgBQAAgwMAIAgAAIQDACARAACHAwAgEgAAhgMAIL4BAQDvAgAhwgFAAPACACHDAUAA8AIAIdwBAQDvAgAh3QEBAO8CACHeASAAgQMAId8BAQD1AgAh4AEBAPUCACHhAQEA9QIAIeIBAQD1AgAhBb4BAQAAAAHCAUAAAAABwwFAAAAAAdEBAQAAAAHvAQIAAAABGQMAAL4EACC-AQEAAAABwgFAAAAAAcMBQAAAAAHRAQEAAAAB4QEBAAAAAeIBAAAA9QEC8QEIAAAAAfIBCAAAAAHzAQEAAAAB9QEIAAAAAfYBCAAAAAH3AQgAAAAB-AEBAAAAAfkBAQAAAAH6AQEAAAAB-wEBAAAAAfwBAQAAAAH9AQEAAAAB_wEAAAD_AQKAAkAAAAABgQIBAAAAAYICAQAAAAGDAkAAAAABhAJAAAAAAQIAAAAtACAfAACNBQAgAwAAACsAIB8AAI0FACAgAACRBQAgGwAAACsAIAMAAL0EACAYAACRBQAgvgEBAO8CACHCAUAA8AIAIcMBQADwAgAh0QEBAO8CACHhAQEA7wIAIeIBAACwA_UBIvEBCACxAwAh8gEIALEDACHzAQEA7wIAIfUBCACxAwAh9gEIALEDACH3AQgAsQMAIfgBAQDvAgAh-QEBAO8CACH6AQEA9QIAIfsBAQDvAgAh_AEBAO8CACH9AQEA7wIAIf8BAACyA_8BIoACQAD2AgAhgQIBAPUCACGCAgEA9QIAIYMCQAD2AgAhhAJAAPYCACEZAwAAvQQAIL4BAQDvAgAhwgFAAPACACHDAUAA8AIAIdEBAQDvAgAh4QEBAO8CACHiAQAAsAP1ASLxAQgAsQMAIfIBCACxAwAh8wEBAO8CACH1AQgAsQMAIfYBCACxAwAh9wEIALEDACH4AQEA7wIAIfkBAQDvAgAh-gEBAPUCACH7AQEA7wIAIfwBAQDvAgAh_QEBAO8CACH_AQAAsgP_ASKAAkAA9gIAIYECAQD1AgAhggIBAPUCACGDAkAA9gIAIYQCQAD2AgAhCL4BAQAAAAHCAUAAAAABwwFAAAAAAe4BAQAAAAHvAQIAAAAB8AEIAAAAAfEBCAAAAAHyAQgAAAABC74BAQAAAAHCAUAAAAABwwFAAAAAAdEBAQAAAAHnAQIAAAAB6AEBAAAAAekBAQAAAAHqASAAAAAB6wEBAAAAAewBIAAAAAHtASAAAAABAwAAAA8AIB8AAIUFACAgAACWBQAgDgAAAA8AIAYAAMsEACAHAADMBAAgDgIAvwMAIRgAAJYFACC-AQEA7wIAIcIBQADwAgAhwwFAAPACACHcAQEA7wIAId8BAQD1AgAh6wEBAPUCACGFAgEA7wIAIYcCAQD1AgAhnAIgAIEDACEMBgAAywQAIAcAAMwEACAOAgC_AwAhvgEBAO8CACHCAUAA8AIAIcMBQADwAgAh3AEBAO8CACHfAQEA9QIAIesBAQD1AgAhhQIBAO8CACGHAgEA9QIAIZwCIACBAwAhHb4BAQAAAAHCAUAAAAABwwFAAAAAAdwBAQAAAAHwAQgAAAABhQIBAAAAAYYCAQAAAAGHAgEAAAABiAIBAAAAAYkCAQAAAAGKAggAAAABiwIIAAAAAYwCAgAAAAGNAgIAAAABjgIBAAAAAY8CAQAAAAGQAgAAhQQAIJECAQAAAAGSAgEAAAABkwIBAAAAAZQCIAAAAAGVAkAAAAABlgIBAAAAAZcCAQAAAAGYAgEAAAABmQIBAAAAAZoCAQAAAAGcAiAAAAABnQIgAAAAASIKAACGBAAgCwAAxQQAIA0AAIgEACARAACJBAAgvgEBAAAAAcIBQAAAAAHDAUAAAAAB3AEBAAAAAfABCAAAAAGFAgEAAAABhgIBAAAAAYcCAQAAAAGIAgEAAAABiQIBAAAAAYoCCAAAAAGLAggAAAABjAICAAAAAY0CAgAAAAGOAgEAAAABjwIBAAAAAZACAACFBAAgkQIBAAAAAZICAQAAAAGTAgEAAAABlAIgAAAAAZUCQAAAAAGWAgEAAAABlwIBAAAAAZgCAQAAAAGZAgEAAAABmgIBAAAAAZsCAQAAAAGcAiAAAAABnQIgAAAAAQIAAAANACAfAACYBQAgAwAAAAsAIB8AAJgFACAgAACcBQAgJAAAAAsAIAoAAOEDACALAADEBAAgDQAA4wMAIBEAAOQDACAYAACcBQAgvgEBAO8CACHCAUAA8AIAIcMBQADwAgAh3AEBAO8CACHwAQgAsQMAIYUCAQDvAgAhhgIBAPUCACGHAgEA9QIAIYgCAQD1AgAhiQIBAO8CACGKAggA3gMAIYsCCADeAwAhjAICAL8DACGNAgIAvwMAIY4CAQDvAgAhjwIBAPUCACGQAgAA3wMAIJECAQD1AgAhkgIBAPUCACGTAgEA9QIAIZQCIACBAwAhlQJAAPYCACGWAgEA9QIAIZcCAQD1AgAhmAIBAPUCACGZAgEA9QIAIZoCAQDvAgAhmwIBAO8CACGcAiAAgQMAIZ0CIACBAwAhIgoAAOEDACALAADEBAAgDQAA4wMAIBEAAOQDACC-AQEA7wIAIcIBQADwAgAhwwFAAPACACHcAQEA7wIAIfABCACxAwAhhQIBAO8CACGGAgEA9QIAIYcCAQD1AgAhiAIBAPUCACGJAgEA7wIAIYoCCADeAwAhiwIIAN4DACGMAgIAvwMAIY0CAgC_AwAhjgIBAO8CACGPAgEA9QIAIZACAADfAwAgkQIBAPUCACGSAgEA9QIAIZMCAQD1AgAhlAIgAIEDACGVAkAA9gIAIZYCAQD1AgAhlwIBAPUCACGYAgEA9QIAIZkCAQD1AgAhmgIBAO8CACGbAgEA7wIAIZwCIACBAwAhnQIgAIEDACEFvgEBAAAAAcIBQAAAAAHDAUAAAAAB5gEBAAAAAe8BAgAAAAEiCgAAhgQAIAsAAMUEACAMAACHBAAgEQAAiQQAIL4BAQAAAAHCAUAAAAABwwFAAAAAAdwBAQAAAAHwAQgAAAABhQIBAAAAAYYCAQAAAAGHAgEAAAABiAIBAAAAAYkCAQAAAAGKAggAAAABiwIIAAAAAYwCAgAAAAGNAgIAAAABjgIBAAAAAY8CAQAAAAGQAgAAhQQAIJECAQAAAAGSAgEAAAABkwIBAAAAAZQCIAAAAAGVAkAAAAABlgIBAAAAAZcCAQAAAAGYAgEAAAABmQIBAAAAAZoCAQAAAAGbAgEAAAABnAIgAAAAAZ0CIAAAAAECAAAADQAgHwAAngUAIAMAAAALACAfAACeBQAgIAAAogUAICQAAAALACAKAADhAwAgCwAAxAQAIAwAAOIDACARAADkAwAgGAAAogUAIL4BAQDvAgAhwgFAAPACACHDAUAA8AIAIdwBAQDvAgAh8AEIALEDACGFAgEA7wIAIYYCAQD1AgAhhwIBAPUCACGIAgEA9QIAIYkCAQDvAgAhigIIAN4DACGLAggA3gMAIYwCAgC_AwAhjQICAL8DACGOAgEA7wIAIY8CAQD1AgAhkAIAAN8DACCRAgEA9QIAIZICAQD1AgAhkwIBAPUCACGUAiAAgQMAIZUCQAD2AgAhlgIBAPUCACGXAgEA9QIAIZgCAQD1AgAhmQIBAPUCACGaAgEA7wIAIZsCAQDvAgAhnAIgAIEDACGdAiAAgQMAISIKAADhAwAgCwAAxAQAIAwAAOIDACARAADkAwAgvgEBAO8CACHCAUAA8AIAIcMBQADwAgAh3AEBAO8CACHwAQgAsQMAIYUCAQDvAgAhhgIBAPUCACGHAgEA9QIAIYgCAQD1AgAhiQIBAO8CACGKAggA3gMAIYsCCADeAwAhjAICAL8DACGNAgIAvwMAIY4CAQDvAgAhjwIBAPUCACGQAgAA3wMAIJECAQD1AgAhkgIBAPUCACGTAgEA9QIAIZQCIACBAwAhlQJAAPYCACGWAgEA9QIAIZcCAQD1AgAhmAIBAPUCACGZAgEA9QIAIZoCAQDvAgAhmwIBAO8CACGcAiAAgQMAIZ0CIACBAwAhCL4BAQAAAAHCAUAAAAABwwFAAAAAAeYBAQAAAAHvAQIAAAAB8AEIAAAAAfEBCAAAAAHyAQgAAAABF74BAQAAAAHCAUAAAAABwwFAAAAAAeEBAQAAAAHiAQAAAPUBAvEBCAAAAAHyAQgAAAAB8wEBAAAAAfUBCAAAAAH2AQgAAAAB9wEIAAAAAfgBAQAAAAH5AQEAAAAB-gEBAAAAAfsBAQAAAAH8AQEAAAAB_QEBAAAAAf8BAAAA_wECgAJAAAAAAYECAQAAAAGCAgEAAAABgwJAAAAAAYQCQAAAAAEPAwAAogMAIAYAAKUDACAPAACjAwAgvgEBAAAAAcIBQAAAAAHDAUAAAAAB0QEBAAAAAeYBAQAAAAHnAQIAAAAB6AEBAAAAAekBAQAAAAHqASAAAAAB6wEBAAAAAewBIAAAAAHtASAAAAABAgAAACIAIB8AAKUFACAiCgAAhgQAIAsAAMUEACAMAACHBAAgDQAAiAQAIL4BAQAAAAHCAUAAAAABwwFAAAAAAdwBAQAAAAHwAQgAAAABhQIBAAAAAYYCAQAAAAGHAgEAAAABiAIBAAAAAYkCAQAAAAGKAggAAAABiwIIAAAAAYwCAgAAAAGNAgIAAAABjgIBAAAAAY8CAQAAAAGQAgAAhQQAIJECAQAAAAGSAgEAAAABkwIBAAAAAZQCIAAAAAGVAkAAAAABlgIBAAAAAZcCAQAAAAGYAgEAAAABmQIBAAAAAZoCAQAAAAGbAgEAAAABnAIgAAAAAZ0CIAAAAAECAAAADQAgHwAApwUAIA8EAACiBAAgBQAAowQAIAgAAKQEACAMAAClBAAgEgAApgQAIL4BAQAAAAHCAUAAAAABwwFAAAAAAdwBAQAAAAHdAQEAAAAB3gEgAAAAAd8BAQAAAAHgAQEAAAAB4QEBAAAAAeIBAQAAAAECAAAAvQEAIB8AAKkFACADAAAAwAEAIB8AAKkFACAgAACtBQAgEQAAAMABACAEAACCAwAgBQAAgwMAIAgAAIQDACAMAACFAwAgEgAAhgMAIBgAAK0FACC-AQEA7wIAIcIBQADwAgAhwwFAAPACACHcAQEA7wIAId0BAQDvAgAh3gEgAIEDACHfAQEA9QIAIeABAQD1AgAh4QEBAPUCACHiAQEA9QIAIQ8EAACCAwAgBQAAgwMAIAgAAIQDACAMAACFAwAgEgAAhgMAIL4BAQDvAgAhwgFAAPACACHDAUAA8AIAIdwBAQDvAgAh3QEBAO8CACHeASAAgQMAId8BAQD1AgAh4AEBAPUCACHhAQEA9QIAIeIBAQD1AgAhC74BAQAAAAHCAUAAAAABwwFAAAAAAdEBAQAAAAHmAQEAAAAB5wECAAAAAegBAQAAAAHpAQEAAAAB6gEgAAAAAewBIAAAAAHtASAAAAABAwAAAAsAIB8AAKcFACAgAACxBQAgJAAAAAsAIAoAAOEDACALAADEBAAgDAAA4gMAIA0AAOMDACAYAACxBQAgvgEBAO8CACHCAUAA8AIAIcMBQADwAgAh3AEBAO8CACHwAQgAsQMAIYUCAQDvAgAhhgIBAPUCACGHAgEA9QIAIYgCAQD1AgAhiQIBAO8CACGKAggA3gMAIYsCCADeAwAhjAICAL8DACGNAgIAvwMAIY4CAQDvAgAhjwIBAPUCACGQAgAA3wMAIJECAQD1AgAhkgIBAPUCACGTAgEA9QIAIZQCIACBAwAhlQJAAPYCACGWAgEA9QIAIZcCAQD1AgAhmAIBAPUCACGZAgEA9QIAIZoCAQDvAgAhmwIBAO8CACGcAiAAgQMAIZ0CIACBAwAhIgoAAOEDACALAADEBAAgDAAA4gMAIA0AAOMDACC-AQEA7wIAIcIBQADwAgAhwwFAAPACACHcAQEA7wIAIfABCACxAwAhhQIBAO8CACGGAgEA9QIAIYcCAQD1AgAhiAIBAPUCACGJAgEA7wIAIYoCCADeAwAhiwIIAN4DACGMAgIAvwMAIY0CAgC_AwAhjgIBAO8CACGPAgEA9QIAIZACAADfAwAgkQIBAPUCACGSAgEA9QIAIZMCAQD1AgAhlAIgAIEDACGVAkAA9gIAIZYCAQD1AgAhlwIBAPUCACGYAgEA9QIAIZkCAQD1AgAhmgIBAO8CACGbAgEA7wIAIZwCIACBAwAhnQIgAIEDACEDAAAAIAAgHwAApQUAICAAALQFACARAAAAIAAgAwAAnwMAIAYAAJQDACAPAACWAwAgGAAAtAUAIL4BAQDvAgAhwgFAAPACACHDAUAA8AIAIdEBAQDvAgAh5gEBAO8CACHnAQIAkgMAIegBAQD1AgAh6QEBAPUCACHqASAAgQMAIesBAQD1AgAh7AEgAIEDACHtASAAgQMAIQ8DAACfAwAgBgAAlAMAIA8AAJYDACC-AQEA7wIAIcIBQADwAgAhwwFAAPACACHRAQEA7wIAIeYBAQDvAgAh5wECAJIDACHoAQEA9QIAIekBAQD1AgAh6gEgAIEDACHrAQEA9QIAIewBIACBAwAh7QEgAIEDACELvgEBAAAAAcIBQAAAAAHDAUAAAAAB5gEBAAAAAecBAgAAAAHoAQEAAAAB6QEBAAAAAeoBIAAAAAHrAQEAAAAB7AEgAAAAAe0BIAAAAAEPBQAAowQAIAgAAKQEACAMAAClBAAgEQAApwQAIBIAAKYEACC-AQEAAAABwgFAAAAAAcMBQAAAAAHcAQEAAAAB3QEBAAAAAd4BIAAAAAHfAQEAAAAB4AEBAAAAAeEBAQAAAAHiAQEAAAABAgAAAL0BACAfAAC2BQAgAwAAAMABACAfAAC2BQAgIAAAugUAIBEAAADAAQAgBQAAgwMAIAgAAIQDACAMAACFAwAgEQAAhwMAIBIAAIYDACAYAAC6BQAgvgEBAO8CACHCAUAA8AIAIcMBQADwAgAh3AEBAO8CACHdAQEA7wIAId4BIACBAwAh3wEBAPUCACHgAQEA9QIAIeEBAQD1AgAh4gEBAPUCACEPBQAAgwMAIAgAAIQDACAMAACFAwAgEQAAhwMAIBIAAIYDACC-AQEA7wIAIcIBQADwAgAhwwFAAPACACHcAQEA7wIAId0BAQDvAgAh3gEgAIEDACHfAQEA9QIAIeABAQD1AgAh4QEBAPUCACHiAQEA9QIAIQ8EAACiBAAgCAAApAQAIAwAAKUEACARAACnBAAgEgAApgQAIL4BAQAAAAHCAUAAAAABwwFAAAAAAdwBAQAAAAHdAQEAAAAB3gEgAAAAAd8BAQAAAAHgAQEAAAAB4QEBAAAAAeIBAQAAAAECAAAAvQEAIB8AALsFACADAAAAwAEAIB8AALsFACAgAAC_BQAgEQAAAMABACAEAACCAwAgCAAAhAMAIAwAAIUDACARAACHAwAgEgAAhgMAIBgAAL8FACC-AQEA7wIAIcIBQADwAgAhwwFAAPACACHcAQEA7wIAId0BAQDvAgAh3gEgAIEDACHfAQEA9QIAIeABAQD1AgAh4QEBAPUCACHiAQEA9QIAIQ8EAACCAwAgCAAAhAMAIAwAAIUDACARAACHAwAgEgAAhgMAIL4BAQDvAgAhwgFAAPACACHDAUAA8AIAIdwBAQDvAgAh3QEBAO8CACHeASAAgQMAId8BAQD1AgAh4AEBAPUCACHhAQEA9QIAIeIBAQD1AgAhAgMAAg8ABQcEBgMFCgQIDgUJAA4MKgERLwsSLgkBAwACAQMAAgYJAA0KAAYLAAIMGQENHQgRIwsEBhAGBxMGCBQFCQAHAgcVAAgWAAIOAAkPAAUDAwACCQAKDR4IAQ0fAAUDAAIGJAsJAAwPAAUQJQsBECYAAwwnAA0oABEpAAYEMAAFMQAIMgAMMwARNQASNAAAAgMAAg8ABQIDAAIPAAUFCQATJQAUJgAVJwAWKAAXAAAAAAAFCQATJQAUJgAVJwAWKAAXAQZVBgEGWwYFCQAcJQAdJgAeJwAfKAAgAAAAAAAFCQAcJQAdJgAeJwAfKAAgAgoABgsAAgIKAAYLAAIFCQAlJQAmJgAnJwAoKAApAAAAAAAFCQAlJQAmJgAnJwAoKAApAQMAAgEDAAIFCQAuJQAvJgAwJwAxKAAyAAAAAAAFCQAuJQAvJgAwJwAxKAAyAg4ACQ8ABQIOAAkPAAUFCQA3JQA4JgA5JwA6KAA7AAAAAAAFCQA3JQA4JgA5JwA6KAA7AwMAAgavAQsPAAUDAwACBrUBCw8ABQUJAEAlAEEmAEInAEMoAEQAAAAAAAUJAEAlAEEmAEInAEMoAEQAAAMJAEknAEooAEsAAAADCQBJJwBKKABLAQMAAgEDAAIDCQBQJwBRKABSAAAAAwkAUCcAUSgAUgEDAAIBAwACAwkAVycAWCgAWQAAAAMJAFcnAFgoAFkAAAADCQBfJwBgKABhAAAAAwkAXycAYCgAYRMCARQ2ARU3ARY4ARc5ARk7ARo9Dxs-EBxAAR1CDx5DESFEASJFASNGDylJEipKGCtLBixMBi1NBi5OBi9PBjBRBjFTDzJUGTNXBjRZDzVaGjZcBjddBjheDzlhGzpiITtjBTxkBT1lBT5mBT9nBUBpBUFrD0JsIkNuBURwD0VxI0ZyBUdzBUh0D0l3JEp4Kkt5CUx6CU17CU58CU99CVB_CVGBAQ9SggErU4QBCVSGAQ9VhwEsVogBCVeJAQlYigEPWY0BLVqOATNbjwEIXJABCF2RAQhekgEIX5MBCGCVAQhhlwEPYpgBNGOaAQhknAEPZZ0BNWaeAQhnnwEIaKABD2mjATZqpAE8a6UBC2ymAQttpwELbqgBC2-pAQtwqwELca0BD3KuAT1zsQELdLMBD3W0AT52tgELd7cBC3i4AQ95uwE_erwBRXu-AQJ8vwECfcIBAn7DAQJ_xAECgAHGAQKBAcgBD4IByQFGgwHLAQKEAc0BD4UBzgFHhgHPAQKHAdABAogB0QEPiQHUAUiKAdUBTIsB1gEDjAHXAQONAdgBA44B2QEDjwHaAQOQAdwBA5EB3gEPkgHfAU2TAeEBA5QB4wEPlQHkAU6WAeUBA5cB5gEDmAHnAQ-ZAeoBT5oB6wFTmwHsAQScAe0BBJ0B7gEEngHvAQSfAfABBKAB8gEEoQH0AQ-iAfUBVKMB9wEEpAH5AQ-lAfoBVaYB-wEEpwH8AQSoAf0BD6kBgAJWqgGBAlqrAYMCW6wBhAJbrQGHAluuAYgCW68BiQJbsAGLAluxAY0CD7IBjgJcswGQAlu0AZICD7UBkwJdtgGUAlu3AZUCW7gBlgIPuQGZAl66AZoCYg"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// prisma/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// prisma/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/modules/category/category.services.ts
var CategoryService = class {
  getCategories = async (filters) => {
    const where = {};
    if (filters?.isActive !== void 0) {
      where.isActive = filters.isActive;
    }
    if (filters?.parentId !== void 0) {
      where.parentId = filters.parentId;
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } }
      ];
    }
    const includeOptions = {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true
        }
      },
      _count: {
        select: {
          medicines: true
        }
      }
    };
    const hasPagination = filters?.page !== void 0 || filters?.limit !== void 0;
    if (hasPagination) {
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const skip = (page - 1) * limit;
      const [categories2, total] = await Promise.all([
        prisma.category.findMany({
          where,
          include: includeOptions,
          orderBy: [{ order: "asc" }, { name: "asc" }],
          skip,
          take: limit
        }),
        prisma.category.count({ where })
      ]);
      const totalPages = Math.ceil(total / limit);
      return {
        data: categories2,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages
        }
      };
    }
    const categories = await prisma.category.findMany({
      where,
      include: includeOptions,
      orderBy: [{ order: "asc" }, { name: "asc" }]
    });
    return categories;
  };
  getCategoryById = async (id) => {
    return await prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true
          }
        },
        _count: {
          select: {
            medicines: true
          }
        }
      }
    });
  };
  getCategoryBySlug = async (slug) => {
    return await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true
          }
        },
        _count: {
          select: {
            medicines: true
          }
        }
      }
    });
  };
  createCategory = async (data) => {
    return await prisma.category.create({
      data,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
  };
  updateCategory = async (id, data) => {
    return await prisma.category.update({
      where: { id },
      data,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true
          }
        }
      }
    });
  };
  deleteCategory = async (id) => {
    return await prisma.category.delete({
      where: { id }
    });
  };
};
var categoryService = new CategoryService();

// src/modules/category/category.controller.ts
var CategoryController = class {
  service = categoryService;
  index = async (req, res, next) => {
    try {
      console.log("Category Controller", req.query);
      const { isActive, parentId, search, page, limit } = req.query;
      const filters = {
        parentId: parentId === "null" ? null : parentId,
        search
      };
      if (isActive === "true" || isActive === "false") {
        filters.isActive = isActive === "true";
      }
      if (page !== void 0) {
        filters.page = parseInt(page);
      }
      if (limit !== void 0) {
        filters.limit = parseInt(limit);
      }
      const result = await this.service.getCategories(filters);
      if (result && typeof result === "object" && "pagination" in result) {
        res.status(200).json({
          success: true,
          data: result.data,
          pagination: result.pagination
        });
      } else {
        res.status(200).json({
          success: true,
          data: result
        });
      }
    } catch (error) {
      next(error);
    }
  };
  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const category = await this.service.getCategoryById(String(id));
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  };
  getBySlug = async (req, res, next) => {
    try {
      const { slug } = req.params;
      const category = await this.service.getCategoryBySlug(String(slug));
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  };
  store = async (req, res, next) => {
    try {
      const data = req.body;
      const category = await this.service.createCategory(data);
      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category
      });
    } catch (error) {
      next(error);
    }
  };
  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      console.log({ data, id }, "Update");
      const category = await this.service.updateCategory(String(id), data);
      res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category
      });
    } catch (error) {
      next(error);
    }
  };
  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.service.deleteCategory(String(id));
      res.status(200).json({
        success: true,
        message: "Category deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  };
};
var categoryController = new CategoryController();

// src/modules/category/category.routes.ts
var categoryRoutes = Router();
categoryRoutes.get("/", categoryController.index);
categoryRoutes.get("/slug/:slug", categoryController.getBySlug);
categoryRoutes.get("/:id", categoryController.getById);
categoryRoutes.post("/", categoryController.store);
categoryRoutes.put("/:id", categoryController.update);
categoryRoutes.delete("/:id", categoryController.delete);
var category_routes_default = categoryRoutes;

// src/modules/medicine/medicine.routes.ts
import { Router as Router2 } from "express";

// src/modules/medicine/medicine.query-builder.ts
function buildMedicineQuery(queryParams) {
  const where = {};
  const page = queryParams.page ? parseInt(queryParams.page) : 1;
  const limit = queryParams.limit ? parseInt(queryParams.limit) : 20;
  const skip = (page - 1) * limit;
  if (queryParams.categoryId) where.categoryId = queryParams.categoryId;
  if (queryParams.sellerId) where.sellerId = queryParams.sellerId;
  if (queryParams.isActive !== void 0)
    where.isActive = queryParams.isActive === "true";
  if (queryParams.isFeatured !== void 0)
    where.isFeatured = queryParams.isFeatured === "true";
  if (queryParams.inStock === "true") where.stockQuantity = { gt: 0 };
  if (queryParams.manufacturer) {
    where.manufacturer = {
      contains: queryParams.manufacturer,
      mode: "insensitive"
    };
  }
  if (queryParams.minPrice || queryParams.maxPrice) {
    where.price = {};
    if (queryParams.minPrice)
      where.price.gte = parseFloat(queryParams.minPrice);
    if (queryParams.maxPrice)
      where.price.lte = parseFloat(queryParams.maxPrice);
  }
  if (queryParams.search) {
    where.OR = [
      {
        name: {
          contains: queryParams.search,
          mode: "insensitive"
        }
      },
      {
        description: {
          contains: queryParams.search,
          mode: "insensitive"
        }
      },
      {
        genericName: {
          contains: queryParams.search,
          mode: "insensitive"
        }
      }
    ];
  }
  const orderBy = {};
  const sortBy = queryParams.sortBy || "createdAt";
  const sortOrder = queryParams.sortOrder || "desc";
  orderBy[sortBy] = sortOrder;
  return { where, orderBy, skip, limit };
}

// src/helper/index.ts
var getSlug = (name) => {
  return name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
};
async function hashPassword(password) {
  const crypto2 = await import("crypto");
  const salt = crypto2.randomBytes(16).toString("hex");
  const hash = crypto2.pbkdf2Sync(password, salt, 1e3, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}
async function verifyPassword(password, hashedPassword) {
  const crypto2 = await import("crypto");
  const [salt, hash] = hashedPassword.split(":");
  if (!salt || !hash) {
    return false;
  }
  const verifyHash = crypto2.pbkdf2Sync(password, salt, 1e3, 64, "sha512").toString("hex");
  return hash === verifyHash;
}
var helper = {
  getSlug,
  hashPassword,
  verifyPassword
};

// src/modules/medicine/medicine.service.ts
var MedicineService = class {
  getMedicines = async (queryParams) => {
    const { where, orderBy, limit, skip } = buildMedicineQuery(queryParams);
    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          },
          seller: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.medicine.count({ where })
    ]);
    const page = queryParams.page ? parseInt(queryParams.page) : 1;
    const totalPages = Math.ceil(total / limit);
    return {
      data: medicines,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    };
  };
  getMedicineById = async (id) => {
    return await prisma.medicine.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  };
  getMedicineBySlug = async (slug) => {
    return await prisma.medicine.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  };
  createMedicine = async (data) => {
    const slug = helper.getSlug(data.name);
    const sku = data.sku || `MED-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    return await prisma.medicine.create({
      data: {
        ...data,
        slug,
        sku
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  };
  updateMedicine = async (id, data) => {
    return await prisma.medicine.update({
      where: { id },
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  };
  deleteMedicine = async (id) => {
    return await prisma.medicine.delete({
      where: { id }
    });
  };
  isMedicineOwnedBySeller = async (medicineId, sellerId) => {
    const medicine = await prisma.medicine.findFirst({
      where: {
        id: medicineId,
        sellerId
      }
    });
    return !!medicine;
  };
  getLowStockMedicines = async (sellerId) => {
    const where = {
      stockQuantity: {
        lte: prisma.medicine.fields.lowStockThreshold
      }
    };
    if (sellerId) {
      where.sellerId = sellerId;
    }
    return await prisma.medicine.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        stockQuantity: "asc"
      }
    });
  };
};
var medicineService = new MedicineService();

// src/modules/medicine/medicine.controller.ts
var MedicineController = class {
  service = medicineService;
  index = async (req, res, next) => {
    try {
      console.log("Fetching medicines with query:", req.query, req.params);
      const result = await this.service.getMedicines(req.query);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  };
  show = async (req, res, next) => {
    try {
      const { id } = req.params;
      const medicine = await this.service.getMedicineById(String(id));
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: "Medicine not found"
        });
      }
      res.status(200).json({
        success: true,
        data: medicine
      });
    } catch (error) {
      next(error);
    }
  };
  getBySlug = async (req, res, next) => {
    try {
      const { slug } = req.params;
      const medicine = await this.service.getMedicineBySlug(String(slug));
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: "Medicine not found"
        });
      }
      res.status(200).json({
        success: true,
        data: medicine
      });
    } catch (error) {
      next(error);
    }
  };
  store = async (req, res, next) => {
    try {
      const data = req.body;
      const medicine = await this.service.createMedicine(data);
      res.status(201).json({
        success: true,
        message: "Medicine created successfully",
        data: medicine
      });
    } catch (error) {
      next(error);
    }
  };
  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const medicine = await this.service.updateMedicine(String(id), data);
      res.status(200).json({
        success: true,
        message: "Medicine updated successfully",
        data: medicine
      });
    } catch (error) {
      next(error);
    }
  };
  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.service.deleteMedicine(String(id));
      res.status(200).json({
        success: true,
        message: "Medicine deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  };
  getLowStock = async (req, res, next) => {
    try {
      const sellerId = req.user?.role === "SELLER" ? req.user?.id : void 0;
      const medicines = await this.service.getLowStockMedicines(sellerId);
      res.status(200).json({
        success: true,
        data: medicines
      });
    } catch (error) {
      next(error);
    }
  };
};
var medicineController = new MedicineController();

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/config.ts
var config2 = {
  appUrl: process.env.FRONTEND_APP_URL || "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL || "",
  port: process.env.PORT || 5e3,
  betterAuthUrl: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  betterAuthSecret: process.env.BETTER_AUTH_SECRET || "",
  gclientId: process.env.GOOGLE_CLIENT_ID || "",
  gclientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
};
var config_default = config2;

// src/lib/auth.ts
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  baseURL: config_default.betterAuthUrl,
  secret: config_default.betterAuthSecret,
  trustedOrigins: [config_default.appUrl],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: config_default.gclientId,
      clientSecret: config_default.gclientSecret,
      redirectURI: `${config_default.betterAuthUrl}/api/auth/callback/google`
    }
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
        required: false
      },
      phone: {
        type: "string",
        required: false
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false
      }
    }
  }
});

// src/middlewares/isAuthMiddleware.ts
var isAuth = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      console.log(session, "Session in isAuth Middleware");
      if (!session || !session.user) {
        res.status(401).json({ success: false, message: "You are not authorized" });
        return;
      }
      if (roles.length && !roles.includes(session.user.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden! You do not have permission to access this resource"
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

// src/middlewares/isMedicineOwner.ts
var isMedicineOwner = async (req, res, next) => {
  try {
    const medicineId = req.params.id;
    const sellerId = req.user?.id;
    if (!sellerId) {
      res.status(401).json({
        success: false,
        message: "You are not authorized"
      });
      return;
    }
    if (!medicineId || typeof medicineId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid medicine ID"
      });
      return;
    }
    const isOwner = await medicineService.isMedicineOwnedBySeller(
      medicineId,
      sellerId
    );
    if (!isOwner) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to modify this medicine"
      });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
};
var attachSellerId = (req, res, next) => {
  if (req.user?.id) {
    req.body.sellerId = req.user.id;
  }
  next();
};

// src/modules/medicine/medicine.routes.ts
var medicineRoutes = Router2();
medicineRoutes.get("/", medicineController.index);
medicineRoutes.get("/slug/:slug", medicineController.getBySlug);
medicineRoutes.get("/:id", medicineController.show);
medicineRoutes.post(
  "/",
  isAuth("SELLER" /* SELLER */),
  attachSellerId,
  medicineController.store
);
medicineRoutes.put(
  "/:id",
  isAuth("SELLER" /* SELLER */),
  isMedicineOwner,
  medicineController.update
);
medicineRoutes.delete(
  "/:id",
  isAuth("SELLER" /* SELLER */),
  isMedicineOwner,
  medicineController.delete
);
medicineRoutes.get(
  "/low-stock",
  isAuth("SELLER" /* SELLER */, "ADMIN" /* ADMIN */),
  medicineController.getLowStock
);
var medicine_routes_default = medicineRoutes;

// src/modules/user/user.routes.ts
import { Router as Router3 } from "express";

// src/modules/user/user.service.ts
var UserService = class {
  getAllUsers = async (role) => {
    const where = role ? { role } : {};
    return await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        image: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  };
  getUserById = async (id) => {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        image: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });
  };
  getUserByEmail = async (email) => {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        image: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });
  };
  createUser = async (data) => {
    const hashedPassword = await helper.hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        role: data.role || "CUSTOMER",
        phone: data.phone ?? null,
        image: data.image ?? null,
        emailVerified: data.emailVerified || false,
        status: data.status || "ACTIVE",
        accounts: {
          create: {
            id: crypto.randomUUID(),
            accountId: crypto.randomUUID(),
            providerId: "credential",
            password: hashedPassword
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        image: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return user;
  };
  updateUser = async (id, data) => {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        image: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });
  };
  deleteUser = async (id) => {
    return await prisma.user.delete({
      where: { id }
    });
  };
  getSellers = async () => {
    return await this.getAllUsers("SELLER");
  };
  getCustomers = async () => {
    return await this.getAllUsers("CUSTOMER");
  };
};
var userService = new UserService();

// src/modules/user/user.controller.ts
var UserController = class {
  /**
   * Get all users
   */
  getAllUsers = async (req, res) => {
    try {
      const { role } = req.query;
      const users = await userService.getAllUsers(role);
      res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching users",
        error: error.message
      });
    }
  };
  /**
   * Get user by ID
   */
  getUserById = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(String(id));
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching user",
        error: error.message
      });
    }
  };
  /**
   * Update user
   */
  updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userService.updateUser(String(id), req.body);
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating user",
        error: error.message
      });
    }
  };
  /**
   * Delete user
   */
  deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      await userService.deleteUser(String(id));
      res.status(200).json({
        success: true,
        message: "User deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting user",
        error: error.message
      });
    }
  };
  /**
   * Get all sellers
   */
  getSellers = async (req, res) => {
    try {
      const sellers = await userService.getSellers();
      res.status(200).json({
        success: true,
        message: "Sellers fetched successfully",
        data: sellers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching sellers",
        error: error.message
      });
    }
  };
  /**
   * Get all customers
   */
  getCustomers = async (req, res) => {
    try {
      const customers = await userService.getCustomers();
      res.status(200).json({
        success: true,
        message: "Customers fetched successfully",
        data: customers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching customers",
        error: error.message
      });
    }
  };
};
var userController = new UserController();

// src/modules/user/user.routes.ts
var userRouter = Router3();
userRouter.get("/", userController.getAllUsers);
userRouter.get("/sellers", userController.getSellers);
userRouter.get("/customers", userController.getCustomers);
userRouter.get("/:id", userController.getUserById);
userRouter.put("/:id", userController.updateUser);
userRouter.delete("/:id", userController.deleteUser);
var user_routes_default = userRouter;

// src/modules/cart/cart.routes.ts
import { Router as Router4 } from "express";

// src/modules/cart/cart.service.ts
var CartService = class {
  getCart = async (userId) => {
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        medicine: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    const items = cartItems.map((item) => ({
      id: item.id,
      userId: item.userId,
      medicineId: item.medicineId,
      quantity: item.quantity,
      medicine: {
        id: item.medicine.id,
        name: item.medicine.name,
        slug: item.medicine.slug,
        price: item.medicine.price,
        discountPrice: item.medicine.discountPrice || 0,
        stockQuantity: item.medicine.stockQuantity,
        imageUrl: item.medicine.imageUrl || "",
        category: item.medicine.category
      },
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
    const subtotal = items.reduce((sum, item) => {
      const price = item.medicine.discountPrice || item.medicine.price;
      return sum + price * item.quantity;
    }, 0);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    return {
      items,
      subtotal,
      totalItems: items.length,
      totalQuantity
    };
  };
  addToCart = async (userId, data) => {
    const medicine = await prisma.medicine.findUnique({
      where: { id: data.medicineId }
    });
    if (!medicine) {
      throw new Error("Medicine not found");
    }
    if (medicine.stockQuantity < data.quantity) {
      throw new Error("Insufficient stock");
    }
    const existingItem = await prisma.cart.findUnique({
      where: {
        userId_medicineId: {
          userId,
          medicineId: data.medicineId
        }
      }
    });
    if (existingItem) {
      return await prisma.cart.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + data.quantity
        },
        include: {
          medicine: {
            include: {
              category: true
            }
          }
        }
      });
    }
    return await prisma.cart.create({
      data: {
        userId,
        medicineId: data.medicineId,
        quantity: data.quantity
      },
      include: {
        medicine: {
          include: {
            category: true
          }
        }
      }
    });
  };
  updateCartItem = async (userId, cartItemId, data) => {
    const cartItem = await prisma.cart.findFirst({
      where: {
        id: cartItemId,
        userId
      },
      include: {
        medicine: true
      }
    });
    if (!cartItem) {
      throw new Error("Cart item not found");
    }
    if (cartItem.medicine.stockQuantity < data.quantity) {
      throw new Error("Insufficient stock");
    }
    return await prisma.cart.update({
      where: { id: cartItemId },
      data: { quantity: data.quantity },
      include: {
        medicine: {
          include: {
            category: true
          }
        }
      }
    });
  };
  removeFromCart = async (userId, cartItemId) => {
    const cartItem = await prisma.cart.findFirst({
      where: {
        id: cartItemId,
        userId
      }
    });
    if (!cartItem) {
      throw new Error("Cart item not found");
    }
    return await prisma.cart.delete({
      where: { id: cartItemId }
    });
  };
  clearCart = async (userId) => {
    return await prisma.cart.deleteMany({
      where: { userId }
    });
  };
  getCartCount = async (userId) => {
    return await prisma.cart.count({
      where: { userId }
    });
  };
};
var cartService = new CartService();

// src/modules/cart/cart.controller.ts
var CartController = class {
  getCart = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const cart = await cartService.getCart(userId);
      res.status(200).json({
        success: true,
        data: cart
      });
    } catch (error) {
      next(error);
    }
  };
  addToCart = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const data = req.body;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const cartItem = await cartService.addToCart(userId, data);
      res.status(201).json({
        success: true,
        message: "Item added to cart",
        data: cartItem
      });
    } catch (error) {
      if (error.message === "Medicine not found") {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message === "Insufficient stock") {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  };
  updateCartItem = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const data = req.body;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const cartItem = await cartService.updateCartItem(
        userId,
        String(id),
        data
      );
      res.status(200).json({
        success: true,
        message: "Cart updated",
        data: cartItem
      });
    } catch (error) {
      if (error.message === "Cart item not found") {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      if (error.message === "Insufficient stock") {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  };
  removeFromCart = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      await cartService.removeFromCart(userId, String(id));
      res.status(200).json({
        success: true,
        message: "Item removed from cart"
      });
    } catch (error) {
      if (error.message === "Cart item not found") {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  };
  clearCart = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      await cartService.clearCart(userId);
      res.status(200).json({
        success: true,
        message: "Cart cleared"
      });
    } catch (error) {
      next(error);
    }
  };
  getCartCount = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const count = await cartService.getCartCount(userId);
      res.status(200).json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  };
};
var cartController = new CartController();

// src/modules/cart/cart.routes.ts
var cartRoutes = Router4();
cartRoutes.use(isAuth("CUSTOMER" /* CUSTOMER */));
cartRoutes.get("/", cartController.getCart);
cartRoutes.get("/count", cartController.getCartCount);
cartRoutes.post("/", cartController.addToCart);
cartRoutes.put("/:id", cartController.updateCartItem);
cartRoutes.delete("/:id", cartController.removeFromCart);
cartRoutes.delete("/", cartController.clearCart);
var cart_routes_default = cartRoutes;

// src/modules/order/order.routes.ts
import { Router as Router5 } from "express";

// src/modules/order/order.service.ts
var OrderService = class {
  generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  };
  createOrder = async (userId, data) => {
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        medicine: true
      }
    });
    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }
    for (const item of cartItems) {
      if (item.medicine.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${item.medicine.name}`);
      }
    }
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.medicine.discountPrice || item.medicine.price;
      return sum + price * item.quantity;
    }, 0);
    const shippingCost = subtotal > 500 ? 0 : 50;
    const tax = subtotal * 0.05;
    const totalAmount = subtotal + shippingCost + tax;
    const order = await prisma.order.create({
      data: {
        orderNumber: this.generateOrderNumber(),
        userId,
        status: "PENDING",
        subtotal,
        shippingCost,
        tax,
        totalAmount,
        discount: 0,
        shippingAddress: data.shippingAddress,
        city: data.city,
        state: data.state ?? null,
        zipCode: data.zipCode,
        country: data.country || "Bangladesh",
        phone: data.phone,
        paymentMethod: data.paymentMethod,
        paymentStatus: "UNPAID",
        notes: data.notes ?? null,
        orderItems: {
          create: cartItems.map((item) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            price: item.medicine.discountPrice || item.medicine.price,
            discount: item.medicine.price - (item.medicine.discountPrice || item.medicine.price),
            subtotal: (item.medicine.discountPrice || item.medicine.price) * item.quantity
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });
    for (const item of cartItems) {
      await prisma.medicine.update({
        where: { id: item.medicineId },
        data: {
          stockQuantity: {
            decrement: item.quantity
          }
        }
      });
    }
    await prisma.cart.deleteMany({
      where: { userId }
    });
    return order;
  };
  getUserOrders = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          orderItems: {
            include: {
              medicine: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  imageUrl: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit
      }),
      prisma.order.count({ where: { userId } })
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    };
  };
  getOrderById = async (orderId, userId, role) => {
    const where = { id: orderId };
    if (role === "CUSTOMER") {
      where.userId = userId;
    } else if (role === "SELLER") {
      where.orderItems = {
        some: {
          medicine: {
            sellerId: userId
          }
        }
      };
    }
    return await prisma.order.findFirst({
      where,
      include: {
        orderItems: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
                category: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });
  };
  getAllOrders = async (page = 1, limit = 20, status) => {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              medicine: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  imageUrl: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    };
  };
  getSellerOrders = async (sellerId, page = 1, limit = 20, status) => {
    const skip = (page - 1) * limit;
    const where = {
      orderItems: {
        some: {
          medicine: {
            sellerId
          }
        }
      }
    };
    if (status) {
      where.status = status;
    }
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              medicine: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  imageUrl: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    };
  };
  updateOrderStatus = async (orderId, data) => {
    const updateData = {
      status: data.status
    };
    if (data.trackingNumber) {
      updateData.trackingNumber = data.trackingNumber;
    }
    if (data.status === "DELIVERED") {
      updateData.deliveredAt = /* @__PURE__ */ new Date();
    }
    if (data.status === "CANCELLED") {
      updateData.cancelledAt = /* @__PURE__ */ new Date();
    }
    return await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        orderItems: {
          include: {
            medicine: true
          }
        }
      }
    });
  };
  updatePaymentStatus = async (orderId, data) => {
    const updateData = {
      paymentStatus: data.paymentStatus
    };
    if (data.paymentStatus === "PAID") {
      updateData.paidAt = /* @__PURE__ */ new Date();
    }
    return await prisma.order.update({
      where: { id: orderId },
      data: updateData
    });
  };
  cancelOrder = async (orderId, userId) => {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      }
    });
    if (!order) {
      throw new Error("Order not found");
    }
    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      throw new Error("Cannot cancel order at this stage");
    }
    return await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        cancelledAt: /* @__PURE__ */ new Date()
      }
    });
  };
};
var orderService = new OrderService();

// src/modules/order/order.controller.ts
var OrderController = class {
  createOrder = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const data = req.body;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const order = await orderService.createOrder(userId, data);
      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order
      });
    } catch (error) {
      if (error.message === "Cart is empty" || error.message?.includes("Insufficient stock")) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  };
  getUserOrders = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const result = await orderService.getUserOrders(userId, page, limit);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };
  getOrderById = async (req, res, next) => {
    try {
      const user = req.user;
      const userId = user?.id;
      const userRole = user?.role;
      const { id } = req.params;
      if (!userId || !userRole) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const order = await orderService.getOrderById(
        String(id),
        userId,
        userRole
      );
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }
      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  };
  getAllOrders = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const status = req.query.status;
      const result = await orderService.getAllOrders(page, limit, status);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };
  getSellerOrders = async (req, res, next) => {
    try {
      const sellerId = req.user?.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const status = req.query.status;
      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const result = await orderService.getSellerOrders(
        sellerId,
        page,
        limit,
        status
      );
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };
  updateOrderStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const order = await orderService.updateOrderStatus(String(id), data);
      res.status(200).json({
        success: true,
        message: "Order status updated",
        data: order
      });
    } catch (error) {
      next(error);
    }
  };
  updatePaymentStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const order = await orderService.updatePaymentStatus(String(id), data);
      res.status(200).json({
        success: true,
        message: "Payment status updated",
        data: order
      });
    } catch (error) {
      next(error);
    }
  };
  cancelOrder = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const order = await orderService.cancelOrder(String(id), userId);
      res.status(200).json({
        success: true,
        message: "Order cancelled",
        data: order
      });
    } catch (error) {
      if (error.message === "Order not found" || error.message === "Cannot cancel order at this stage") {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  };
};
var orderController = new OrderController();

// src/modules/order/order.routes.ts
var orderRoutes = Router5();
orderRoutes.post("/", isAuth("CUSTOMER" /* CUSTOMER */), orderController.createOrder);
orderRoutes.get("/", isAuth("CUSTOMER" /* CUSTOMER */), orderController.getUserOrders);
orderRoutes.get("/all", isAuth("ADMIN" /* ADMIN */), orderController.getAllOrders);
orderRoutes.get(
  "/seller",
  isAuth("SELLER" /* SELLER */),
  orderController.getSellerOrders
);
orderRoutes.get(
  "/:id",
  isAuth("CUSTOMER" /* CUSTOMER */, "ADMIN" /* ADMIN */, "SELLER" /* SELLER */),
  orderController.getOrderById
);
orderRoutes.put(
  "/:id/status",
  isAuth("ADMIN" /* ADMIN */, "SELLER" /* SELLER */),
  orderController.updateOrderStatus
);
orderRoutes.put(
  "/:id/payment",
  isAuth("ADMIN" /* ADMIN */),
  orderController.updatePaymentStatus
);
orderRoutes.put(
  "/:id/cancel",
  isAuth("CUSTOMER" /* CUSTOMER */),
  orderController.cancelOrder
);
var order_routes_default = orderRoutes;

// src/modules/review/review.routes.ts
import { Router as Router6 } from "express";

// src/modules/review/review.service.ts
var ReviewService = class {
  createReview = async (userId, data) => {
    const medicine = await prisma.medicine.findUnique({
      where: { id: data.medicineId }
    });
    if (!medicine) {
      throw new Error("Medicine not found");
    }
    if (data.parentId) {
      const parentReview = await prisma.review.findUnique({
        where: { id: data.parentId }
      });
      if (!parentReview) {
        throw new Error("Parent review not found");
      }
      return await prisma.review.create({
        data: {
          userId,
          medicineId: data.medicineId,
          parentId: data.parentId,
          comment: data.comment,
          rating: null
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    }
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        medicineId: data.medicineId,
        parentId: null
      }
    });
    if (existingReview) {
      throw new Error("You have already reviewed this medicine");
    }
    return await prisma.review.create({
      data: {
        userId,
        medicineId: data.medicineId,
        rating: data.rating,
        comment: data.comment
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  };
  getMedicineReviews = async (medicineId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          medicineId,
          parentId: null
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: "asc"
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit
      }),
      prisma.review.count({
        where: {
          medicineId,
          parentId: null
        }
      })
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    };
  };
  getMedicineReviewStats = async (medicineId) => {
    const reviews = await prisma.review.findMany({
      where: {
        medicineId,
        parentId: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews : 0;
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    reviews.forEach((review) => {
      if (review.rating) {
        ratingDistribution[review.rating]++;
      }
    });
    return {
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingDistribution
    };
  };
  updateReview = async (reviewId, userId, data) => {
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId
      }
    });
    if (!review) {
      throw new Error("Review not found");
    }
    return await prisma.review.update({
      where: { id: reviewId },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  };
  deleteReview = async (reviewId, userId) => {
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId
      }
    });
    if (!review) {
      throw new Error("Review not found");
    }
    return await prisma.review.delete({
      where: { id: reviewId }
    });
  };
  getUserReviews = async (userId) => {
    return await prisma.review.findMany({
      where: { userId },
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  };
};
var reviewService = new ReviewService();

// src/modules/review/review.controller.ts
var ReviewController = class {
  createReview = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const data = req.body;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const review = await reviewService.createReview(userId, data);
      res.status(201).json({
        success: true,
        message: data.parentId ? "Reply added successfully" : "Review created successfully",
        data: review
      });
    } catch (error) {
      if (error.message === "Medicine not found" || error.message === "Parent review not found" || error.message === "You have already reviewed this medicine") {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  };
  getMedicineReviews = async (req, res, next) => {
    try {
      const { medicineId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      if (!medicineId) {
        return res.status(400).json({
          success: false,
          message: "Medicine ID is required"
        });
      }
      const result = await reviewService.getMedicineReviews(
        String(medicineId),
        page,
        limit
      );
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };
  getMedicineReviewStats = async (req, res, next) => {
    try {
      const { medicineId } = req.params;
      if (!medicineId) {
        return res.status(400).json({
          success: false,
          message: "Medicine ID is required"
        });
      }
      const stats = await reviewService.getMedicineReviewStats(
        String(medicineId)
      );
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };
  updateReview = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const data = req.body;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const review = await reviewService.updateReview(String(id), userId, data);
      res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data: review
      });
    } catch (error) {
      if (error.message === "Review not found") {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  };
  deleteReview = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      await reviewService.deleteReview(String(id), userId);
      res.status(200).json({
        success: true,
        message: "Review deleted successfully"
      });
    } catch (error) {
      if (error.message === "Review not found") {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  };
  getUserReviews = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const reviews = await reviewService.getUserReviews(userId);
      res.status(200).json({
        success: true,
        data: reviews
      });
    } catch (error) {
      next(error);
    }
  };
};
var reviewController = new ReviewController();

// src/modules/review/review.routes.ts
var reviewRoutes = Router6();
reviewRoutes.post("/", isAuth("CUSTOMER" /* CUSTOMER */), reviewController.createReview);
reviewRoutes.get("/medicine/:medicineId", reviewController.getMedicineReviews);
reviewRoutes.get(
  "/medicine/:medicineId/stats",
  reviewController.getMedicineReviewStats
);
reviewRoutes.get(
  "/my-reviews",
  isAuth("CUSTOMER" /* CUSTOMER */),
  reviewController.getUserReviews
);
reviewRoutes.put("/:id", isAuth("CUSTOMER" /* CUSTOMER */), reviewController.updateReview);
reviewRoutes.delete(
  "/:id",
  isAuth("CUSTOMER" /* CUSTOMER */),
  reviewController.deleteReview
);
var review_routes_default = reviewRoutes;

// src/app.ts
import { toNodeHandler } from "better-auth/node";
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_APP_URL || "http://localhost:3000",
    credentials: true
  })
);
app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use("/api/users", user_routes_default);
app.use("/api/categories", category_routes_default);
app.use("/api/medicines", medicine_routes_default);
app.use("/api/reviews", review_routes_default);
app.use("/api/carts", cart_routes_default);
app.use("/api/orders", order_routes_default);
app.use(
  (err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Something went wrong"
    });
  }
);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
