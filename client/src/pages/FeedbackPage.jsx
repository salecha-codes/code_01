import { useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LoaderCircle, LockKeyhole, ShieldCheck, Star } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { categories } from '../utils/format';
import { EmptyState, ErrorState, Loading } from '../components/ui/Common';
export default function FeedbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApi('/events');
  const [eventId, setEventId] = useState(params.get('event') || '');
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const submitting = useRef(false);
  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    if (!rating) {
      setSubmitError('Choose a rating from 1 to 5.');
      return;
    }
    if (comment.trim() && comment.trim().length < 3) {
      setSubmitError('Please use at least 3 characters for your comment.');
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
      setSubmitError(error.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="form-page">
      <Link className="back-link" to="/">
        <ArrowLeft size={15} />
        Back to home
      </Link>
      <div className="form-intro">
        <span className="label-pill">
          <LockKeyhole size={13} />
          No names. Just honest feedback.
        </span>
        <h1>How was your experience?</h1>
        <p>Your perspective helps us create events you’ll love.</p>
      </div>
      {loading ? (
        <Loading label="Loading events…" />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : !data.events.length ? (
        <EmptyState
          title="No events are open right now"
          message="Come back when your club opens feedback for an event."
        >
          <Link className="button secondary" to="/">
            Back home
          </Link>
        </EmptyState>
      ) : (
        <form className="panel feedback-form" onSubmit={submit}>
          <label htmlFor="event">
            Which event did you attend? <span className="required">*</span>
          </label>
          <select id="event" value={eventId} onChange={(e) => setEventId(e.target.value)} required>
            <option value="">Select a workshop or event</option>
            {data.events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title}
              </option>
            ))}
          </select>
          <fieldset className="rating-fieldset">
            <legend>
              Your overall experience <span className="required">*</span>
            </legend>
            <p className="field-hint">Select the rating that best reflects your experience.</p>
            <div className="rating-options">
              {['Not great', 'Could be better', 'It was okay', 'Really good', 'Loved it'].map(
                (label, index) => (
                  <label
                    className={`rating-option ${rating === index + 1 ? 'selected' : ''}`}
                    key={label}
                  >
                    <input
                      type="radio"
                      name="rating"
                      value={index + 1}
                      checked={rating === index + 1}
                      onChange={() => setRating(index + 1)}
                      required
                    />
                    <Star size={25} fill={rating === index + 1 ? 'currentColor' : 'none'} />
                    <strong>{index + 1}</strong>
                    <span>{label}</span>
                  </label>
                ),
              )}
            </div>
          </fieldset>
          <label htmlFor="category">
            What’s your feedback about? <span className="required">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <div className="label-row">
            <label htmlFor="comment">
              Tell us a little more <span className="optional">(optional)</span>
            </label>
            <span>{comment.length}/2000</span>
          </div>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={2000}
            rows={5}
            placeholder="What worked well? What could we do differently next time?"
            aria-describedby="comment-hint"
          />
          <p className="field-hint" id="comment-hint">
            Keep it constructive, and leave out names or personal details.
          </p>
          <fieldset className="recommend-fieldset">
            <legend>
              Would you recommend this event? <span className="optional">(optional)</span>
            </legend>
            <div className="segmented">
              {[
                ['yes', 'Yes, definitely'],
                ['no', 'Not this time'],
              ].map(([value, label]) => (
                <label className={recommend === value ? 'selected' : ''} key={value}>
                  <input
                    type="radio"
                    name="recommend"
                    checked={recommend === value}
                    onChange={() => setRecommend(value)}
                  />
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
          {submitError && (
            <p className="form-error" role="alert">
              {submitError}
            </p>
          )}
          <div className="form-submit">
            <span>
              <ShieldCheck size={15} />
              Submitted anonymously
            </span>
            <button className="button primary" disabled={busy}>
              {busy ? <LoaderCircle size={17} className="spin" /> : <ArrowRight size={17} />}{' '}
              {busy ? 'Submitting…' : 'Submit feedback'}
            </button>
          </div>
        </form>
      )}
      <p className="form-footnote">
        Your feedback is visible only to authorized club administrators.
      </p>
    </div>
  );
}
