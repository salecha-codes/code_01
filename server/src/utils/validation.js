import { CATEGORIES } from '../models/Feedback.js';
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export function objectId(value, label = 'Event ID') {
  if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value))
    throw new HttpError(400, `${label} is invalid.`);
  return value;
}
export function text(value, label, min, max) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max)
    throw new HttpError(400, `${label} must be between ${min} and ${max} characters.`);
  return value.trim();
}
export function bodyObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new HttpError(400, 'A JSON object is required.');
}
export function allowFields(body, fields) {
  bodyObject(body);
  if (Object.keys(body).some((key) => !fields.includes(key)))
    throw new HttpError(400, 'The request contains unsupported fields.');
}
export function category(value) {
  if (!CATEGORIES.includes(value)) throw new HttpError(400, 'Choose a valid feedback category.');
  return value;
}
export function dateOnly(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new HttpError(400, `${label} must use YYYY-MM-DD.`);
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    throw new HttpError(400, `${label} is invalid.`);
  return date;
}
export function integerQuery(value, fallback, min, max, label) {
  if (value === undefined) return fallback;
  if (
    typeof value !== 'string' ||
    !/^\d+$/.test(value) ||
    Number(value) < min ||
    Number(value) > max
  )
    throw new HttpError(400, `${label} must be an integer between ${min} and ${max}.`);
  return Number(value);
}
export function eventInput(body, partial = false) {
  allowFields(body, ['title', 'description', 'date', 'status']);
  const data = {};
  if (!partial || body.title !== undefined) data.title = text(body.title, 'Title', 3, 120);
  if (body.description !== undefined)
    data.description = text(body.description, 'Description', 0, 1000);
  if (!partial || body.date !== undefined) data.date = dateOnly(body.date, 'Event date');
  if (body.status !== undefined) {
    if (!['active', 'closed'].includes(body.status))
      throw new HttpError(400, 'Status must be active or closed.');
    data.status = body.status;
  }
  if (!Object.keys(data).length) throw new HttpError(400, 'Provide at least one event field.');
  return data;
}
