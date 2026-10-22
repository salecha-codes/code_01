import 'dotenv/config';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { readConfig } from '../src/config/env.js';
import Admin from '../src/models/Admin.js';
import Event from '../src/models/Event.js';
import Feedback from '../src/models/Feedback.js';

const origin = 'http://localhost:5173';
const secret = randomBytes(48).toString('hex');
const password = randomBytes(24).toString('hex');
const config = { jwtSecret: secret, origins: [origin], production: false, sameSite: 'lax' };
let database, app, admin, openEvent, closedEvent, secondEvent, cookie, csrf;
function post(path, body, sessionCookie) {
  const operation = request(app).post(path).set('Origin', origin).set('X-ClubPulse-Request', '1');
  if (sessionCookie) operation.set('Cookie', sessionCookie).set('X-CSRF-Token', csrf);
  return operation.send(body);
}
const feedback = (overrides) => ({
  eventId: String(openEvent._id),
  rating: 5,
  category: 'Content Quality',
  comment: 'Practical and engaging workshop.',
  wouldRecommend: true,
  ...overrides,
});
before(async () => {
  database = await MongoMemoryServer.create({
    binary: {
      version: '7.0.24',
      ...(process.env.MONGOMS_DOWNLOAD_DIR
        ? { downloadDir: process.env.MONGOMS_DOWNLOAD_DIR }
        : {}),
    },
  });
  await mongoose.connect(database.getUri());
  app = createApp(config);
  admin = await Admin.create({
    email: 'admin@example.test',
    passwordHash: await bcrypt.hash(password, 12),
  });
  [openEvent, closedEvent, secondEvent] = await Event.create([
    { title: 'Web Workshop', date: new Date('2026-10-20'), status: 'active' },
    { title: 'Closed Workshop', date: new Date('2026-10-19'), status: 'closed' },
    { title: 'Open Source Workshop', date: new Date('2026-10-21'), status: 'active' },
  ]);
});
after(async () => {
  await mongoose.disconnect();
  if (database) await database.stop();
});

test('public events include only active events', async () => {
  const response = await request(app).get('/api/events').expect(200);
  assert.equal(response.body.events.length, 2);
  assert.ok(response.body.events.every((event) => event.status === 'active'));
});
test('every admin endpoint requires authentication', async () => {
  for (const endpoint of ['feedback', 'stats', 'events'])
    await request(app).get(`/api/admin/${endpoint}`).expect(401);
  await post('/api/admin/events', { title: 'Unauthorized' }).expect(401);
  await request(app)
    .patch(`/api/admin/events/${openEvent._id}`)
    .set('Origin', origin)
    .set('X-ClubPulse-Request', '1')
    .send({ status: 'closed' })
    .expect(401);
});
test('invalid credentials and untrusted origins are rejected', async () => {
  await post('/api/auth/login', { email: admin.email, password: 'incorrect' }).expect(401);
  await request(app)
    .post('/api/auth/login')
    .set('Origin', 'https://evil.example')
    .send({ email: admin.email, password })
    .expect(403);
  await request(app).post('/api/auth/login').send({ email: admin.email, password }).expect(403);
});
test('valid login issues HttpOnly cookie and CSRF token; me restores session', async () => {
  const response = await post('/api/auth/login', { email: admin.email, password }).expect(200);
  cookie = response.headers['set-cookie'][0].split(';')[0];
  csrf = response.body.csrfToken;
  assert.match(response.headers['set-cookie'][0], /HttpOnly/);
  assert.match(response.headers['set-cookie'][0], /SameSite=Lax/);
  assert.equal(response.body.admin.passwordHash, undefined);
  const me = await request(app).get('/api/auth/me').set('Cookie', cookie).expect(200);
  assert.equal(me.body.csrfToken, csrf);
});
test('empty statistics have zero counts, null average, and 30 zero-filled days', async () => {
  const { body } = await request(app).get('/api/admin/stats').set('Cookie', cookie).expect(200);
  assert.equal(body.totalSubmissions, 0);
  assert.equal(body.averageRating, null);
  assert.equal(body.positivePercentage, 0);
  assert.equal(body.dailyTrend.length, 30);
  assert.ok(body.dailyTrend.every((day) => day.count === 0));
  assert.equal(body.totalEvents, 3);
  assert.ok(body.eventStats.every((event) => event.count === 0));
});
test('anonymous submission persists in MongoDB without identity fields or returned ID', async () => {
  const response = await post('/api/feedback', feedback()).expect(201);
  assert.equal(response.body._id, undefined);
  const document = await Feedback.findOne().lean();
  assert.equal(document.rating, 5);
  assert.equal(document.comment, 'Practical and engaging workshop.');
  assert.deepEqual(
    Object.keys(document).sort(),
    [
      '__v',
      '_id',
      'category',
      'comment',
      'createdAt',
      'eventId',
      'rating',
      'wouldRecommend',
    ].sort(),
  );
});
test('invalid rating, event ID, category, recommendation, and identity fields are rejected', async () => {
  for (const patch of [
    { rating: 6 },
    { rating: 2.5 },
    { eventId: 'invalid' },
    { category: 'Other' },
    { wouldRecommend: 'yes' },
    { email: 'student@example.test' },
  ]) {
    await post('/api/feedback', feedback(patch)).expect(400);
  }
  assert.equal(await Feedback.countDocuments(), 1);
});
test('closed and nonexistent events reject feedback', async () => {
  await post('/api/feedback', feedback({ eventId: String(closedEvent._id) })).expect(409);
  await post('/api/feedback', feedback({ eventId: String(new mongoose.Types.ObjectId()) })).expect(
    404,
  );
});
test('feedback rate limiter rejects excess requests', async () => {
  await post('/api/feedback', feedback()).expect(201);
  await post('/api/feedback', feedback()).expect(429);
});
test('admin feedback filters combine event, rating, category, dates and literal search; pagination works', async () => {
  await Feedback.deleteMany({});
  const today = new Date().toISOString().slice(0, 10);
  await Feedback.create([
    feedback({ rating: 5, comment: 'Useful [hands-on] material' }),
    feedback({ rating: 4, category: 'Organization', comment: 'Good pacing' }),
    feedback({ eventId: String(secondEvent._id), rating: 1, comment: 'More practice needed' }),
    feedback({
      eventId: String(secondEvent._id),
      rating: 2,
      category: 'Organization',
      comment: '',
    }),
  ]);
  const get = (query) =>
    request(app).get('/api/admin/feedback').query(query).set('Cookie', cookie).expect(200);
  assert.equal((await get({ eventId: String(openEvent._id) })).body.pagination.total, 2);
  assert.equal((await get({ rating: 5 })).body.pagination.total, 1);
  const combined = await get({
    eventId: String(openEvent._id),
    rating: 5,
    category: 'Content Quality',
    startDate: today,
    endDate: today,
    search: '[hands-on]',
  });
  assert.equal(combined.body.pagination.total, 1);
  assert.equal(combined.body.feedback[0].eventId.title, 'Web Workshop');
  const first = await get({ page: 1, limit: 2 });
  const second = await get({ page: 2, limit: 2 });
  assert.equal(first.body.pagination.totalPages, 2);
  assert.equal(second.body.feedback.length, 2);
  assert.notEqual(first.body.feedback[0]._id, second.body.feedback[0]._id);
  assert.equal((await get({ rating: 3 })).body.pagination.total, 0);
});
test('invalid filters, arrays, impossible dates and reversed date ranges return 400', async () => {
  for (const query of [
    { page: 0 },
    { limit: 51 },
    { rating: 'bad' },
    { rating: ['4', '5'] },
    { startDate: '2026-02-30' },
    { startDate: '2026-10-22', endDate: '2026-10-21' },
    { eventId: { $ne: '' } },
  ]) {
    await request(app).get('/api/admin/feedback').query(query).set('Cookie', cookie).expect(400);
  }
});
test('aggregations return correct real totals, distribution, means, event counts and positive percentage', async () => {
  const { body } = await request(app).get('/api/admin/stats').set('Cookie', cookie).expect(200);
  assert.equal(body.totalSubmissions, 4);
  assert.equal(body.averageRating, 3);
  assert.equal(body.positivePercentage, 50);
  assert.deepEqual(
    body.ratingDistribution.map((item) => item.count),
    [1, 1, 0, 1, 1],
  );
  assert.equal(
    body.dailyTrend.reduce((sum, day) => sum + day.count, 0),
    4,
  );
  const web = body.eventStats.find((event) => event.title === 'Web Workshop');
  assert.equal(web.count, 2);
  assert.equal(web.averageRating, 4.5);
});
test('admin can create/edit/close events with CSRF protection and view associated counts', async () => {
  await request(app)
    .post('/api/admin/events')
    .set('Origin', origin)
    .set('X-ClubPulse-Request', '1')
    .set('Cookie', cookie)
    .send({ title: 'No CSRF', date: '2026-10-25' })
    .expect(403);
  const { body } = await post(
    '/api/admin/events',
    { title: 'New Workshop', date: '2026-10-25', status: 'active' },
    cookie,
  ).expect(201);
  await request(app)
    .patch(`/api/admin/events/${body.event._id}`)
    .set('Origin', origin)
    .set('X-ClubPulse-Request', '1')
    .set('Cookie', cookie)
    .set('X-CSRF-Token', csrf)
    .send({ status: 'closed', description: 'Updated description' })
    .expect(200);
  const result = await request(app).get('/api/admin/events').set('Cookie', cookie).expect(200);
  assert.equal(
    result.body.events.find((event) => event._id === String(openEvent._id)).feedbackCount,
    2,
  );
  assert.equal((await Event.findById(body.event._id)).status, 'closed');
});
test('malformed JSON and oversized payloads get safe errors', async () => {
  await request(app)
    .post('/api/feedback')
    .set('Origin', origin)
    .set('X-ClubPulse-Request', '1')
    .set('Content-Type', 'application/json')
    .send('{')
    .expect(400);
  await post('/api/feedback', feedback({ comment: 'x'.repeat(17000) })).expect(413);
});
test('expired and tampered JWTs are rejected', async () => {
  const token = jwt.sign({ sub: String(admin._id), version: 1 }, secret, {
    expiresIn: -1,
    issuer: 'clubpulse',
    audience: 'clubpulse-admin',
  });
  await request(app).get('/api/auth/me').set('Cookie', `clubpulse_session=${token}`).expect(401);
  await request(app).get('/api/auth/me').set('Cookie', 'clubpulse_session=invalid').expect(401);
});
test('logout revokes copied session cookie on the server', async () => {
  await post('/api/auth/logout', {}, cookie).expect(204);
  await request(app).get('/api/auth/me').set('Cookie', cookie).expect(401);
  await request(app).get('/api/admin/feedback').set('Cookie', cookie).expect(401);
});
test('production cookies are Secure and cross-origin credentials are restricted', async () => {
  const secureApp = createApp({
    ...config,
    production: true,
    sameSite: 'none',
    origins: ['https://club.example'],
  });
  const result = await request(secureApp)
    .post('/api/auth/login')
    .set('Origin', 'https://club.example')
    .set('X-ClubPulse-Request', '1')
    .send({ email: admin.email, password })
    .expect(200);
  assert.match(result.headers['set-cookie'][0], /Secure/);
  assert.match(result.headers['set-cookie'][0], /SameSite=None/);
  assert.equal(result.headers['access-control-allow-origin'], 'https://club.example');
  assert.equal(result.headers['access-control-allow-credentials'], 'true');
  await request(secureApp).get('/api/events').set('Origin', 'https://evil.example').expect(403);
});
test('configuration rejects weak secrets and invalid production origins', () => {
  assert.throws(() => readConfig({ MONGODB_URI: 'mongodb://localhost/test', JWT_SECRET: 'weak' }));
  assert.throws(() =>
    readConfig({
      MONGODB_URI: 'mongodb://localhost/test',
      JWT_SECRET: secret,
      NODE_ENV: 'production',
      CLIENT_ORIGIN: 'http://localhost:5173',
    }),
  );
});
