import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CalendarDays, MessageSquare, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDate } from '../utils/format';
import {
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  ErrorState,
  Field,
  Input,
  PageHeader,
  Select,
  Skeleton,
  Tabs,
  Textarea,
} from '../components/ui/Common';
const blank = { title: '', description: '', date: '', status: 'active' };
export default function EventsManagement() {
  const [params, setParams] = useSearchParams();
  const { data, loading, error, reload } = useApi('/admin/events');
  const [editing, setEditing] = useState(params.has('create') ? 'new' : null);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [status, setStatus] = useState('all');
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
        editing === 'new'
          ? 'Event created. You’re ready to hear from your community.'
          : 'Event updated.',
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
  const visible = data?.events.filter((event) => status === 'all' || event.status === status) || [];
  return (
    <>
      <PageHeader
        eyebrow="YOUR EVENTS"
        title="Great experiences start here."
        description="A space for every event. A conversation after every experience."
        action={
          <Button size="small" onClick={() => open()}>
            <Plus size={16} />
            Create event
          </Button>
        }
      />
      <Dialog
        open={Boolean(editing)}
        onClose={close}
        title={editing === 'new' ? 'Create an event' : 'Edit event'}
        description={
          editing === 'new'
            ? 'Give your participants a place to be heard.'
            : 'Update the details and manage feedback collection.'
        }
        busy={busy}
        closeLabel="Close event editor"
      >
        <form className="event-editor" onSubmit={save} aria-busy={busy}>
          <Field id="title" label="Event title" required>
            <Input
              data-dialog-autofocus
              id="title"
              name="title"
              value={form.title}
              onChange={change}
              minLength={3}
              maxLength={120}
              placeholder="e.g. Intro to Web Development"
              required
            />
          </Field>
          <Field id="description" label="Description" optional>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={change}
              rows={3}
              maxLength={1000}
              placeholder="A little context for your participants…"
            />
          </Field>
          <div className="editor-grid">
            <Field id="date" label="Event date" required>
              <Input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={change}
                required
              />
            </Field>
            <Field id="status" label="Feedback collection">
              <Select id="status" name="status" value={form.status} onChange={change}>
                <option value="active">Open for feedback</option>
                <option value="closed">Closed</option>
              </Select>
            </Field>
          </div>
          <div className="editor-note">
            <MessageSquare size={17} />
            <p>
              {form.status === 'active'
                ? 'Participants can submit feedback while this event is open.'
                : 'Participants can’t submit new feedback. Existing responses stay available.'}{' '}
              You control when collection closes; the date doesn’t close it automatically.
            </p>
          </div>
          {saveError && (
            <p className="form-error" role="alert">
              {saveError}
            </p>
          )}
          <div className="dialog-actions">
            <Button variant="secondary" onClick={close} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              {busy ? 'Saving…' : 'Save event'}
              {!busy && <ArrowRight size={15} />}
            </Button>
          </div>
        </form>
      </Dialog>
      {loading ? (
        <Skeleton kind="cards" count={4} label="Loading your events…" />
      ) : error ? (
        <Card>
          <ErrorState message={error} retry={reload} />
        </Card>
      ) : (
        <>
          <div className="events-toolbar">
            <Tabs
              label="Filter events by feedback status"
              value={status}
              onChange={setStatus}
              options={[
                { value: 'all', label: 'All events', count: data.events.length },
                {
                  value: 'active',
                  label: 'Open',
                  count: data.events.filter((event) => event.status === 'active').length,
                },
                {
                  value: 'closed',
                  label: 'Closed',
                  count: data.events.filter((event) => event.status === 'closed').length,
                },
              ]}
            />
            <span>
              {visible.length} {visible.length === 1 ? 'event' : 'events'}
            </span>
          </div>
          {!visible.length ? (
            <Card>
              <EmptyState
                icon={CalendarDays}
                title={
                  data.events.length
                    ? 'No events in this view'
                    : 'Your next great event starts here'
                }
                message={
                  data.events.length
                    ? 'Try another status to find your event.'
                    : 'Create your first event, then share its feedback page with your participants.'
                }
              >
                {data.events.length ? (
                  <Button variant="secondary" size="small" onClick={() => setStatus('all')}>
                    View all events
                  </Button>
                ) : (
                  <Button size="small" onClick={() => open()}>
                    <Plus size={15} />
                    Create your first event
                  </Button>
                )}
              </EmptyState>
            </Card>
          ) : (
            <div className="event-grid admin-events">
              {visible.map((event) => (
                <Card as="article" className="event-card" key={event._id}>
                  <div className="event-card-top">
                    <div className="event-date-tile">
                      <span>
                        {new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(
                          new Date(event.date),
                        )}
                      </span>
                      <strong>{new Date(event.date).getUTCDate()}</strong>
                    </div>
                    <Badge dot tone={event.status === 'active' ? 'success' : 'neutral'}>
                      {event.status === 'active' ? 'Feedback open' : 'Closed'}
                    </Badge>
                  </div>
                  <h2>{event.title}</h2>
                  <p>
                    {event.description ||
                      'Add a description to give your participants a little context.'}
                  </p>
                  <div className="event-metadata">
                    <span>
                      <CalendarDays size={14} />
                      {formatDate(event.date)}
                    </span>
                    <Link to={`/admin/feedback?eventId=${event._id}`}>
                      <MessageSquare size={14} />
                      {event.feedbackCount} {event.feedbackCount === 1 ? 'response' : 'responses'}
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                  <div className="event-card-bottom">
                    <Button variant="secondary" size="small" onClick={() => open(event)}>
                      <Pencil size={14} />
                      Edit event
                    </Button>
                    {event.status === 'active' && (
                      <Link className="text-link" to={`/feedback?event=${event._id}`}>
                        Feedback page
                        <ArrowUpRight size={15} />
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
