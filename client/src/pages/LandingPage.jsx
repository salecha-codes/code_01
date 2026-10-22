import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  LockKeyhole,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { EmptyState, ErrorState, Loading } from '../components/ui/Common';
import { formatDate } from '../utils/format';
export default function LandingPage() {
  const { data, loading, error, reload } = useApi('/events');
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="label-pill">
            <span className="live-dot" />A little feedback. A better community.
          </span>
          <h1>
            Every voice
            <br />
            moves us <span>forward.</span>
          </h1>
          <p>
            Great events start with listening. Share what worked, what didn’t, and what could be
            better — anonymously.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/feedback">
              Share your feedback
              <ArrowRight size={18} />
            </Link>
            <a className="button secondary" href="#how-it-works">
              How it works
            </a>
          </div>
          <div className="hero-reassurance">
            <span>
              <Check size={14} />
              No account needed
            </span>
            <span>
              <Check size={14} />
              Takes about a minute
            </span>
          </div>
        </div>
        <div className="voice-art" aria-label="Your feedback helps shape the next event">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="floating-label">
            <ShieldCheck size={15} />
            Anonymous by design
          </div>
          <div className="voice-card">
            <div className="voice-card-top">
              <span className="icon-tile">
                <MessageSquare size={22} />
              </span>
              <span>YOUR VOICE MATTERS</span>
              <Sparkles size={18} />
            </div>
            <h2>
              Make the next
              <br />
              event even better.
            </h2>
            <div className="voice-lines">
              <span />
              <span />
              <span />
            </div>
            <div className="voice-card-bottom">
              <span className="anonymous-avatar">
                <LockKeyhole size={16} />
              </span>
              <div>
                <strong>A voice in our community</strong>
                <p>No name needed.</p>
              </div>
              <span className="tiny-dot" />
            </div>
          </div>
          <div className="art-note">
            <ChartNoAxesCombined size={20} />
            <div>
              <strong>Small insights. Real impact.</strong>
              <span>Help your club learn and grow.</span>
            </div>
          </div>
        </div>
      </section>
      <section className="principles" id="how-it-works">
        {[
          [ShieldCheck, 'Safe to be honest', 'Your response has no student identity attached.'],
          [
            MessageSquare,
            'Simple to share',
            'Pick your event, rate it, and tell us what you think.',
          ],
          [
            ChartNoAxesCombined,
            'Made to make a difference',
            'Organizers turn your feedback into better experiences.',
          ],
        ].map(([Icon, title, description], index) => (
          <article key={title}>
            <span className="principle-number">0{index + 1}</span>
            <Icon size={21} />
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </section>
      <section className="open-events">
        <div className="section-title">
          <div>
            <p className="eyebrow">KEEP THE CONVERSATION GOING</p>
            <h2>Been to an event lately?</h2>
            <p>Find your event and let the organizers know how it went.</p>
          </div>
          <span className="label-pill">{data?.events.length ?? '—'} open for feedback</span>
        </div>
        {loading ? (
          <Loading label="Finding open events…" />
        ) : error ? (
          <ErrorState message={error} retry={reload} />
        ) : !data.events.length ? (
          <EmptyState
            title="The next conversation is coming"
            message="There are no events accepting feedback right now. Check back after your next club event."
          />
        ) : (
          <div className="event-grid">
            {data.events.slice(0, 6).map((event) => (
              <Link className="event-card" to={`/feedback?event=${event._id}`} key={event._id}>
                <div className="event-card-top">
                  <span className="icon-tile">
                    <CalendarDays size={21} />
                  </span>
                  <span className="status-badge active">
                    <span />
                    Feedback open
                  </span>
                </div>
                <h3>{event.title}</h3>
                <p>
                  {event.description || 'Share your experience and help shape what comes next.'}
                </p>
                <div className="event-card-bottom">
                  <span>{formatDate(event.date)}</span>
                  <span>
                    Share feedback
                    <ArrowUpRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <section className="privacy-note">
        <ShieldCheck size={20} />
        <p>
          We don’t ask for your name, email, or student ID. Please avoid sharing personal details in
          your comments. Hosting providers may still process network logs.
        </p>
      </section>
    </>
  );
}
