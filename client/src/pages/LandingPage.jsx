import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  LockKeyhole,
  MessageSquare,
  ShieldCheck,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Select,
  Skeleton,
} from '../components/ui/Common';
import { formatDate } from '../utils/format';
function FeedbackStarter({ events }) {
  const navigate = useNavigate();
  const [choice, setChoice] = useState('');
  const [rating, setRating] = useState(0);
  const selected = events.find((event) => event._id === choice) || events[0];
  function start(event) {
    event.preventDefault();
    if (selected) navigate(`/feedback?event=${selected._id}${rating ? `&rating=${rating}` : ''}`);
  }
  return (
    <Card className="hero-product">
      <div className="product-topline">
        <span className="product-mark">
          <MessageSquare size={17} />
        </span>
        <span>Anonymous feedback</span>
        <LockKeyhole size={14} />
      </div>
      {selected ? (
        <form onSubmit={start}>
          <div className="product-heading">
            <span className="eyebrow">YOUR EXPERIENCE MATTERS</span>
            <h2>Let’s make the next one better.</h2>
            <p>Start with an event you attended.</p>
          </div>
          <Field id="starter-event" label="Your event">
            <Select
              id="starter-event"
              value={selected._id}
              onChange={(event) => setChoice(event.target.value)}
            >
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </Select>
          </Field>
          <p className="product-event-date">
            <CalendarDays size={14} />
            {formatDate(selected.date)}
          </p>
          <fieldset className="starter-rating">
            <legend>How was your experience?</legend>
            <div>
              {[1, 2, 3, 4, 5].map((value) => (
                <label className={rating === value ? 'selected' : ''} key={value}>
                  <input
                    type="radio"
                    name="starter-rating"
                    value={value}
                    checked={rating === value}
                    onChange={() => setRating(value)}
                    aria-label={`${value} out of 5`}
                  />
                  <Star size={21} fill={rating >= value ? 'currentColor' : 'none'} />
                  <span>{value}</span>
                </label>
              ))}
            </div>
            <div className="rating-endpoints">
              <span>Could be better</span>
              <span>Excellent</span>
            </div>
          </fieldset>
          <Button type="submit" className="full-width">
            Continue to feedback
            <ArrowRight size={16} />
          </Button>
          <p className="product-privacy">
            <ShieldCheck size={13} />
            No account. No name attached.
          </p>
        </form>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="Your next event starts a conversation"
          message="When your club opens an event, you can share your experience here."
        />
      )}
      <div className="product-bottomline">
        <span className="status-dot" />A space for honest perspectives.
      </div>
    </Card>
  );
}
export default function LandingPage() {
  const { data, loading, error, reload } = useApi('/events');
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-dash" />A VOICE FOR EVERY PARTICIPANT
          </p>
          <h1>
            Better events start with <span>honest feedback.</span>
          </h1>
          <p>
            Give your community a voice. Understand what matters, learn from every experience, and
            make the next event better.
          </p>
          <div className="hero-actions">
            <Button to="/feedback">
              Give feedback
              <ArrowUpRight size={17} />
            </Button>
            <Button variant="ghost" href="#how-it-works">
              Explore how it works
              <ArrowRight size={16} />
            </Button>
          </div>
          <div className="hero-reassurance">
            <span>
              <Check size={14} />
              No sign-up
            </span>
            <span>
              <Check size={14} />
              Anonymous by design
            </span>
            <span>
              <Check size={14} />
              About a minute
            </span>
          </div>
        </div>
        <div className="hero-product-wrap">
          {loading ? (
            <Card className="hero-product">
              <Skeleton count={3} label="Loading available events…" />
            </Card>
          ) : error ? (
            <Card className="hero-product">
              <ErrorState message={error} retry={reload} />
            </Card>
          ) : (
            <FeedbackStarter events={data.events} />
          )}
          <span className="product-caption">
            <span />
            Less friction. More honest conversations.
          </span>
        </div>
      </section>
      <section className="value-section" aria-labelledby="value-title">
        <div className="value-intro">
          <p className="eyebrow">THE DIFFERENCE IS LISTENING</p>
          <h2 id="value-title">
            Small perspectives. <br />
            Meaningful improvements.
          </h2>
        </div>
        <div className="value-grid">
          {[
            [
              ShieldCheck,
              'Room for honesty',
              'No student profiles or names attached. A little privacy makes space for a more honest conversation.',
            ],
            [
              ChartNoAxesCombined,
              'Insight, not guesswork',
              'Ratings and event trends help organizers see what’s working and where to focus next.',
            ],
            [
              SlidersHorizontal,
              'Every response in focus',
              'Find feedback by event, rating, or topic. Spend less time sorting and more time improving.',
            ],
          ].map(([Icon, title, description]) => (
            <article key={title}>
              <Icon size={21} />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="workflow-section" id="how-it-works" aria-labelledby="workflow-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">HOW CLUBPULSE WORKS</p>
            <h2 id="workflow-title">One minute. A lasting difference.</h2>
          </div>
          <p>Good feedback doesn’t need to be complicated.</p>
        </div>
        <ol className="workflow-list">
          {[
            ['01', 'Choose your event', 'Find the workshop, session, or gathering you attended.'],
            ['02', 'Share your perspective', 'Leave a rating and tell us what made an impression.'],
            [
              '03',
              'Shape what comes next',
              'Your organizers turn feedback into better experiences.',
            ],
          ].map(([number, title, description]) => (
            <li key={number}>
              <span className="workflow-number">{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="open-events" aria-labelledby="events-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">KEEP THE CONVERSATION GOING</p>
            <h2 id="events-title">Your experience is still fresh.</h2>
            <p>Find your event and let the organizers know how it went.</p>
          </div>
          {data && (
            <Badge dot tone="success">
              {data.events.length} open for feedback
            </Badge>
          )}
        </div>
        {loading ? (
          <Skeleton count={2} label="Loading open events…" />
        ) : error ? (
          <ErrorState message={error} retry={reload} />
        ) : !data.events.length ? (
          <Card>
            <EmptyState
              icon={CalendarDays}
              title="More conversations are on the way"
              message="No events are accepting feedback right now. Check back after your next club event."
            />
          </Card>
        ) : (
          <div className="public-event-list">
            {data.events.map((event) => (
              <Link
                className="public-event-row"
                to={`/feedback?event=${event._id}`}
                key={event._id}
              >
                <div className="event-date-tile">
                  <span>
                    {new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(
                      new Date(event.date),
                    )}
                  </span>
                  <strong>{new Date(event.date).getUTCDate()}</strong>
                </div>
                <div className="public-event-details">
                  <h3>{event.title}</h3>
                  <p>
                    {event.description ||
                      'Share your perspective and help shape the next experience.'}
                  </p>
                  <span>{formatDate(event.date)}</span>
                </div>
                <span className="event-row-action">
                  Give feedback
                  <ArrowUpRight size={17} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
      <section className="closing-cta">
        <span className="closing-icon">
          <MessageSquare size={25} />
        </span>
        <div>
          <h2>Your perspective makes a difference.</h2>
          <p>A good experience is worth sharing. So is an idea to make it better.</p>
        </div>
        <Button to="/feedback">
          Share your feedback
          <ArrowRight size={17} />
        </Button>
      </section>
      <div className="privacy-note">
        <ShieldCheck size={18} />
        <p>
          We don’t ask for your name, email, or student ID. Leave personal details out of comments.
          Hosting providers may still process network logs.
        </p>
      </div>
    </>
  );
}
