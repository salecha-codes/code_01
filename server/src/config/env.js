import 'dotenv/config';

export function readConfig(env = process.env) {
  if (!env.MONGODB_URI) throw new Error('MONGODB_URI is required. See server/.env.example.');
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32)
    throw new Error('JWT_SECRET must contain at least 32 characters.');
  const production = env.NODE_ENV === 'production';
  const origins = (env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((value) => value.trim());
  for (const origin of origins) {
    const url = new URL(origin);
    if (url.origin !== origin || (production && url.protocol !== 'https:'))
      throw new Error('CLIENT_ORIGIN must list exact origins; production requires HTTPS.');
  }
  const sameSite = env.COOKIE_SAME_SITE || 'lax';
  if (!['lax', 'strict', 'none'].includes(sameSite) || (sameSite === 'none' && !production))
    throw new Error('Invalid COOKIE_SAME_SITE; none requires production HTTPS.');
  const port = Number(env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT.');
  return {
    mongoUri: env.MONGODB_URI,
    jwtSecret: env.JWT_SECRET,
    origins,
    production,
    sameSite,
    port,
  };
}
