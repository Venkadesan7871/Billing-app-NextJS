import jwt from 'jsonwebtoken';

// In-memory user store: [{ username: string, password: string }]
export const users = [];

const DEFAULT_SECRET = 'dev-secret-change-me';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_SECRET;
const TOKEN_EXPIRY = '1h';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}
