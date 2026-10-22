import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { shortDate } from '../../utils/format';
const tooltip = {
  background: '#202126',
  border: '1px solid #3a3b43',
  borderRadius: 10,
  color: '#f3f2f7',
  fontSize: 12,
};
const axis = { stroke: '#898994', fontSize: 11, tickLine: false, axisLine: false };
export function TrendChart({ data }) {
  return (
    <div className="chart" role="img" aria-label="Daily feedback submissions over the last 30 days">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 15, right: 12, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a494ff" stopOpacity={0.24} />
              <stop offset="100%" stopColor="#a494ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#2b2c32" vertical={false} strokeDasharray="3 4" />
          <XAxis dataKey="date" {...axis} tickFormatter={shortDate} minTickGap={35} />
          <YAxis {...axis} allowDecimals={false} />
          <Tooltip contentStyle={tooltip} labelFormatter={shortDate} />
          <Area
            isAnimationActive={false}
            type="monotone"
            dataKey="count"
            name="Responses"
            stroke="#a494ff"
            strokeWidth={2.5}
            fill="url(#trendFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function DistributionChart({ data }) {
  return (
    <div
      className="chart"
      role="img"
      aria-label={`Rating distribution: ${data.map((item) => `${item.rating} stars, ${item.count} responses`).join('; ')}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 10, left: -24, bottom: 0 }} barSize={32}>
          <CartesianGrid stroke="#2b2c32" vertical={false} strokeDasharray="3 4" />
          <XAxis {...axis} dataKey="rating" tickFormatter={(value) => `${value} ★`} />
          <YAxis {...axis} allowDecimals={false} />
          <Tooltip contentStyle={tooltip} cursor={{ fill: '#ffffff05' }} />
          <Bar isAnimationActive={false} dataKey="count" name="Responses" radius={[5, 5, 0, 0]}>
            {data.map((item, index) => (
              <Cell
                key={item.rating}
                fill={['#55515e', '#6a607e', '#84729e', '#a491d7', '#b5a3ff'][index]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export function EventChart({ data }) {
  return (
    <div
      className="chart event-chart"
      style={{ height: Math.max(180, data.length * 55) }}
      role="img"
      aria-label="Average rating by event"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
          barSize={13}
        >
          <XAxis type="number" domain={[0, 5]} {...axis} />
          <YAxis
            dataKey="title"
            type="category"
            {...axis}
            width={135}
            tickFormatter={(value) => (value.length > 19 ? `${value.slice(0, 18)}…` : value)}
          />
          <Tooltip contentStyle={tooltip} cursor={{ fill: '#ffffff05' }} />
          <Bar
            isAnimationActive={false}
            dataKey="averageRating"
            name="Average rating"
            fill="#a494ff"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
