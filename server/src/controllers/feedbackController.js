import Event from '../models/Event.js';
import Feedback from '../models/Feedback.js';
import {
  allowFields,
  objectId,
  category,
  text,
  integerQuery,
  dateOnly,
  HttpError,
} from '../utils/validation.js';
export async function submitFeedback(req, res) {
  allowFields(req.body, ['eventId', 'rating', 'category', 'comment', 'wouldRecommend']);
  const data = { eventId: objectId(req.body.eventId), category: category(req.body.category) };
  if (!Number.isInteger(req.body.rating) || req.body.rating < 1 || req.body.rating > 5)
    throw new HttpError(400, 'Rating must be a whole number from 1 to 5.');
  data.rating = req.body.rating;
  data.comment = req.body.comment === undefined ? '' : text(req.body.comment, 'Comment', 0, 2000);
  if (data.comment && data.comment.length < 3)
    throw new HttpError(400, 'Comments must contain at least 3 characters.');
  if (req.body.wouldRecommend !== undefined) {
    if (typeof req.body.wouldRecommend !== 'boolean')
      throw new HttpError(400, 'Recommendation must be true or false.');
    data.wouldRecommend = req.body.wouldRecommend;
  }
  const event = await Event.findById(data.eventId).select('status');
  if (!event) throw new HttpError(404, 'Event not found.');
  if (event.status !== 'active')
    throw new HttpError(409, 'This event is no longer accepting feedback.');
  await Feedback.create(data);
  res.status(201).json({ message: 'Thank you. Your anonymous feedback has been received.' });
}
export async function listFeedback(req, res) {
  const query = req.query;
  allowFields(query, [
    'eventId',
    'rating',
    'category',
    'search',
    'startDate',
    'endDate',
    'page',
    'limit',
  ]);
  const page = integerQuery(query.page, 1, 1, 100000, 'Page');
  const limit = integerQuery(query.limit, 10, 1, 50, 'Limit');
  const filter = {};
  if (query.eventId !== undefined) filter.eventId = objectId(query.eventId);
  if (query.rating !== undefined)
    filter.rating = integerQuery(query.rating, undefined, 1, 5, 'Rating');
  if (query.category !== undefined) filter.category = category(query.category);
  if (query.search !== undefined) {
    const search = text(query.search, 'Search', 1, 100);
    // Escape regex syntax: the search is literal text, never a user-controlled regex.
    filter.comment = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  }
  if (query.startDate !== undefined || query.endDate !== undefined) {
    filter.createdAt = {};
    if (query.startDate !== undefined)
      filter.createdAt.$gte = dateOnly(query.startDate, 'Start date');
    if (query.endDate !== undefined) {
      const end = dateOnly(query.endDate, 'End date');
      end.setUTCDate(end.getUTCDate() + 1);
      filter.createdAt.$lt = end; // Inclusive end date, using a UTC half-open range.
    }
    if (
      filter.createdAt.$gte &&
      filter.createdAt.$lt &&
      filter.createdAt.$gte >= filter.createdAt.$lt
    )
      throw new HttpError(400, 'Start date must not be after end date.');
  }
  const [feedback, total] = await Promise.all([
    Feedback.find(filter)
      .populate('eventId', 'title')
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Feedback.countDocuments(filter),
  ]);
  res.json({ feedback, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}
