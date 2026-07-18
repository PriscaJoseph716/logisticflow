import { z } from "zod";

export const registerCompanySchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    companyName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    password: z.string().min(8),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(10),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});
