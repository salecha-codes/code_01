# ClubPulse interface guide

The redesign changes presentation and interaction within the existing React application. Express endpoints, MongoDB models, authentication, cookies, CSRF handling, API client, and environment variables are unchanged. Every event, response count, rating, and chart value still comes from the API.

## Visual system

`client/src/styles.css` defines the shared tokens and responsive layouts. Inter is bundled locally, so the interface does not depend on a third-party font request. Lucide supplies interface icons. No dependencies were added.

| Purpose          | Color     |
| ---------------- | --------- |
| Page             | `#0B0D12` |
| Sidebar          | `#101319` |
| Card             | `#151922` |
| Elevated surface | `#1B202B` |
| Primary text     | `#F5F6FA` |
| Secondary text   | `#949CAA` |
| Border           | `#292F3B` |
| Accent           | `#8B7CF6` |
| Success          | `#35C79A` |
| Warning          | `#F2B75C` |
| Error            | `#EF6B73` |

A lighter accent is used for small text on dark surfaces. The primary button uses dark text on the accent background. Spacing follows a 4/8px rhythm. Most surfaces have 7–12px corners. Stronger type and generous section spacing establish hierarchy; color marks actions, selection, and meaningful status.

## What changed

- **Landing:** compact navigation, a real event/rating starter, three benefits, a three-step explanation, open-event rows, and a closing action. The starter carries the selected event and rating into the feedback form.
- **Feedback:** three numbered sections, event details, keyboard-selectable rating and category groups, character count, optional recommendation, preserved input after errors, and a focused success screen. Submission continues to use the existing API and duplicate-submit guard.
- **Login:** split introduction and sign-in layout, existing password visibility control, clear loading/error behavior, and the existing authenticated session.
- **Overview:** compact workspace sidebar, four real statistics, 30-day activity, descending rating bars, full event names in comparisons, recent perspectives, and useful zero-response states. There are no invented trends or growth figures.
- **Management:** server-side filters with removable active-filter chips, desktop response table and mobile response cards, full-comment expansion, existing pagination, event-status views, and create/edit dialogs. Event response counts link to feedback filtered for that event.

## Components and files

| File                                            | Responsibility                                                                                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `client/src/components/ui/Common.jsx`           | Buttons, inputs, selects, fields, badges, cards, semantic tables, dialogs, tabs, tooltips, metrics, and loading/error/empty states |
| `client/src/components/layout/PublicLayout.jsx` | Public navigation, mobile menu, footer                                                                                             |
| `client/src/components/layout/AdminLayout.jsx`  | Workspace sidebar, mobile drawer, current-page header, account/logout                                                              |
| `client/src/components/dashboard/Charts.jsx`    | Actual activity, rating distribution, event comparisons, and accessible chart data                                                 |
| `client/src/pages/LandingPage.jsx`              | Landing page and functional event/rating starter                                                                                   |
| `client/src/pages/FeedbackPage.jsx`             | Anonymous form                                                                                                                     |
| `client/src/pages/SuccessPage.jsx`              | Submission confirmation                                                                                                            |
| `client/src/pages/AdminLogin.jsx`               | Organizer login                                                                                                                    |
| `client/src/pages/Dashboard.jsx`                | Statistics and recent responses                                                                                                    |
| `client/src/pages/FeedbackManagement.jsx`       | Filters, response table/cards, pagination                                                                                          |
| `client/src/pages/EventsManagement.jsx`         | Event views and create/edit dialog                                                                                                 |
| `client/src/App.jsx`                            | Existing routes, page titles, and scroll/hash navigation                                                                           |
| `client/src/styles.css`                         | Design tokens, component styles, breakpoints, reduced-motion rules                                                                 |
| `tests/e2e/workflow.spec.js`                    | Five browser regression workflows against the actual API and isolated MongoDB                                                      |

The shared controls remain small React functions. Native selects preserve platform keyboard behavior. Tabs, ratings, and categories use native radio groups. `Table` preserves normal table semantics and an accessible caption instead of inventing a custom grid.

## Responsive and accessible behavior

- Checked at **1440, 1024, 768, 390, and 360px** with no horizontal document overflow on public and admin pages.
- The sidebar becomes a modal navigation drawer at 800px. Public navigation becomes a menu at 640px.
- Feedback rows become structured cards at 1180px, retaining event, rating, category, comment, recommendation, and date.
- Metric cards become a two-column grid; charts and event cards become single-column on phones.
- Dialogs use native `showModal`, an inert background, explicit Tab/Shift+Tab wrapping, Escape, focus restoration, and scroll locking. The event editor initially focuses its title input.
- Rating and category inputs support arrow keys. Focus remains visible. Submission errors receive focus and preserve entered values.
- Activity has a text summary and expandable table of all 30 UTC days. Event comparison retains full names. Distribution includes counts and percentages.
- CSS transitions and skeleton animations respect `prefers-reduced-motion`. Charts do not animate through misleading intermediate values.
- Keyboard behavior was checked in Chromium. This is not a formal accessibility audit or a Safari/Firefox verification.

## Preview the updated version

In the updated checkout, keep your existing ignored environment files and credentials. If the local database and development servers are already running, Vite will refresh the frontend changes.

Otherwise use separate terminals from the repository root:

```bash
# Terminal 1; skip if MongoDB is already listening locally
npm run dev:db
```

```bash
# Terminal 2
npm run dev
```

On your own computer, open the Vite address printed by the second command (port 5173). The backend uses port 5000. Sign in using your existing privately stored administrator credentials. The [README](../README.md#run-locally) covers first-time setup and secure account initialization.

This cloud environment's setup chat does not expose a browser preview or forward development ports. A server running here does not create a public website. Interactive access requires an updated local checkout or a coding workspace with port forwarding. Use a checkout containing this redesign; the earlier initial application commit does not include these changes. Source publication is approved, but deployment remains a separate step.

The [screenshots](screenshots) show the actual redesigned UI. They are visual references, not an interactive website. Browser-test events and responses exist only in the isolated test database; no feedback was seeded into the persistent development database.

See [VERIFICATION.md](VERIFICATION.md) for executed checks and limits. Atlas, Render, and Vercel deployment remains a separate, approval-dependent step.
