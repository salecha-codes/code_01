import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import Admin from '../models/Admin.js';
import { allowFields, HttpError } from '../utils/validation.js';
import { COOKIE_NAME, cookieOptions, csrfToken } from '../middleware/authMiddleware.js';
// A valid dummy bcrypt hash makes unknown-account checks do comparable work.
const DUMMY_HASH = bcrypt.hashSync('not-an-account-password', 12);
function profile(admin) {
  return { email: admin.email, role: admin.role };
}
export function authController(config) {
  return {
    async login(req, res) {
      allowFields(req.body, ['email', 'password']);
      const { email, password } = req.body;
      if (
        typeof email !== 'string' ||
        email.length > 254 ||
        typeof password !== 'string' ||
        Buffer.byteLength(password, 'utf8') > 72
      )
        throw new HttpError(400, 'Provide a valid email and password.');
      const admin = await Admin.findOne({ email: email.trim().toLowerCase() }).select(
        '+passwordHash',
      );
      const valid = await bcrypt.compare(password, admin?.passwordHash || DUMMY_HASH);
      if (!admin || !valid) throw new HttpError(401, 'Email or password is incorrect.');
      const updated = await Admin.findByIdAndUpdate(
        admin._id,
        { $inc: { sessionVersion: 1 } },
        { new: true },
      ).select('+sessionVersion');
      const payload = {
        sub: String(updated._id),
        version: updated.sessionVersion,
        jti: randomUUID(),
      };
      const token = jwt.sign(payload, config.jwtSecret, {
        expiresIn: '8h',
        issuer: 'clubpulse',
        audience: 'clubpulse-admin',
        algorithm: 'HS256',
      });
      res.cookie(COOKIE_NAME, token, { ...cookieOptions(config), maxAge: 8 * 60 * 60 * 1000 });
      res.json({ admin: profile(updated), csrfToken: csrfToken(payload, config.jwtSecret) });
    },
    async logout(req, res) {
      await Admin.updateOne(
        { _id: req.admin._id, sessionVersion: req.session.version },
        { $inc: { sessionVersion: 1 } },
      );
      res.clearCookie(COOKIE_NAME, cookieOptions(config));
      res.status(204).end();
    },
    me(req, res) {
      res.json({ admin: profile(req.admin), csrfToken: csrfToken(req.session, config.jwtSecret) });
    },
  };
}
