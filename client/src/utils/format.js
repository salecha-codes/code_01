export const categories = [
  'Content Quality',
  'Speaker/Instructor',
  'Organization',
  'Venue/Facilities',
  'Overall Experience',
];
export const formatDate = (value) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
export const shortDate = (value) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(value),
  );
