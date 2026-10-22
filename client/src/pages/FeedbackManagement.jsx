import { useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { categories, formatDate } from '../utils/format';
import { EmptyState, ErrorState, Loading, PageHeader, Rating } from '../components/ui/Common';
const empty = { eventId: '', rating: '', category: '', startDate: '', endDate: '', search: '' };
export default function FeedbackManagement() {
  const [draft, setDraft] = useState(empty);
  const [filters, setFilters] = useState(empty);
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
    setFilters({ ...draft, search: draft.search.trim() });
    setPage(1);
  }
  function clear() {
    setDraft(empty);
    setFilters(empty);
    setPage(1);
  }
  return (
    <>
      <PageHeader
        eyebrow="LISTEN CLOSELY. BUILD BETTER."
        title="Feedback"
        description="Every response is a chance to make the next event better."
      />
      <form className="panel filter-panel" onSubmit={apply}>
        <div className="filter-heading">
          <h2>
            <SlidersHorizontal size={16} />
            Find the feedback that matters
          </h2>
          {count > 0 && (
            <button className="text-link" type="button" onClick={clear}>
              <X size={14} />
              Clear filters ({count})
            </button>
          )}
        </div>
        <div className="filter-grid">
          <div>
            <label htmlFor="filter-event">Event</label>
            <select id="filter-event" name="eventId" value={draft.eventId} onChange={change}>
              <option value="">All events</option>
              {events.data?.events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-rating">Rating</label>
            <select id="filter-rating" name="rating" value={draft.rating} onChange={change}>
              <option value="">All ratings</option>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} {value === 1 ? 'star' : 'stars'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-category">Category</label>
            <select id="filter-category" name="category" value={draft.category} onChange={change}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="startDate">From (UTC)</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={draft.startDate}
              onChange={change}
            />
          </div>
          <div>
            <label htmlFor="endDate">To (UTC)</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              min={draft.startDate || undefined}
              value={draft.endDate}
              onChange={change}
            />
          </div>
        </div>
        <div className="search-row">
          <div className="search-input">
            <Search size={17} />
            <input
              aria-label="Search comments"
              name="search"
              value={draft.search}
              maxLength={100}
              onChange={change}
              placeholder="Search within comments…"
            />
          </div>
          <button className="button primary small">
            <Filter size={15} />
            Apply filters
          </button>
        </div>
        {events.error && (
          <p className="form-error" role="alert">
            Event filters could not load.{' '}
            <button type="button" className="text-link" onClick={events.reload}>
              Retry
            </button>
          </p>
        )}
      </form>
      <section className="panel feedback-table-panel">
        <div className="table-title">
          <h2>
            All responses{' '}
            <span className="count-badge">{result.data?.pagination.total ?? '—'}</span>
          </h2>
          <span>Anonymous, always.</span>
        </div>
        {result.loading ? (
          <Loading label="Loading feedback…" />
        ) : result.error ? (
          <ErrorState message={result.error} retry={result.reload} />
        ) : !result.data.feedback.length ? (
          <EmptyState
            title={count ? 'No responses match your filters' : 'No feedback yet'}
            message={
              count
                ? 'Try a different event, date range, or rating.'
                : 'Share an open event to start the conversation.'
            }
          >
            {count > 0 && (
              <button className="button secondary small" onClick={clear}>
                Clear filters
              </button>
            )}
          </EmptyState>
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Event / category</th>
                    <th>Rating</th>
                    <th>Feedback</th>
                    <th>Recommends</th>
                    <th>Received (UTC)</th>
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
                        <p className={expanded === item._id ? '' : 'comment-preview'}>
                          {item.comment || <span className="muted">No written comment</span>}
                        </p>
                        {item.comment.length > 140 && (
                          <button
                            className="text-link"
                            onClick={() => setExpanded(expanded === item._id ? null : item._id)}
                            aria-expanded={expanded === item._id}
                          >
                            {expanded === item._id ? 'Show less' : 'Read full comment'}
                          </button>
                        )}
                      </td>
                      <td>
                        <span
                          className={`recommend-badge ${item.wouldRecommend === true ? 'yes' : ''}`}
                        >
                          {item.wouldRecommend === undefined
                            ? 'Not answered'
                            : item.wouldRecommend
                              ? 'Yes'
                              : 'No'}
                        </span>
                      </td>
                      <td className="date-cell">{formatDate(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
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
            </div>
          </>
        )}
      </section>
    </>
  );
}
