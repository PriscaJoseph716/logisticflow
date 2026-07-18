import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { authRateLimiter } from "../../middlewares/rate-limit.middleware.js";
import { authController } from "./auth.controller.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerCompanySchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.validation.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, validate(registerCompanySchema), asyncHandler(authController.registerCompany));
authRouter.post("/login", authRateLimiter, validate(loginSchema), asyncHandler(authController.login));
authRouter.post("/logout", asyncHandler(authController.logout));
authRouter.post("/refresh-token", authRateLimiter, validate(refreshTokenSchema), asyncHandler(authController.refreshToken));
authRouter.post("/forgot-password", authRateLimiter, validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
authRouter.post("/reset-password", authRateLimiter, validate(resetPasswordSchema), asyncHandler(authController.resetPassword));
authRouter.post("/verify-email", authRateLimiter, validate(verifyEmailSchema), asyncHandler(authController.verifyEmail));
authRouter.post("/change-password", requireAuth, validate(changePasswordSchema), asyncHandler(authController.changePassword));
