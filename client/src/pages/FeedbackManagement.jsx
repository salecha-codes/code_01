import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  MessageSquare,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { categories, formatDate } from '../utils/format';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Input,
  PageHeader,
  Rating,
  Select,
  Skeleton,
  Table,
} from '../components/ui/Common';
const empty = { eventId: '', rating: '', category: '', startDate: '', endDate: '', search: '' };
function Comment({ item, expanded, toggle }) {
  return (
    <div className="response-comment">
      <p className={expanded ? '' : 'comment-preview'}>
        {item.comment || <span className="muted">No written comment</span>}
      </p>
      {item.comment.length > 140 && (
        <button type="button" className="text-link" onClick={toggle} aria-expanded={expanded}>
          {expanded ? 'Show less' : 'Read full comment'}
        </button>
      )}
    </div>
  );
}
function Recommendation({ value }) {
  return (
    <span className={`recommendation ${value === true ? 'yes' : ''}`}>
      {value === undefined ? 'Not answered' : value ? 'Yes' : 'No'}
    </span>
  );
}
export default function FeedbackManagement() {
  const [params, setParams] = useSearchParams();
  const initialFilters = { ...empty, eventId: params.get('eventId') || '' };
  const [draft, setDraft] = useState(initialFilters);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const events = useApi('/admin/events');
  const query = new URLSearchParams({ page: String(page), limit: '10' });
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const result = useApi(`/admin/feedback?${query}`);
  const count = Object.values(filters).filter(Boolean).length;
  const change = (event) => setDraft({ ...draft, [event.target.name]: event.target.value });
  function apply(event) {
    event.preventDefault();
    setParams(draft.eventId ? { eventId: draft.eventId } : {}, { replace: true });
    setFilters({ ...draft, search: draft.search.trim() });
    setPage(1);
  }
  function clear() {
    setParams({}, { replace: true });
    setDraft(empty);
    setFilters(empty);
    setPage(1);
  }
  function removeFilter(key) {
    if (key === 'eventId') setParams({}, { replace: true });
    setFilters({ ...filters, [key]: '' });
    setDraft({ ...draft, [key]: '' });
    setPage(1);
  }
  function filterLabel(key, value) {
    if (key === 'eventId')
      return events.data?.events.find((event) => event._id === value)?.title || 'Selected event';
    if (key === 'rating') return `${value} stars`;
    if (key === 'startDate') return `From ${value}`;
    if (key === 'endDate') return `To ${value}`;
    if (key === 'search') return `“${value}”`;
    return value;
  }
  return (
    <>
      <PageHeader
        eyebrow="COMMUNITY FEEDBACK"
        title="Every response has a story."
        description="Find the perspectives that help you make the next event better."
      />
      <Card as="form" className="filter-panel" onSubmit={apply}>
        <div className="filter-heading">
          <h2>
            <SlidersHorizontal size={17} />
            Filter responses
          </h2>
          {count > 0 && (
            <button className="text-link" type="button" onClick={clear}>
              Clear filters ({count})<X size={14} />
            </button>
          )}
        </div>
        <div className="filter-grid">
          <Field id="filter-event" label="Event">
            <Select id="filter-event" name="eventId" value={draft.eventId} onChange={change}>
              <option value="">All events</option>
              {events.data?.events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="filter-rating" label="Rating">
            <Select id="filter-rating" name="rating" value={draft.rating} onChange={change}>
              <option value="">All ratings</option>
              {[5, 4, 3, 2, 1].map((value) => (
                <option value={value} key={value}>
                  {value} {value === 1 ? 'star' : 'stars'}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="filter-category" label="Category">
            <Select id="filter-category" name="category" value={draft.category} onChange={change}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="filter-bottom">
          <Field id="search" label="Search comments">
            <Input
              id="search"
              icon={Search}
              name="search"
              value={draft.search}
              onChange={change}
              maxLength={100}
              placeholder="A word, an idea, a perspective…"
            />
          </Field>
          <Field id="startDate" label="From (UTC)">
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={draft.startDate}
              onChange={change}
            />
          </Field>
          <Field id="endDate" label="To (UTC)">
            <Input
              id="endDate"
              name="endDate"
              type="date"
              min={draft.startDate || undefined}
              value={draft.endDate}
              onChange={change}
            />
          </Field>
          <Button type="submit" variant="secondary" className="apply-filters">
            <Filter size={15} />
            Apply filters
          </Button>
        </div>
        {events.error && (
          <p className="form-error" role="alert">
            Event choices couldn’t load.{' '}
            <button type="button" className="text-link" onClick={events.reload}>
              Retry
            </button>
          </p>
        )}
      </Card>
      {count > 0 && (
        <div className="active-filters" aria-label="Applied filters">
          <span>Showing:</span>
          {Object.entries(filters)
            .filter(([, value]) => value)
            .map(([key, value]) => (
              <button
                key={key}
                type="button"
                aria-label={`Remove ${filterLabel(key, value)} filter`}
                onClick={() => removeFilter(key)}
              >
                {filterLabel(key, value)}
                <X size={12} />
              </button>
            ))}
        </div>
      )}
      <Card className="feedback-table-panel">
        <div className="table-title">
          <h2>
            {count ? 'Filtered responses' : 'All responses'}
            <span className="count-badge">{result.data?.pagination.total ?? '—'}</span>
          </h2>
          <span>
            <ShieldCheck size={14} />
            No names attached
          </span>
        </div>
        {result.loading ? (
          <Skeleton count={4} label="Loading feedback…" />
        ) : result.error ? (
          <ErrorState message={result.error} retry={result.reload} />
        ) : !result.data.feedback.length ? (
          <EmptyState
            icon={count ? Search : MessageSquare}
            title={count ? 'No responses match your filters' : 'No feedback yet'}
            message={
              count
                ? 'Try broadening your date range or removing a filter.'
                : 'Share an open event to start the conversation.'
            }
          >
            {count > 0 && (
              <Button variant="secondary" size="small" onClick={clear}>
                Clear filters
              </Button>
            )}
          </EmptyState>
        ) : (
          <>
            <div className="desktop-feedback-table">
              <Table caption="Anonymous feedback responses">
                <thead>
                  <tr>
                    <th scope="col">Event & category</th>
                    <th scope="col">Rating</th>
                    <th scope="col">Feedback</th>
                    <th scope="col">Recommends</th>
                    <th scope="col">Received (UTC)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.feedback.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <strong>{item.eventId?.title || 'Unavailable event'}</strong>
                        <span className="table-category">{item.category}</span>
                      </td>
                      <td>
                        <Rating value={item.rating} />
                      </td>
                      <td className="comment-cell">
                        <Comment
                          item={item}
                          expanded={expanded === item._id}
                          toggle={() => setExpanded(expanded === item._id ? null : item._id)}
                        />
                      </td>
                      <td>
                        <Recommendation value={item.wouldRecommend} />
                      </td>
                      <td className="date-cell">
                        <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <div className="mobile-feedback-list">
              {result.data.feedback.map((item) => (
                <article className="mobile-feedback-card" key={item._id}>
                  <header>
                    <h3>{item.eventId?.title || 'Unavailable event'}</h3>
                    <Rating value={item.rating} />
                  </header>
                  <Badge>{item.category}</Badge>
                  <Comment
                    item={item}
                    expanded={expanded === item._id}
                    toggle={() => setExpanded(expanded === item._id ? null : item._id)}
                  />
                  <footer>
                    <span>
                      Recommends: <Recommendation value={item.wouldRecommend} />
                    </span>
                    <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                  </footer>
                </article>
              ))}
            </div>
            <nav className="pagination" aria-label="Feedback pagination">
              <span>
                Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, result.data.pagination.total)} of{' '}
                {result.data.pagination.total}
              </span>
              <div>
                <button
                  className="icon-button"
                  aria-label="Previous page"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <span>
                  Page {page} of {result.data.pagination.totalPages}
                </span>
                <button
                  className="icon-button"
                  aria-label="Next page"
                  disabled={page >= result.data.pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </nav>
          </>
        )}
      </Card>
    </>
  );
}
