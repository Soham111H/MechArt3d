// src/lib/prisma.ts
// Singleton Prisma client - prevents multiple instances in dev (hot reload)
import { PrismaClient } from "@prisma/client";
import { encryptField, decryptField } from "./security/encryption";

// Fallback types for IDE caching issues (newly added models)
type FallbackPrisma = {
  rewardPoint: any;
  otpCode: any;
  emailLog: any;
};

const globalForPrisma = globalThis as unknown as {
  prisma: (PrismaClient & FallbackPrisma) | undefined;
};

const basePrisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

// Fields to encrypt/decrypt
const SENSITIVE_FIELDS: Record<string, string[]> = {
  User: ['phone'],
  Address: ['line1', 'line2', 'city', 'pincode'],
};

// Apply encryption/decryption middleware
basePrisma.$use(async (params, next) => {
  const modelFields = SENSITIVE_FIELDS[params.model as string];

  // 1. Encrypt before write
  if (modelFields && ['create', 'update', 'upsert', 'createMany', 'updateMany'].includes(params.action)) {
    if (params.args.data) {
      const dataArr = Array.isArray(params.args.data) ? params.args.data : [params.args.data];
      for (const data of dataArr) {
        for (const field of modelFields) {
          if (data[field] !== undefined && data[field] !== null) {
            data[field] = encryptField(data[field]);
          }
        }
      }
    }
    if (params.args.create) {
      for (const field of modelFields) {
        if (params.args.create[field] !== undefined && params.args.create[field] !== null) {
          params.args.create[field] = encryptField(params.args.create[field]);
        }
      }
    }
    if (params.args.update) {
      for (const field of modelFields) {
        if (params.args.update[field] !== undefined && params.args.update[field] !== null) {
          params.args.update[field] = encryptField(params.args.update[field]);
        }
      }
    }
  }

  // Execute query
  const result = await next(params);

  // 2. Decrypt after read (handle nested objects)
  const decryptDeep = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    
    // Decrypt if these specific fields exist in any object
    if (obj.phone) obj.phone = decryptField(obj.phone);
    if (obj.line1) obj.line1 = decryptField(obj.line1);
    if (obj.line2) obj.line2 = decryptField(obj.line2);
    if (obj.city) obj.city = decryptField(obj.city);
    if (obj.pincode) obj.pincode = decryptField(obj.pincode);

    // Recurse into arrays and objects
    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key])) {
        obj[key].forEach(decryptDeep);
      } else if (typeof obj[key] === 'object' && obj[key] !== null && !(obj[key] instanceof Date)) {
        decryptDeep(obj[key]);
      }
    }
  };

  if (['findUnique', 'findFirst', 'findMany', 'create', 'update', 'upsert'].includes(params.action)) {
    if (Array.isArray(result)) {
      result.forEach(decryptDeep);
    } else {
      decryptDeep(result);
    }
  }

  return result;
});

export const prisma =
  globalForPrisma.prisma ??
  (basePrisma as unknown as PrismaClient & FallbackPrisma);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
