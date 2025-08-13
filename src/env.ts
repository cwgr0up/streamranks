import { z } from 'zod';

// Server-only variables (never exposed to client)
const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  // DATABASE_URL: z.string().url().optional(),
  // NEXTAUTH_SECRET: z.string().min(1).optional(),
});

// Public variables must be prefixed with NEXT_PUBLIC_
const clientSchema = z.object({
  // NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
});

export const env = {
  server: serverSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    // DATABASE_URL: process.env.DATABASE_URL,
    // NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  }),
  client: clientSchema.parse({
    // NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  }),
};
