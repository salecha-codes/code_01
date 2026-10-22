import { CalendarDays, MessageSquare, Plus, RefreshCw, Star, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import {
  EmptyState,
  ErrorState,
  Loading,
  PageHeader,
  Rating,
  SectionTitle,
} from '../components/ui/Common';
import { DistributionChart, EventChart, TrendChart } from '../components/dashboard/Charts';
import { formatDate } from '../utils/format';
export default function Dashboard() {
  const stats = useApi('/admin/stats');
  const recent = useApi('/admin/feedback?limit=4');
  return (
    <>
      <PageHeader
        eyebrow="YOUR COMMUNITY, AT A GLANCE"
        title="Overview"
        description="A little perspective on the experiences you’re creating."
        action={
          <Link className="button primary small" to="/admin/events?create=1">
            <Plus size={16} />
            Create event
          </Link>
        }
      />
      <div className="dashboard-toolbar">
        <span>
          <span className="live-dot" />
          Insights from your community
        </span>
        <button
          className="button secondary small"
          onClick={() => {
            stats.reload();
            recent.reload();
          }}
          disabled={stats.loading}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>
      {stats.loading ? (
        <Loading label="Gathering your insights…" />
      ) : stats.error ? (
        <ErrorState message={stats.error} retry={stats.reload} />
      ) : (
        <>
          <div className="stat-grid">
            {[
              [
                MessageSquare,
                'Total responses',
                stats.data.totalSubmissions.toLocaleString(),
                'Every voice counts',
              ],
              [CalendarDays, 'Total events', stats.data.totalEvents, 'Across your workspace'],
              [
                Star,
                'Average rating',
                stats.data.averageRating === null ? '—' : stats.data.averageRating.toFixed(1),
                'Out of 5 stars',
              ],
              [
                ThumbsUp,
                'Positive feedback',
                `${stats.data.positivePercentage}%`,
                'Responses rated 4 or 5',
              ],
            ].map(([Icon, label, value, detail]) => (
              <article className="stat-card" key={label}>
                <div>
                  <span>{label}</span>
                  <Icon size={17} />
                </div>
                <strong>
                  {value}
                  {label === 'Average rating' && stats.data.averageRating !== null && (
                    <small>/ 5</small>
                  )}
                </strong>
                <p>{detail}</p>
              </article>
            ))}
          </div>
          {!stats.data.totalSubmissions ? (
            <div className="panel">
              <EmptyState
                title="Your first insight starts with a response"
                message="Share the public feedback portal after your event. Real responses will appear here."
              >
                <Link className="button secondary" to="/feedback">
                  Open feedback portal
                </Link>
              </EmptyState>
            </div>
          ) : (
            <>
              <div className="charts-grid">
                <section className="panel chart-panel">
                  <SectionTitle
                    title="Feedback activity"
                    subtitle="Responses per day · last 30 days (UTC)"
                  />
                  <TrendChart data={stats.data.dailyTrend} />
                </section>
                <section className="panel chart-panel">
                  <SectionTitle
                    title="Rating breakdown"
                    subtitle="How your community feels · all time"
                  />
                  <DistributionChart data={stats.data.ratingDistribution} />
                </section>
              </div>
              <section className="panel chart-panel event-comparison">
                <SectionTitle
                  title="Every event has a story"
                  subtitle="Average ratings across events with feedback"
                />
                <EventChart data={stats.data.eventStats.filter((event) => event.count > 0)} />
              </section>
            </>
          )}
        </>
      )}
      <section className="panel recent-panel">
        <SectionTitle
          title="Recent feedback"
          subtitle="The latest voices from your community"
          link={{ to: '/admin/feedback', label: 'View all feedback' }}
        />
        {recent.loading ? (
          <Loading />
        ) : recent.error ? (
          <ErrorState message={recent.error} retry={recent.reload} />
        ) : !recent.data.feedback.length ? (
          <EmptyState
            title="Listening mode: on"
            message="New responses will show up here as they arrive."
          />
        ) : (
          <div className="recent-list">
            {recent.data.feedback.map((item) => (
              <article className="recent-item" key={item._id}>
                <span className="feedback-avatar">
                  <MessageSquare size={17} />
                </span>
                <div>
                  <div className="recent-heading">
                    <h3>{item.eventId?.title || 'Unavailable event'}</h3>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  <p>{item.comment || 'This participant left a rating without a comment.'}</p>
                  <span className="category-tag">{item.category}</span>
                </div>
                <Rating value={item.rating} />
              </article>
            ))}
          </div>
        )}
      </section>
      <p className="analytics-note">
        Positive feedback means a rating of 4 or 5. Summary cards show all-time totals.
      </p>
    </>
  );
}
