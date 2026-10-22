# Deployment guide — approval required

No deployment has been performed. These instructions make the proposed deployment reviewable. Do not create resources, activate paid services, publish the environment, or push source without the owner's approval. A free plan's availability and limits can change; stop if a provider requires payment.

## 1. Review the code and prepare the repository

From the repository root:

```bash
npm ci
npm test
npm run test:e2e
npm run build
npm run format:check
git status --short
git ls-files '*env*'
```

Only `.env.example` files should be tracked; inspect the list before approving a commit/push. Never include real environment values, test credentials, database files, or dependency folders. The original GitHub repository is `salecha-codes/code_01`; source changes are local until a push is explicitly approved.

## 2. MongoDB Atlas (after approval)

1. Sign in to your own Atlas account and use an eligible **free** cluster. Do not enable a paid cluster, backup add-on, or upgrade.
2. Create an application database user with `readWrite` access to the `clubpulse` database, not broad project administration privileges. Use a generated password.
3. Configure Atlas network access for the actual API service's outbound addresses. Render lists these for the service/region. Allow your current local address temporarily only if you initialize the admin from your machine, then remove that temporary entry.
4. Do not use unrestricted `0.0.0.0/0` as the documented default. Do not open the local MongoDB helper to the network.
5. Put the connection string, including the `clubpulse` database name, into the backend's secure `MONGODB_URI` setting. Percent-encode special characters in credentials using the provider's guidance. Preserve TLS certificate verification.

Example **placeholder only**:

```text
mongodb+srv://<username>:<password>@<cluster-host>/clubpulse?retryWrites=true&w=majority
```

The frontend must never receive this value. Enter secrets only through provider settings or a local ignored environment file, never through chat or committed source.

## 3. Render API (after approval)

Use `render.yaml` as a reviewable template or configure a Node web service manually:

| Setting        | Value                                  |
| -------------- | -------------------------------------- |
| Repository     | The approved source repository/branch  |
| Root directory | Repository root (leave blank)          |
| Runtime        | Node 24                                |
| Plan           | Free only, if available                |
| Build command  | `npm ci --omit=dev --workspace server` |
| Start command  | `npm start --workspace server`         |
| Health path    | `/api/health`                          |

Environment:

```text
NODE_ENV=production
MONGODB_URI=<enter securely>
JWT_SECRET=<strong generated random secret, at least 32 characters>
CLIENT_ORIGIN=https://<your-production-frontend-host>
COOKIE_SAME_SITE=lax
```

Render sets `PORT`. Do not bind MongoDB on the Render instance; the API connects to authenticated Atlas. Set the exact frontend origin when it is known; HTTPS is required and trailing slashes are rejected.

The API trusts one reverse-proxy hop, matching the intended Render setup. If the deployment architecture changes, verify forwarding behavior before modifying that setting. Do not set `trust proxy` to unrestricted `true`. With a Vercel proxy in front, the network-based limiter may identify shared proxy egress addresses; verify behavior and keep this demo on one API instance.

The free service may sleep while idle and take time to start. A slow cold start should show an honest loading/error state in the UI. Recheck `/api/health` before diagnosing credentials.

## 4. Initialize the admin securely

The application has no public registration. On a trusted machine, configure the ignored `server/.env` with the Atlas URI and your chosen `ADMIN_EMAIL`/`ADMIN_PASSWORD`, then run:

```bash
npm ci
npm run admin:create
```

Alternatively run the script through an approved provider shell if that feature is available without a paid upgrade. Do not add an unauthenticated setup route or seed an admin automatically at every server startup.

The command is idempotent for an existing email and does not replace its password. Remove `ADMIN_PASSWORD` after saving it securely. Remove temporary Atlas IP access when initialization is done. Create real events through the dashboard; the optional sample-event script adds no feedback.

## 5. Vercel frontend (after approval)

1. Replace the explicit `REPLACE-WITH-YOUR-SERVICE` placeholder in `vercel.json` with the **actual approved Render hostname**. This is a public hostname, not a secret.
2. Import the approved GitHub repository. Keep the project root at the repository root.
3. Use `npm ci` to install, `npm run build` to build, and `client/dist` as the output directory. `vercel.json` declares these values.
4. Set public `VITE_API_BASE_URL=/api` or leave it unset. Do not set MongoDB/admin/JWT secrets on the frontend.
5. Set Render's `CLIENT_ORIGIN` to the exact Vercel production origin. If using a custom domain, use the actual browser-facing origin. Avoid adding every random preview origin to the trusted list.
6. Confirm the `/api/:path*` rewrite forwards to Render before the SPA fallback. Static routes such as `/admin/feedback` should load the React app on a fresh page navigation.

The browser talks to Vercel on one origin. Vercel forwards requests and cookies to Render. The cookie has no Domain attribute and uses `/api` as its path, so the browser should keep it on the frontend origin. Verify this behavior after deployment; forwarding is a platform behavior, not something local tests can prove.

A direct Vercel-to-Render browser connection is an alternative, but requires all of the following: the exact Vercel origin in CORS, credentials enabled, HTTPS, `COOKIE_SAME_SITE=none`, trusted Origin checks, the existing CSRF header flow, and an adjusted frontend CSP `connect-src`. Browsers that block third-party cookies can still reject this arrangement. Prefer the proxy template.

## 6. Verify the approved deployment

Use a new browser session, not a previously authenticated local tab:

1. Open the frontend and confirm events come from the production API.
2. Confirm `/api/health` through the frontend rewrite reports a connected database.
3. Submit one clearly identified demonstration response without logging in. Verify MongoDB persistence through the admin workspace.
4. Verify incorrect credentials fail; correct credentials create an HttpOnly, Secure cookie with the expected SameSite and `/api` path.
5. Refresh `/admin` to check session restoration. Directly navigate to `/admin/feedback` to check SPA routing.
6. Filter by event, rating, category, and date together; confirm the recorded response is found.
7. Check count, average, distribution, and positive percentage against the actual records.
8. Close an event and confirm it disappears from public choices; a stale form submission must return 409.
9. Log out. Reopening a protected route must require login; the old cookie must not authorize requests.
10. Repeat the public form and navigation on a phone. Check network requests for CORS/cookie failures and inspect the browser console.
11. Verify secrets are absent from the frontend bundle and Git history. Remove any temporary Atlas network entry.

Record real deployment URLs and the observed results in `docs/VERIFICATION.md` only after these checks. The current repository intentionally contains no fabricated live links.

## Troubleshooting

- **API 503 / startup failure:** check Atlas user privileges, URI database name, the service's outbound addresses in the Atlas access list, and `/api/health`. Do not disable TLS verification.
- **Origin rejected (403):** compare the actual browser Origin to `CLIENT_ORIGIN`; HTTPS, hostname, and port must match exactly.
- **Login works but subsequent requests return 401:** inspect `Set-Cookie`, the proxy path, Secure/SameSite flags, cookie forwarding, and whether another login invalidated the one-session admin token.
- **CSRF rejected (403):** refresh the session via `/auth/me`; authenticated mutations need its current `X-CSRF-Token`.
- **Feedback 409:** event feedback has been closed. Reopen it intentionally from the admin events page if appropriate.
- **Rate limit 429:** wait for the 15-minute window; shared Wi-Fi/proxy addresses can share a limit. Do not disable protections merely to hide the issue.
- **Atlas connection from the cloud coding environment:** raw MongoDB TCP/SRV connectivity may require separate environment support. The local verified MongoDB workflow does not prove Atlas connectivity from this environment.
