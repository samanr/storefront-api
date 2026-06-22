// middleware/auth.js
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.TOKEN_SECRET;
if (!secret) throw new Error('TOKEN_SECRET not configured');

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(
      `[Auth] Missing or malformed token — ${req.method} ${req.path}`
    );
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secret) as { user: { id: number } };
    req.user = decoded.user;
    console.info(
      `[Auth] Token verified — ${req.method} ${req.path} userId=${req.user.id}`
    );
    next();
  } catch (error) {
    console.warn(`[Auth] Invalid or expired token — ${req.method} ${req.path}`);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export default authenticate;
