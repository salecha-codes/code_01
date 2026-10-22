import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Star } from 'lucide-react';
import { shortDate } from '../../utils/format';
import { Table } from '../ui/Common';
const axis = { stroke: '#949CAA', fontSize: 11, tickLine: false, axisLine: false };
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <span>{shortDate(label)}</span>
      <strong>
        {payload[0].value} {payload[0].value === 1 ? 'response' : 'responses'}
      </strong>
    </div>
  );
}
export function TrendChart({ data }) {
  const count = data.reduce((sum, day) => sum + day.count, 0);
  return (
    <>
      <div
        className="chart"
        role="img"
        aria-label={`Daily feedback submissions over the last 30 days: ${count} total responses.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 16, right: 10, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B7CF6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#8B7CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#292F3B" vertical={false} strokeDasharray="3 5" />
            <XAxis
              dataKey="date"
              {...axis}
              tickFormatter={shortDate}
              minTickGap={40}
              tickMargin={12}
            />
            <YAxis {...axis} allowDecimals={false} domain={[0, (max) => Math.max(1, max)]} />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: '#949CAA', strokeDasharray: '3 4' }}
            />
            <Area
              isAnimationActive={false}
              type="monotone"
              dataKey="count"
              name="Responses"
              stroke="#A89CFF"
              strokeWidth={2}
              fill="url(#trendFill)"
              activeDot={{ r: 4, stroke: '#151922', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <details className="chart-data">
        <summary>View activity data</summary>
        <div className="chart-data-scroll">
          <Table caption="Daily responses in UTC">
            <thead>
              <tr>
                <th scope="col">Date (UTC)</th>
                <th scope="col">Responses</th>
              </tr>
            </thead>
            <tbody>
              {data.map((day) => (
                <tr key={day.date}>
                  <th scope="row">{shortDate(day.date)}</th>
                  <td>{day.count}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </details>
    </>
  );
}
export function DistributionChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  return (
    <div
      className="distribution-chart"
      role="img"
      aria-label={`Rating distribution: ${data.map((item) => `${item.rating} stars, ${item.count} responses`).join('; ')}`}
    >
      {[...data].reverse().map((item) => (
        <div className="distribution-row" key={item.rating}>
          <span>
            {item.rating}
            <Star size={12} fill="currentColor" />
          </span>
          <meter
            min={0}
            max={Math.max(total, 1)}
            value={item.count}
            aria-label={`${item.rating} star responses`}
          >
            {item.count}
          </meter>
          <strong>{item.count}</strong>
          <span className="distribution-percent">
            {total ? Math.round((item.count / total) * 100) : 0}%
          </span>
        </div>
      ))}
      <p className="chart-footnote">Every response, from 1 to 5 stars.</p>
    </div>
  );
}
export function EventChart({ data }) {
  return (
    <div className="event-performance">
      <div className="performance-labels" aria-hidden="true">
        <span>Event</span>
        <span>Average rating</span>
        <span>Responses</span>
      </div>
      {data.map((event) => (
        <div className="performance-row" key={event.eventId}>
          <span className="performance-event">{event.title}</span>
          <div className="performance-score">
            <meter
              min={0}
              max={5}
              value={event.averageRating}
              aria-label={`Average rating for ${event.title}`}
            >
              {event.averageRating} out of 5
            </meter>
            <strong>
              {event.averageRating.toFixed(1)}
              <span>/5</span>
            </strong>
          </div>
          <span className="performance-count">
            {event.count}
            <span className="mobile-only"> responses</span>
          </span>
        </div>
      ))}
    </div>
  );
}
