import Event from '../models/Event.js';
import Feedback from '../models/Feedback.js';
import { eventInput, objectId, HttpError } from '../utils/validation.js';
export async function publicEvents(req, res) {
  const events = await Event.find({ status: 'active' })
    .select('title description date status')
    .sort({ date: -1 })
    .lean();
  res.json({ events });
}
export async function adminEvents(req, res) {
  const [events, counts] = await Promise.all([
    Event.find().sort({ date: -1 }).lean(),
    Feedback.aggregate([{ $group: { _id: '$eventId', feedbackCount: { $sum: 1 } } }]),
  ]);
  const countById = new Map(counts.map((item) => [String(item._id), item.feedbackCount]));
  res.json({
    events: events.map((event) => ({
      ...event,
      feedbackCount: countById.get(String(event._id)) || 0,
    })),
  });
}
export async function createEvent(req, res) {
  const event = await Event.create(eventInput(req.body));
  res.status(201).json({ event });
}
export async function updateEvent(req, res) {
  const id = objectId(req.params.id);
  const event = await Event.findByIdAndUpdate(
    id,
    { $set: eventInput(req.body, true) },
    { new: true, runValidators: true },
  );
  if (!event) throw new HttpError(404, 'Event not found.');
  res.json({ event });
}
