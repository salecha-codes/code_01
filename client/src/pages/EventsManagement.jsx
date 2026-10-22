import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CalendarDays,
  LoaderCircle,
  MessageSquare,
  Pencil,
  Plus,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDate } from '../utils/format';
import { EmptyState, ErrorState, Loading, PageHeader } from '../components/ui/Common';
const blank = { title: '', description: '', date: '', status: 'active' };
export default function EventsManagement() {
  const [params, setParams] = useSearchParams();
  const { data, loading, error, reload } = useApi('/admin/events');
  const [editing, setEditing] = useState(params.has('create') ? 'new' : null);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  function open(event) {
    setEditing(event ? event._id : 'new');
    setForm(
      event
        ? {
            title: event.title,
            description: event.description,
            date: event.date.slice(0, 10),
            status: event.status,
          }
        : blank,
    );
    setSaveError('');
  }
  function close() {
    setEditing(null);
    setParams({});
    setSaveError('');
  }
  async function save(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setSaveError('');
    try {
      await api(editing === 'new' ? '/admin/events' : `/admin/events/${editing}`, {
        method: editing === 'new' ? 'POST' : 'PATCH',
        body: form,
      });
      toast.success(
        editing === 'new' ? 'Event created. Feedback is ready when you are.' : 'Event updated.',
      );
      close();
      reload();
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setBusy(false);
    }
  }
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  return (
    <>
      <PageHeader
        eyebrow="MAKE ROOM FOR GREAT EXPERIENCES"
        title="Events"
        description="Create a conversation around every workshop and gathering."
        action={
          <button className="button primary small" onClick={() => open()}>
            <Plus size={16} />
            Create event
          </button>
        }
      />
      {editing && (
        <section className="panel event-editor" aria-labelledby="editor-title">
          <div className="section-title">
            <h2 id="editor-title">{editing === 'new' ? 'Create an event' : 'Edit event'}</h2>
            <button
              className="icon-button"
              onClick={close}
              disabled={busy}
              aria-label="Close event editor"
            >
              <X size={19} />
            </button>
          </div>
          <form onSubmit={save}>
            <div className="editor-grid">
              <div>
                <label htmlFor="title">Event title</label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={change}
                  minLength={3}
                  maxLength={120}
                  placeholder="e.g. Intro to Web Development"
                  required
                />
              </div>
              <div>
                <label htmlFor="date">Event date</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={change}
                  required
                />
              </div>
            </div>
            <label htmlFor="description">
              Description <span className="optional">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={change}
              rows={3}
              maxLength={1000}
              placeholder="What’s this event about?"
            />
            <label htmlFor="status">Feedback collection</label>
            <select id="status" name="status" value={form.status} onChange={change}>
              <option value="active">Open — accepting feedback</option>
              <option value="closed">Closed — no new responses</option>
            </select>
            <p className="field-hint">
              The status controls submissions. The event date does not automatically close feedback.
            </p>
            {saveError && (
              <p className="form-error" role="alert">
                {saveError}
              </p>
            )}
            <div className="editor-actions">
              <button
                className="button secondary small"
                type="button"
                onClick={close}
                disabled={busy}
              >
                Cancel
              </button>
              <button className="button primary small" disabled={busy}>
                {busy && <LoaderCircle className="spin" size={15} />}{' '}
                {busy ? 'Saving…' : 'Save event'}
              </button>
            </div>
          </form>
        </section>
      )}
      {loading ? (
        <Loading label="Loading your events…" />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : !data.events.length ? (
        <div className="panel">
          <EmptyState
            title="Your next great event starts here"
            message="Create an event to give your participants a place to be heard."
          >
            <button className="button primary small" onClick={() => open()}>
              <Plus size={15} />
              Create your first event
            </button>
          </EmptyState>
        </div>
      ) : (
        <>
          <div className="events-summary">
            <span>{data.events.length} events in your workspace</span>
            <span>
              <span className="live-dot" />
              {data.events.filter((event) => event.status === 'active').length} accepting feedback
            </span>
          </div>
          <div className="event-grid admin-events">
            {data.events.map((event) => (
              <article className="event-card" key={event._id}>
                <div className="event-card-top">
                  <span className="icon-tile">
                    <CalendarDays size={21} />
                  </span>
                  <span className={`status-badge ${event.status}`}>
                    <span />
                    {event.status === 'active' ? 'Feedback open' : 'Closed'}
                  </span>
                </div>
                <h2>{event.title}</h2>
                <p>{event.description || 'No description added yet.'}</p>
                <div className="event-metadata">
                  <span>
                    <CalendarDays size={14} />
                    {formatDate(event.date)}
                  </span>
                  <span>
                    <MessageSquare size={14} />
                    {event.feedbackCount} responses
                  </span>
                </div>
                <div className="event-card-bottom">
                  <button className="text-link" onClick={() => open(event)}>
                    <Pencil size={14} />
                    Edit event
                  </button>
                  {event.status === 'active' && (
                    <Link className="text-link" to={`/feedback?event=${event._id}`}>
                      Feedback page
                      <ArrowUpRight size={14} />
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}
