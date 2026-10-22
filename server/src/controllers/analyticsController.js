import Feedback from '../models/Feedback.js';
import Event from '../models/Event.js';
export async function statistics(req, res) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 29);
  const [result, events] = await Promise.all([
    Feedback.aggregate([
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalSubmissions: { $sum: 1 },
                averageRating: { $avg: '$rating' },
                positive: { $sum: { $cond: [{ $gte: ['$rating', 4] }, 1, 0] } },
              },
            },
          ],
          distribution: [{ $group: { _id: '$rating', count: { $sum: 1 } } }],
          trend: [
            { $match: { createdAt: { $gte: start } } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
                count: { $sum: 1 },
              },
            },
          ],
          byEvent: [
            { $group: { _id: '$eventId', count: { $sum: 1 }, averageRating: { $avg: '$rating' } } },
          ],
        },
      },
    ]),
    Event.find().select('title').sort({ date: -1 }).lean(),
  ]);
  const {
    summary: [summary],
    distribution,
    trend,
    byEvent,
  } = result[0];
  const round = (value) => Math.round(value * 100) / 100;
  const dailyTrend = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const day = date.toISOString().slice(0, 10);
    return { date: day, count: trend.find((item) => item._id === day)?.count || 0 };
  });
  res.json({
    totalSubmissions: summary?.totalSubmissions || 0,
    totalEvents: events.length,
    averageRating: summary ? round(summary.averageRating) : null,
    positivePercentage: summary ? round((summary.positive / summary.totalSubmissions) * 100) : 0,
    ratingDistribution: Array.from({ length: 5 }, (_, i) => ({
      rating: i + 1,
      count: distribution.find((item) => item._id === i + 1)?.count || 0,
    })),
    dailyTrend,
    eventStats: events.map((event) => {
      const item = byEvent.find((item) => String(item._id) === String(event._id));
      return {
        eventId: event._id,
        title: event.title,
        count: item?.count || 0,
        averageRating: item ? round(item.averageRating) : null,
      };
    }),
  });
}
