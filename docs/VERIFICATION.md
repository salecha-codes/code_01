# Verification record

Verified locally on 22 October 2026. This record distinguishes running behavior from deployment plans.

## Results

| Check                                                 | Observed result                                                                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Backend integration suite (`npm test`)                | 18 passed, 0 failed, 0 skipped; real MongoDB 7.0.24                                                                                              |
| Browser suite (`npm run test:e2e`)                    | 5 passed; Chromium with an isolated real database/API/frontend                                                                                   |
| Frontend production build (`npm run build`)           | Passed; dashboard/chart code is loaded separately                                                                                                |
| Production dependency audit (`npm audit --omit=dev`)  | 0 reported vulnerabilities at verification time; this is not a guarantee of security                                                             |
| API/database readiness                                | `/api/health` returned 200 with `database: connected`                                                                                            |
| Local database network exposure                       | Listener verified at `127.0.0.1:27017`, not a public interface                                                                                   |
| Setup repeatability                                   | `scripts/setup-cloud.sh` completed with the retained verified binary and frozen npm lockfile                                                     |
| Admin/event initialization repeatability              | Re-running left one admin, two sample events, and zero feedback; no duplicate events or password replacement                                     |
| MongoDB restart                                       | Graceful stop/start preserved the same local records; API health recovered                                                                       |
| Source privacy check                                  | Real `server/.env`, build output, and node_modules are ignored; local secret values were checked against source candidates without printing them |
| Atlas / Render / Vercel deployment                    | Not performed; pending approval and secure provider configuration                                                                                |
| Repository push/publication                           | Initial application pushed with approval as `5f9f3e0`; owner approved publication of this redesign revision                                      |
| Environment publication / restoration in a fresh task | Not performed; setup/startup instructions are saved as an unpublished draft                                                                      |

No paid services were created or activated. The temporary `fastdl.mongodb.org` allowlist addition was removed after using the already-allowed official registry distribution. There are no custom network-domain additions in the saved draft.

## What the API tests exercise

1. Public event listing exposes only active events.
2. All private read endpoints and event writes reject unauthenticated users.
3. Incorrect credentials, hostile origins, and missing Origin headers are rejected.
4. Valid login issues the HttpOnly cookie and CSRF token; `/auth/me` restores the session.
5. Empty analytics returns zero counts, null average, and a complete zero-filled 30-day series.
6. A public submission creates a MongoDB record without identity fields; the response does not expose its ID.
7. Invalid ratings, IDs, categories, recommendation types, and unexpected identity fields fail validation.
8. Closed and nonexistent events reject submissions.
9. The feedback limiter rejects requests beyond its window allowance.
10. Event/rating filters work individually and combine with category/date/literal text search; pagination works.
11. Bad query parameters, arrays, impossible dates, and reversed ranges return 400.
12. Known ratings 5, 4, 1, and 2 produce total 4, mean 3, and 50% positive; event counts and distribution agree.
13. Admin event creation/editing/closure and associated feedback counts work; missing CSRF is rejected.
14. Invalid JSON and oversized bodies receive safe errors.
15. Expired or tampered JWTs fail authentication.
16. Logging out invalidates a copied cookie on the server.
17. Production configuration sets Secure/SameSite=None when requested and restricts credentialed CORS to the exact configured origin.
18. Weak JWT secrets and invalid production origins are rejected by configuration validation.

Tests use real `mongod` processes, not mocked MongoDB responses. Their temporary fixtures are separate from the persistent demonstration database.

## What the browser tests exercise

- A protected URL redirects an unauthenticated visitor to login.
- Incorrect credentials produce an error; correct credentials work; password visibility controls work.
- A new workspace shows the real zero-response state; refresh restores a valid session.
- A separate fresh visitor context submits an anonymous response on a 390-pixel screen.
- The admin dashboard then shows one response, average 5.0, 100% positive, and the submitted comment; chart accessibility labels reflect the real distribution.
- Combined feedback filters find the response; a non-matching filter shows the empty state; clearing filters restores results.
- Mobile navigation opens and closes, an event is created and then closed, and logout blocks private access.
- Public landing, feedback, login, and all three admin pages have no horizontal document overflow at widths 360, 390, 768, 1024, and 1440.
- The public form contains no student name/email/phone/registration fields.
- The complete interactive flow produces no uncaught browser JavaScript errors.

Additional redesign checks passed:

- The landing starter carries its actual event and rating into the form; arrow keys select ratings and categories.
- Mobile public navigation and event dialogs keep Tab focus inside, close with Escape, and restore the initiating control. Event dialogs focus the title input initially.
- Open/closed event views show the real respective records; event response links apply the matching server-side filter.
- A failed event update preserves the edited title, displays an error, and saves successfully after recovery.
- A short comment is rejected, failed submission preserves values, and a repeated click during submission creates only one successful request.
- A second real submission changes the dashboard to two responses and an average of 4.5; long event names remain intact.
- The activity data table contains 30 days; the positive-rating explanation supports keyboard focus and Escape.
- Date filters, individual filter removal, clear-all, and disabled pagination boundaries work. Multi-page query behavior is covered by the API suite.
- Mobile cards expose category, recommendation, full comments, and expand/collapse state at all applicable widths.
- Delayed, failed, and empty event responses show meaningful states and recover. Only these explicit transport-state tests intercept responses; successful workflows use the actual API/MongoDB.
- Reduced-motion mode was exercised in Chromium.

Screenshots under `docs/screenshots` were captured from these working interfaces. The overview/mobile form use temporary, labeled browser-test data, including two responses actually submitted through the UI. The persistent development database still has zero feedback; no fake analytics was added to it.

## Redesign scope

The React pages, shared presentation components, CSS, browser tests, and documentation changed. Backend routes/controllers, database schemas, API client, authentication context, environment files, and dependency manifests did not change. No new service, network permission, credential, or deployment was needed. See [DESIGN.md](DESIGN.md) for the file map and local preview instructions.

## Diagnosed issues resolved during development

- The normal MongoDB download host was blocked by network policy. We used the official MongoDB image's binary from already-allowed distribution services and verified its digest before execution.
- One initial integration test found that an unknown filter parameter was ignored. The API now allowlists query names and rejects unsupported parameters. All 18 tests pass after the fix.
- The initial frontend bundle eagerly included Recharts. The dashboard is now lazy-loaded, and the production build completes without the original large-chunk warning.
- Default chart animation briefly displayed intermediate bar positions in captured screenshots. Chart animation is now disabled, so displayed bars immediately represent actual results.

- Redesign keyboard checks found that native dialog behavior alone allowed Tab to reach browser chrome and did not apply React's autofocus on reopening. Explicit focus wrapping and an initial-focus marker fixed both; the checks then passed.
- Visual review found joined words where a desktop line break was hidden on mobile, and an offscreen skip link captured in a full-page screenshot. Responsive whitespace and clipped hidden-link styling corrected these issues.

## MongoDB binary provenance

The local helper runs MongoDB **7.0.24**, extracted from the official Docker Library `mongo:7.0.24` Linux/amd64 distribution. Docker is not used as an application service or runtime.

```text
Manifest SHA-256:
e9d31be73d55a03ffd4434a3dd75d9357bc6bd32f788e9bb3d1e5c39fb2b148b

Binary layer SHA-256:
7e0c5d7b3228f784467663a56ccc63a190e46b14e5be0ed6a37efc7d2a003ce0

Extracted mongod SHA-256:
f7a83a69c86654e690919d207a85b24098f98815e99f1767daff4d6b1acc297b
```

The layer size/hash and manifest hash were verified over HTTPS with normal TLS verification. The executable version was checked before use. `scripts/setup-cloud.sh` preserves these checks and refuses to use a conflicting existing binary. No artifact checksum or TLS validation was disabled.

## Limits of this evidence

- A passing local suite does not verify Atlas connectivity, Render/Vercel configuration, or cookies on actual deployed domains. Use the deployment checklist after explicit approval.
- Cookie flags are checked by API tests and the first-party cookie flow is exercised locally. Third-party-cookie behavior across production origins remains untested.
- No load testing, penetration test, formal accessibility audit, Firefox test, or Safari test was performed.
- Application-level anonymity does not promise anonymity from network/hosting logs or self-identifying comments.
- In-memory rate limiting resets on restart and is not shared across API instances. Event closure and feedback insertion are not in a multi-document transaction.
- The bootstrap script's retained-binary path was exercised end to end. Its download/extraction operations and pinned manifest verification were also exercised during initial provisioning; a completely fresh cloud-task restore remains unverified.
