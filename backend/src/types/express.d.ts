declare namespace Express {
  interface Request {
    user?: {
      id: string;
      businessId: string;
      email: string;
      role: string;
      permissions?: string[];
    };
  }
}
