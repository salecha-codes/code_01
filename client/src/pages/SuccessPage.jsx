import { ArrowRight, Check, MessageSquare, ShieldCheck } from 'lucide-react';
import { Badge, Button } from '../components/ui/Common';
export default function SuccessPage() {
  return (
    <section className="success-page">
      <div className="success-visual" aria-hidden="true">
        <MessageSquare size={39} strokeWidth={1.3} />
        <span>
          <Check size={17} />
        </span>
      </div>
      <p className="eyebrow">YOUR PERSPECTIVE MAKES A DIFFERENCE</p>
      <h1>
        Thanks for making
        <br />
        things better.
      </h1>
      <p>
        Your feedback has been submitted anonymously.
        <br />A better next event starts with moments like this.
      </p>
      <Badge tone="success">
        <ShieldCheck size={14} />
        No student identity attached
      </Badge>
      <Button to="/">
        Back to home
        <ArrowRight size={16} />
      </Button>
      <span className="success-note">Your organizers will take it from here.</span>
    </section>
  );
}
