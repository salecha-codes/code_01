import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function SuccessPage() {
  return (
    <section className="success-page">
      <span className="success-icon">
        <Check size={36} />
      </span>
      <p className="eyebrow">A LITTLE HONESTY GOES A LONG WAY</p>
      <h1>Thanks for speaking up.</h1>
      <p>
        Your feedback has been submitted anonymously.
        <br />
        You’ve helped make the next event a little better.
      </p>
      <span className="label-pill">
        <ShieldCheck size={15} />
        Your response has no student identity attached.
      </span>
      <Link className="button primary" to="/">
        Back to home
        <ArrowRight size={17} />
      </Link>
    </section>
  );
}
