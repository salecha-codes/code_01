import jwt from 'jsonwebtoken';
import { createHmac, timingSafeEqual } from 'node:crypto';
import Admin from '../models/Admin.js';
import { HttpError } from '../utils/validation.js';
export const COOKIE_NAME = 'clubpulse_session';
export function csrfToken(payload, secret) {
  return createHmac('sha256', secret)
    .update(`csrf:${payload.sub}:${payload.version}:${payload.jti}`)
    .digest('hex');
}
export function cookieOptions(config) {
  return { httpOnly: true, secure: config.production, sameSite: config.sameSite, path: '/api' };
}
export function requireAuth(config) {
  return async (req, res, next) => {
    let payload;
    try {
      const token = req.cookies[COOKIE_NAME];
      if (!token) throw new Error('Missing session');
      payload = jwt.verify(token, config.jwtSecret, {
        algorithms: ['HS256'],
        issuer: 'clubpulse',
        audience: 'clubpulse-admin',
      });
    } catch {
      return next(new HttpError(401, 'Please sign in to continue.'));
    }
    // Keep database failures outside the token catch so Express reports a server error.
    const admin = await Admin.findById(payload.sub).select('+sessionVersion');
    if (!admin || admin.sessionVersion !== payload.version)
      return next(new HttpError(401, 'Please sign in to continue.'));
    req.admin = admin;
    req.session = payload;
    next();
  };
}
export function requireCsrf(config) {
  return (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const supplied = req.get('X-CSRF-Token') || '';
    const expected = csrfToken(req.session, config.jwtSecret);
    if (
      !/^[a-f0-9]{64}$/.test(supplied) ||
      !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
    )
      return next(new HttpError(403, 'Session verification failed. Refresh and try again.'));
    next();
  };
}
