import {
  CalendarDays,
  ChartNoAxesCombined,
  MessageSquare,
  Plus,
  RefreshCw,
  ShieldCheck,
  Star,
  ThumbsUp,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Rating,
  SectionTitle,
  Skeleton,
  StatCard,
} from '../components/ui/Common';
import { DistributionChart, EventChart, TrendChart } from '../components/dashboard/Charts';
import { formatDate } from '../utils/format';
export default function Dashboard() {
  const stats = useApi('/admin/stats');
  const recent = useApi('/admin/feedback?limit=4');
  const hasFeedback = Boolean(stats.data?.totalSubmissions);
  const activityCount = stats.data?.dailyTrend.reduce((sum, day) => sum + day.count, 0) || 0;
  return (
    <>
      <PageHeader
        eyebrow="WORKSPACE OVERVIEW"
        title="A clearer picture of your impact."
        description="Listen to your community. Make every experience a little better."
        action={
          <Button size="small" to="/admin/events?create=1">
            <Plus size={16} />
            Create event
          </Button>
        }
      />
      <div className="dashboard-toolbar">
        <div>
          <Badge>
            <CalendarDays size={13} />
            All-time overview
          </Badge>
          <span>Every insight comes from a real response.</span>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={() => {
            stats.reload();
            recent.reload();
          }}
          disabled={stats.loading}
          aria-label="Refresh"
        >
          <RefreshCw size={15} className={stats.loading ? 'spin' : ''} />
          Refresh
        </Button>
      </div>
      {stats.loading ? (
        <Skeleton kind="stats" count={4} label="Gathering your insights…" />
      ) : stats.error ? (
        <Card>
          <ErrorState message={stats.error} retry={stats.reload} />
        </Card>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard
              icon={MessageSquare}
              label="Total responses"
              value={stats.data.totalSubmissions.toLocaleString()}
              description="Perspectives shared"
            />
            <StatCard
              icon={Star}
              label="Average rating"
              value={stats.data.averageRating === null ? '—' : stats.data.averageRating.toFixed(1)}
              suffix={stats.data.averageRating === null ? undefined : '/ 5'}
              description="Across all responses"
            />
            <StatCard
              icon={ThumbsUp}
              label="Positive feedback"
              value={`${stats.data.positivePercentage}%`}
              description="Rated 4 or 5 stars"
              explanation="The share of all responses rated 4 or 5. This is 0% when there are no responses."
            />
            <StatCard
              icon={CalendarDays}
              label="Total events"
              value={stats.data.totalEvents}
              description="Open and closed events"
            />
          </div>
          {!hasFeedback && (
            <div className="onboarding-banner">
              <span className="banner-icon">
                <MessageSquare size={22} />
              </span>
              <div>
                <h2>Your first insight starts with a response</h2>
                <p>
                  Share your feedback portal after an event. Your community will take it from there.
                </p>
              </div>
              <Button variant="secondary" size="small" to="/feedback">
                Open feedback portal
              </Button>
            </div>
          )}
          <div className="charts-grid">
            <Card className="activity-panel">
              <SectionTitle
                title="Feedback activity"
                subtitle="A little perspective on participation"
              >
                <Badge>Last 30 days</Badge>
              </SectionTitle>
              <div className="activity-summary">
                <strong>{activityCount.toLocaleString()}</strong>
                <span>responses in the last 30 days</span>
                <span className="chart-legend">
                  <i />
                  Responses
                </span>
              </div>
              {activityCount ? (
                <TrendChart data={stats.data.dailyTrend} />
              ) : (
                <EmptyState
                  compact
                  icon={ChartNoAxesCombined}
                  title="A new conversation is on the horizon"
                  message="Responses from the last 30 days will appear here."
                />
              )}
              <div className="panel-footer">Daily submissions · Dates shown in UTC</div>
            </Card>
            <Card className="distribution-panel">
              <SectionTitle title="Rating distribution" subtitle="Every experience, at a glance" />
              {hasFeedback ? (
                <>
                  <div className="distribution-summary">
                    <strong>{stats.data.averageRating.toFixed(1)}</strong>
                    <div>
                      <span className="summary-stars" aria-hidden="true">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Star
                            key={value}
                            size={15}
                            fill={
                              value <= Math.round(stats.data.averageRating)
                                ? 'currentColor'
                                : 'none'
                            }
                          />
                        ))}
                      </span>
                      <p>
                        From {stats.data.totalSubmissions}{' '}
                        {stats.data.totalSubmissions === 1 ? 'response' : 'responses'}
                      </p>
                    </div>
                  </div>
                  <DistributionChart data={stats.data.ratingDistribution} />
                </>
              ) : (
                <EmptyState
                  compact
                  icon={Star}
                  title="Your ratings will tell the story"
                  message="The distribution appears after your first response."
                />
              )}
            </Card>
          </div>
          <div className="dashboard-bottom-grid">
            <Card className="event-performance-panel">
              <SectionTitle
                title="Event performance"
                subtitle="Understand what resonates"
                link={{ to: '/admin/events', label: 'All events' }}
              />
              {hasFeedback ? (
                <EventChart data={stats.data.eventStats.filter((event) => event.count > 0)} />
              ) : (
                <EmptyState
                  compact
                  icon={CalendarDays}
                  title="Every event has room to grow"
                  message="Compare event ratings once feedback arrives."
                />
              )}
              <div className="panel-footer">Average ratings · Events with feedback</div>
            </Card>
            <Card className="recent-panel">
              <SectionTitle
                title="Latest perspectives"
                subtitle="The voices behind the numbers"
                link={{ to: '/admin/feedback', label: 'View all' }}
              />
              {recent.loading ? (
                <Skeleton label="Loading recent feedback…" count={3} />
              ) : recent.error ? (
                <ErrorState message={recent.error} retry={recent.reload} />
              ) : !recent.data.feedback.length ? (
                <EmptyState
                  compact
                  icon={MessageSquare}
                  title="Listening mode: on"
                  message="The latest responses will appear here."
                />
              ) : (
                <div className="recent-list">
                  {recent.data.feedback.map((item) => (
                    <article className="recent-item" key={item._id}>
                      <div className="recent-heading">
                        <h3>{item.eventId?.title || 'Unavailable event'}</h3>
                        <Rating value={item.rating} />
                      </div>
                      <p>{item.comment || 'This participant shared a rating without a comment.'}</p>
                      <div className="recent-meta">
                        <Badge>{item.category}</Badge>
                        <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
      <p className="analytics-note">
        <ShieldCheck size={14} />
        Anonymous responses. Real insights. Positive feedback means a rating of 4 or 5.
      </p>
    </>
  );
}
