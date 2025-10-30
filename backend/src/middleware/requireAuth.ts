import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = (req.session as any)?.userId as string | undefined;
  if (!userId) return res.status(401).json({ error: "Unauthenticated" });
  (req as any).userId = userId;
  next();
}
