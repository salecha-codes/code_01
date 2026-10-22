import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  LockKeyhole,
  ShieldCheck,
  Star,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { categories, formatDate } from '../utils/format';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Select,
  Skeleton,
  StepLabel,
  Textarea,
} from '../components/ui/Common';
const ratingLabels = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
export default function FeedbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApi('/events');
  const [eventId, setEventId] = useState(params.get('event') || '');
  const initialRating = Number(params.get('rating'));
  const [rating, setRating] = useState(
    Number.isInteger(initialRating) && initialRating >= 1 && initialRating <= 5 ? initialRating : 0,
  );
  const [hovered, setHovered] = useState(0);
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const submitting = useRef(false);
  const errorRef = useRef(null);
  const selectedEvent = data?.events.find((event) => event._id === eventId);
  function showError(message) {
    setSubmitError(message);
    requestAnimationFrame(() => errorRef.current?.focus());
  }
  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    if (!rating) {
      showError('Choose a rating from 1 to 5.');
      return;
    }
    if (comment.trim() && comment.trim().length < 3) {
      showError('Please use at least 3 characters for your comment.');
      return;
    }
    submitting.current = true;
    setBusy(true);
    setSubmitError('');
    try {
      await api('/feedback', {
        method: 'POST',
        body: {
          eventId,
          rating,
          category,
          comment: comment.trim(),
          ...(recommend ? { wouldRecommend: recommend === 'yes' } : {}),
        },
      });
      navigate('/feedback/success', { replace: true });
    } catch (error) {
      showError(error.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="feedback-page">
      <aside className="feedback-intro">
        <Link className="back-link" to="/">
          <ArrowLeft size={15} />
          Back to home
        </Link>
        <Badge>
          <LockKeyhole size={13} />A space to be honest
        </Badge>
        <h1>
          Good experiences <br />
          start with <span>your voice.</span>
        </h1>
        <p>
          What worked? What could be better? <br />
          Help your club make the next one count.
        </p>
        <ol className="feedback-steps">
          <li>
            <StepLabel number="1" title="Choose your event" complete={Boolean(selectedEvent)} />
          </li>
          <li>
            <StepLabel
              number="2"
              title="Rate your experience"
              complete={Boolean(rating && category)}
            />
          </li>
          <li>
            <StepLabel
              number="3"
              title="Share your perspective"
              complete={Boolean(comment.trim() || recommend)}
            />
          </li>
        </ol>
        <div className="feedback-assurance">
          <ShieldCheck size={20} />
          <h2>Honest. Constructive. Anonymous.</h2>
          <p>
            Your response has no student identity attached and is visible only to authorized
            organizers.
          </p>
          <p>Please leave names and personal details out of your comments.</p>
        </div>
      </aside>
      <div className="feedback-main">
        {loading ? (
          <Card className="feedback-form">
            <Skeleton count={4} label="Loading events…" />
          </Card>
        ) : error ? (
          <Card>
            <ErrorState message={error} retry={reload} />
          </Card>
        ) : !data.events.length ? (
          <Card>
            <EmptyState
              icon={CalendarDays}
              title="No events are open right now"
              message="Come back when your club opens feedback for an event."
            >
              <Button variant="secondary" to="/">
                Back to home
              </Button>
            </EmptyState>
          </Card>
        ) : (
          <Card as="form" className="feedback-form" onSubmit={submit} aria-busy={busy}>
            <header className="form-heading">
              <div>
                <p className="eyebrow">ANONYMOUS FEEDBACK</p>
                <h2>How was your experience?</h2>
              </div>
              <span className="form-time">About 1 minute</span>
            </header>
            <div className="form-section">
              <div className="form-section-heading">
                <span>01</span>
                <h3>The event</h3>
              </div>
              <Field id="event" label="Which event did you attend?" required>
                <Select
                  id="event"
                  value={eventId}
                  onChange={(event) => setEventId(event.target.value)}
                  required
                >
                  <option value="">Select a workshop or event</option>
                  {data.events.map((event) => (
                    <option value={event._id} key={event._id}>
                      {event.title}
                    </option>
                  ))}
                </Select>
              </Field>
              {selectedEvent && (
                <div className="selected-event">
                  <span>
                    <CalendarDays size={14} />
                    {formatDate(selectedEvent.date)}
                  </span>
                  {selectedEvent.description && <p>{selectedEvent.description}</p>}
                </div>
              )}
            </div>
            <div className="form-section">
              <div className="form-section-heading">
                <span>02</span>
                <h3>Your experience</h3>
              </div>
              <fieldset className="rating-fieldset">
                <legend>
                  Your overall experience <span className="required">*</span>
                </legend>
                <p className="field-hint">Choose the rating that feels right to you.</p>
                <div className="rating-options" onMouseLeave={() => setHovered(0)}>
                  {ratingLabels.map((label, index) => (
                    <label
                      className={`rating-option ${rating === index + 1 ? 'selected' : ''} ${(hovered || rating) >= index + 1 ? 'highlighted' : ''}`}
                      key={label}
                      onMouseEnter={() => setHovered(index + 1)}
                    >
                      <input
                        type="radio"
                        name="rating"
                        value={index + 1}
                        checked={rating === index + 1}
                        onChange={() => setRating(index + 1)}
                        required
                      />
                      <Star
                        size={25}
                        fill={(hovered || rating) >= index + 1 ? 'currentColor' : 'none'}
                      />
                      <strong>{index + 1}</strong>
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="category-fieldset">
                <legend>
                  What’s your feedback about? <span className="required">*</span>
                </legend>
                <div className="category-options">
                  {categories.map((value) => (
                    <label className={category === value ? 'selected' : ''} key={value}>
                      <input
                        type="radio"
                        name="category"
                        value={value}
                        checked={category === value}
                        onChange={() => setCategory(value)}
                        required
                      />
                      <span className="category-radio">
                        {category === value && <Check size={10} />}
                      </span>
                      {value}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="form-section">
              <div className="form-section-heading">
                <span>03</span>
                <h3>A little more perspective</h3>
              </div>
              <div className="label-row">
                <label htmlFor="comment">
                  Tell us a little more <span className="optional">Optional</span>
                </label>
                <span>{comment.length.toLocaleString()}/2,000</span>
              </div>
              <Textarea
                id="comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={2000}
                rows={5}
                placeholder="The most useful part was… Next time, it would be great to…"
                aria-describedby="comment-hint"
              />
              <p className="field-hint" id="comment-hint">
                Be specific, be constructive, and leave out personal details.
              </p>
              <fieldset className="recommend-fieldset">
                <legend>
                  Would you recommend this event? <span className="optional">Optional</span>
                </legend>
                <div className="recommend-options">
                  {[
                    ['yes', 'Yes, definitely', ThumbsUp],
                    ['no', 'Not this time', ThumbsDown],
                  ].map(([value, label, Icon]) => (
                    <label className={recommend === value ? 'selected' : ''} key={value}>
                      <input
                        type="radio"
                        name="recommend"
                        value={value}
                        checked={recommend === value}
                        onChange={() => setRecommend(value)}
                      />
                      <Icon size={16} />
                      {label}
                    </label>
                  ))}
                  {recommend && (
                    <button className="text-link" type="button" onClick={() => setRecommend('')}>
                      Clear
                    </button>
                  )}
                </div>
              </fieldset>
            </div>
            {submitError && (
              <p className="form-error" role="alert" ref={errorRef} tabIndex={-1}>
                {submitError}
              </p>
            )}
            <div className="form-submit">
              <span>
                <ShieldCheck size={15} />
                Your voice. Your privacy.
              </span>
              <Button type="submit" loading={busy}>
                {busy ? 'Submitting…' : 'Submit feedback'}
                {!busy && <ArrowRight size={16} />}
              </Button>
            </div>
          </Card>
        )}
        <p className="form-footnote">
          Application-level anonymity. Hosting providers may still process network logs.
        </p>
      </div>
    </div>
  );
}
