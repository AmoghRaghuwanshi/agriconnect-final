# AgriConnect Master Engineering Audit

Audit date: 2026-05-08
Audited target: `D:\agriplans\AgriConnect-Plans_new`
Auditor mode: inspection, testing, analysis, documentation only
Code modifications to audited target: none

## 1. Executive Summary

This audit found that the requested target is not a runnable application. The folder `D:\agriplans\AgriConnect-Plans_new` contains planning and architecture Markdown files only. There is no `package.json`, no `app/`, no `lib/`, no tests, no Git metadata, and no executable frontend or backend source code in the audited path.

Because of that, the project could not be tested as a live product. No real pages, routes, buttons, forms, APIs, modals, role-based dashboards, CRUD flows, or backend persistence could be exercised from this folder. Real operational probes were still performed:

- `npm run dev` failed because `package.json` does not exist.
- `npm run build` failed because `package.json` does not exist.
- `npm test` failed because `package.json` does not exist.
- `npm run lint` failed because `package.json` does not exist.
- `http://localhost:3000` and `http://127.0.0.1:3000` both refused connection.

The folder is therefore best understood as a specification pack, not a product build. The strongest value of this audit is identifying the gap between the specification claims and the actual deliverable present at the audited location, plus surfacing architecture, security, data-model, and implementation contradictions inside the documents themselves.

## 2. Project Health Score

Overall runnable-product health: `12 / 100`

Breakdown:

- Executable product availability: `0 / 20`
- Testability from audited folder: `0 / 20`
- Planning/spec completeness: `16 / 20`
- Architecture consistency: `8 / 15`
- Security design quality: `7 / 10`
- Demo readiness from this folder: `1 / 10`
- Production readiness credibility: `-20 / 5` adjustment due to repeated unsupported "production-ready" claims

Current status:

- Planning docs exist: yes
- Product exists in audited folder: no
- Can demo from audited folder: no
- Can verify buttons/routes/APIs from audited folder: no

## 3. Critical Issues

### P0-01: Audited path does not contain an application

Severity: Critical

Files involved:

- [00_README.md](D:/agriplans/AgriConnect-Plans_new/00_README.md:4)

Reproduction steps:

1. Open `D:\agriplans\AgriConnect-Plans_new`
2. List files
3. Run `npm run dev`

Expected:

- A Next.js or comparable application exists with a runnable dev server

Actual:

- Only Markdown files exist
- `npm` fails with `ENOENT` because `package.json` is missing

Impact:

- No real QA execution is possible
- No browser flow testing is possible
- No backend/API verification is possible
- No build validation is possible

Possible root cause:

- Wrong folder supplied for audit
- Source repo not checked out
- Product implementation never created in this path

### P0-02: Production-readiness claims are unsupported by the audited artifact

Severity: Critical

Files involved:

- [00_README.md](D:/agriplans/AgriConnect-Plans_new/00_README.md:4)
- [01_master_decisions.md](D:/agriplans/AgriConnect-Plans_new/01_master_decisions.md:3)
- [04_api_routes.md](D:/agriplans/AgriConnect-Plans_new/04_api_routes.md:3)
- [05_voice_agent.md](D:/agriplans/AgriConnect-Plans_new/05_voice_agent.md:3)
- [20_cron_jobs.md](D:/agriplans/AgriConnect-Plans_new/20_cron_jobs.md:3)

Reproduction steps:

1. Read the documents claiming `PRODUCTION-READY` or `Production-verified`
2. Attempt to locate actual code, tests, or deployable assets in the same folder

Expected:

- Claims should be backed by executable code, tests, or deployment artifacts

Actual:

- No implementation is present in the audited directory

Impact:

- High demo risk
- High stakeholder trust risk
- High planning-to-execution gap

Possible root cause:

- Documentation written ahead of implementation
- Quality state overstated for presentation

### P0-03: Schema and planned queries are incompatible

Severity: Critical

Files involved:

- [02_database_schema.md](D:/agriplans/AgriConnect-Plans_new/02_database_schema.md:315)
- [08_farmer_portal.md](D:/agriplans/AgriConnect-Plans_new/08_farmer_portal.md:38)
- [09_consumer_portal.md](D:/agriplans/AgriConnect-Plans_new/09_consumer_portal.md:454)
- [11_admin_portal.md](D:/agriplans/AgriConnect-Plans_new/11_admin_portal.md:280)

Reproduction steps:

1. Read the `orders` table schema
2. Search the portal docs for `orders` queries
3. Compare selected columns

Expected:

- All planned queries reference real columns or valid joins

Actual:

- `orders` schema does not define `crop_name`
- Multiple pages query `orders.crop_name`

Impact:

- Immediate runtime query failures during implementation
- Broken dashboards and order lists across roles

Possible root cause:

- Data model drift between earlier drafts and final schema
- Missing decision on whether crop name lives on orders snapshot or related listing

### P0-04: Farmer dashboard queries `farmer_profiles.full_name`, which does not exist

Severity: Critical

Files involved:

- [02_database_schema.md](D:/agriplans/AgriConnect-Plans_new/02_database_schema.md:119)
- [08_farmer_portal.md](D:/agriplans/AgriConnect-Plans_new/08_farmer_portal.md:44)

Reproduction steps:

1. Read `farmer_profiles` schema
2. Read farmer dashboard data query

Expected:

- Query selects only columns present in `farmer_profiles`

Actual:

- Query selects `full_name` from `farmer_profiles`
- Schema places `full_name` on `users`

Impact:

- Farmer dashboard cannot render as specified

Possible root cause:

- Join to `users` omitted from the dashboard query

### P0-05: OTP verification flow cannot support phone-change OTP purposes

Severity: Critical

Files involved:

- [04_api_routes.md](D:/agriplans/AgriConnect-Plans_new/04_api_routes.md:62)
- [04_api_routes.md](D:/agriplans/AgriConnect-Plans_new/04_api_routes.md:113)
- [04_api_routes.md](D:/agriplans/AgriConnect-Plans_new/04_api_routes.md:125)
- [07_auth_flows.md](D:/agriplans/AgriConnect-Plans_new/07_auth_flows.md:353)

Reproduction steps:

1. Read `send-otp` route request shape
2. Read `verify-otp` route request shape
3. Read phone-change flow

Expected:

- OTP verification supports `LOGIN`, `PHONE_CHANGE_OLD`, and `PHONE_CHANGE_NEW`

Actual:

- `verify-otp` only reads `{ phone, otp }`
- Query hardcodes `.eq('purpose', 'LOGIN')`

Impact:

- Phone change flow will fail by design

Possible root cause:

- Route spec not updated when phone-change flow was added

### P0-06: Farmer OTP login does not create or return a real browser session

Severity: Critical

Files involved:

- [04_api_routes.md](D:/agriplans/AgriConnect-Plans_new/04_api_routes.md:178)

Reproduction steps:

1. Read `POST /api/auth/verify-otp`
2. Inspect success path

Expected:

- Successful OTP verification signs the farmer into Supabase and establishes a session cookie

Actual:

- Route generates a magic link for a synthetic email
- Route returns `{ success, userId, isNewUser, role }`
- Generated link is not consumed or returned meaningfully

Impact:

- Farmer auth flow cannot actually log a user into the web app as written

Possible root cause:

- Attempt to bridge phone auth with email magic-link mechanics without completing the session handoff design

### P0-07: Users can update their own entire `users` row under current RLS policy

Severity: Critical

Files involved:

- [03_rls_and_storage.md](D:/agriplans/AgriConnect-Plans_new/03_rls_and_storage.md:37)

Reproduction steps:

1. Read `users_update_own` RLS policy

Expected:

- Self-updates should restrict writable columns such as `full_name`, maybe `phone`, maybe `email`
- Sensitive fields such as `role`, `is_active`, and `deleted_at` should not be self-editable

Actual:

- Policy allows update as long as `id = auth.uid()`

Impact:

- Privilege escalation risk
- Soft-delete bypass risk
- Role tampering risk

Possible root cause:

- Policy written at row granularity without column-level protection design

## 4. High Priority Issues

### P1-01: `requireAdmin()` throws `NextResponse` objects

Files:

- [04_api_routes.md](D:/agriplans/AgriConnect-Plans_new/04_api_routes.md:656)

Expected:

- Helper returns responses safely or uses framework-supported error control flow

Actual:

- Helper throws `NextResponse.json(...)`

Risk:

- Callers may produce 500s instead of 401/403

### P1-02: Order creation is labeled atomic but is not transactional

Files:

- [09_consumer_portal.md](D:/agriplans/AgriConnect-Plans_new/09_consumer_portal.md:281)
- [09_consumer_portal.md](D:/agriplans/AgriConnect-Plans_new/09_consumer_portal.md:334)

Expected:

- Stock validation, order insert, stock decrement, notification, and cart clear occur in one transactional unit

Actual:

- Sequential client-side server action steps with no DB transaction

Risk:

- Overselling under concurrency
- Partial orders with failed decrements
- Duplicate stock consumption

### P1-03: Payment update route shape allows arbitrary order mutation

Files:

- [09_consumer_portal.md](D:/agriplans/AgriConnect-Plans_new/09_consumer_portal.md:393)

Expected:

- Payment action verifies authenticated buyer owns every target order and that order state is payable

Actual:

- Service-role update uses `.in('id', orderIds)` without documented ownership validation

Risk:

- Horizontal privilege abuse
- Unauthorized payment state changes

### P1-04: Review insertion policy is too weak

Files:

- [03_rls_and_storage.md](D:/agriplans/AgriConnect-Plans_new/03_rls_and_storage.md:233)
- [02_database_schema.md](D:/agriplans/AgriConnect-Plans_new/02_database_schema.md:461)

Expected:

- Reviewer must own the completed order and order must belong to reviewed farmer

Actual:

- Policy only checks `reviewer_id = auth.uid()`

Risk:

- Fake reviews
- Competitor sabotage

### P1-05: Dispute/review evidence is publicly readable

Files:

- [03_rls_and_storage.md](D:/agriplans/AgriConnect-Plans_new/03_rls_and_storage.md:530)

Expected:

- Evidence photos should be private or at least access-controlled by participants/admin

Actual:

- `review-photos` bucket is public-read

Risk:

- Privacy exposure
- Evidence scraping

### P1-06: Seed script is internally inconsistent and likely non-runnable

Files:

- [15_seed_data.md](D:/agriplans/AgriConnect-Plans_new/15_seed_data.md:18)
- [15_seed_data.md](D:/agriplans/AgriConnect-Plans_new/15_seed_data.md:176)
- [15_seed_data.md](D:/agriplans/AgriConnect-Plans_new/15_seed_data.md:337)
- [15_seed_data.md](D:/agriplans/AgriConnect-Plans_new/15_seed_data.md:451)

Observed issues:

- `upsertUser(id: string, ...)` is called with `null`
- `delivery_locations` upserts use `onConflict: 'user_id'`, but schema only has a partial unique index on `(user_id) where is_default = true`
- `listings` selection does not clearly return indexable IDs as later used
- `orders[0]` is referenced without showing `orders` capture
- Several review rows omit required `order_id`

Risk:

- Demo seed fails
- Test/demo credentials unavailable

### P1-07: Admin approve route references undefined data

Files:

- [04_api_routes.md](D:/agriplans/AgriConnect-Plans_new/04_api_routes.md:534)

Expected:

- `wholesalerEmail` must be fetched before use

Actual:

- Email send line references `wholesalerEmail` with no prior definition in shown code

Risk:

- KYC approval flow runtime failure

## 5. Medium Priority Issues

### P2-01: Public CTA path typo breaks wholesaler acquisition flow

Files:

- [13_public_pages.md](D:/agriplans/AgriConnect-Plans_new/13_public_pages.md:55)
- [07_auth_flows.md](D:/agriplans/AgriConnect-Plans_new/07_auth_flows.md:229)

Expected:

- `/auth/wholesaler`

Actual:

- `/auth/wholesale`

### P2-02: Voice intent inventory and action mapping are incomplete

Files:

- [05_voice_agent.md](D:/agriplans/AgriConnect-Plans_new/05_voice_agent.md:43)
- [05_voice_agent.md](D:/agriplans/AgriConnect-Plans_new/05_voice_agent.md:452)

Expected:

- Every declared intent has frontend behavior

Actual:

- Missing action handling for `UPDATE_LISTING`, `DELETE_LISTING`, `CONFIRM_ORDER`, and `CONTACT_BUYER`

### P2-03: Voice transcript lifecycle likely uses stale state

Files:

- [05_voice_agent.md](D:/agriplans/AgriConnect-Plans_new/05_voice_agent.md:536)
- [05_voice_agent.md](D:/agriplans/AgriConnect-Plans_new/05_voice_agent.md:543)

Expected:

- `onend` should use stable latest transcript reference

Actual:

- Callback reads `transcript` from React state closure

### P2-04: Cron schedule documentation conflicts across files

Files:

- [20_cron_jobs.md](D:/agriplans/AgriConnect-Plans_new/20_cron_jobs.md:17)
- [17_testing_cicd.md](D:/agriplans/AgriConnect-Plans_new/17_testing_cicd.md:438)
- [04_api_routes.md](D:/agriplans/AgriConnect-Plans_new/04_api_routes.md:452)

Observed conflict:

- One doc uses `30 18 * * *`
- Another uses `1 18 * * *`
- Route notes say `12:01 AM IST`

Risk:

- Standing orders execute at the wrong time

### P2-05: "Focus: high-impact critical paths only" is inconsistent with request for full audit coverage

Files:

- [17_testing_cicd.md](D:/agriplans/AgriConnect-Plans_new/17_testing_cicd.md:3)

Risk:

- Major feature areas would remain unverified even after implementation

## 6. Low Priority Issues

### P3-01: Multiple placeholders remain in "production-verified" docs

Examples:

- [06_api_resilience.md](D:/agriplans/AgriConnect-Plans_new/06_api_resilience.md:153) `Simplified`
- [20_cron_jobs.md](D:/agriplans/AgriConnect-Plans_new/20_cron_jobs.md:157) `Placeholder`
- [09_consumer_portal.md](D:/agriplans/AgriConnect-Plans_new/09_consumer_portal.md:180) future placeholder
- [11_admin_portal.md](D:/agriplans/AgriConnect-Plans_new/11_admin_portal.md:147) future integration

### P3-02: Storage strategy is inconsistent

Files:

- [03_rls_and_storage.md](D:/agriplans/AgriConnect-Plans_new/03_rls_and_storage.md:441)
- [21_aws_integration.md](D:/agriplans/AgriConnect-Plans_new/21_aws_integration.md:34)

Observed:

- One document centers Supabase Storage
- Another says S3 replaces Supabase Storage

### P3-03: Demo-focused mock payment weakens production trust messaging

Files:

- [01_master_decisions.md](D:/agriplans/AgriConnect-Plans_new/01_master_decisions.md:164)
- [09_consumer_portal.md](D:/agriplans/AgriConnect-Plans_new/09_consumer_portal.md:384)

## 7. Button-By-Button Test Report

Actual runtime button testing status: `Blocked`

Reason:

- No app exists in audited folder
- No local server could be started from audited folder
- No browser-testable DOM exists

Planned controls inventoried from docs:

### Public pages

- Farmer CTA on landing
- Consumer CTA on landing
- Wholesaler CTA on landing
- View Full Mandi
- Legal/footer links

### Farmer portal

- Mic FAB
- Voice tutorial `Try now`
- Voice tutorial `Skip`
- Create Listing
- Pause listing
- Resume listing
- Edit listing
- Delete listing
- Post Listing
- Accept Order
- Decline
- Mark Out for Delivery
- Language toggle
- WhatsApp notification toggle
- Install as App
- Change Phone Number
- Delete Account

### Consumer portal

- Search
- Filter dropdowns
- Add to Cart
- Login modal actions
- Quantity stepper
- Remove cart item
- Proceed to Checkout
- Add New Address
- Save Address
- Proceed to Payment
- Pay
- Track Your Order
- Continue Shopping
- I Received It
- Confirm Receipt
- Submit Review
- Report a Problem

### Wholesaler portal

- Browse Marketplace Read-only
- Place Order
- Send RFQ
- Favourite
- Open Chat
- Accept Deal
- Reject
- New Standing Order
- Pause standing order
- Edit standing order
- Cancel standing order
- Download PDF
- Export CSV
- Regenerate API key
- Delete Account

### Admin portal

- Review and Approve
- Suspend user
- Verify farmer
- Edit Score
- Edit Credit
- Approve Account
- Reject Application
- Resolve Dispute
- Sync Now
- Edit mandi price
- Add New Price Row
- Send Notification
- Save platform config rows

Conclusion:

- Control inventory is extensive in planning
- Zero controls were executable in the audited artifact

## 8. Page-By-Page Test Report

Actual load testing status for every page: `Blocked`

No page could be opened from the audited folder because there is no running application.

Planned route inventory found in documents:

### Public

- `/`
- `/mandi`
- `/legal/terms`
- `/legal/privacy`
- `/legal/refunds`
- `/account-deactivated`

### Auth

- `/auth/farmer`
- `/auth/farmer/otp`
- `/auth/farmer/setup`
- `/auth/consumer`
- `/auth/consumer/register`
- `/auth/consumer/onboard`
- `/auth/consumer/forgot-password`
- `/auth/consumer/reset-password`
- `/auth/wholesaler`
- `/auth/wholesaler/register`
- `/auth/admin`

### Farmer

- `/farmer`
- `/farmer/listings`
- `/farmer/listings/new`
- `/farmer/listings/[id]/edit`
- `/farmer/orders`
- `/farmer/orders/[id]`
- `/farmer/income`
- `/farmer/mandi`
- `/farmer/score`
- `/farmer/profile`
- `/farmer/profile/edit`
- `/farmer/settings`
- `/farmer/settings/phone`

### Consumer

- `/marketplace`
- `/marketplace/[id]`
- `/marketplace/farms/[farmerId]`
- `/cart`
- `/checkout`
- `/checkout/payment`
- `/checkout/success`
- `/orders`
- `/orders/[id]`
- `/profile`
- `/profile/addresses`
- `/profile/security`
- `/profile/notifications`
- `/profile/danger`

### Wholesaler

- `/wholesaler/pending`
- `/wholesaler`
- `/wholesaler/browse`
- `/wholesaler/orders`
- `/wholesaler/orders/[id]`
- `/wholesaler/rfq`
- `/wholesaler/rfq/[id]`
- `/wholesaler/standing-orders`
- `/wholesaler/credit`
- `/wholesaler/invoices`
- `/wholesaler/favourites`
- `/wholesaler/profile`
- `/wholesaler/locations`
- `/wholesaler/settings/security`
- `/wholesaler/settings/api`
- `/wholesaler/settings/notifications`
- `/wholesaler/settings/danger`

### Admin

- `/admin`
- `/admin/users`
- `/admin/users/[id]`
- `/admin/farmers`
- `/admin/wholesalers`
- `/admin/wholesalers/[id]`
- `/admin/orders`
- `/admin/support`
- `/admin/support/[orderId]`
- `/admin/mandi`
- `/admin/analytics`
- `/admin/notifications`
- `/admin/settings`

Page-level risk summary:

- Route map is broad and ambitious
- Several routes depend on schema/query mismatches already identified
- Role guards, auth session design, and cron/manual trigger design are not internally consistent

## 9. API Test Report

Actual live API execution status: `Blocked`

No server existed to receive requests.

Static API audit findings:

### Auth APIs

- `POST /api/auth/send-otp`
  - Good: phone validation, OTP hashing, purpose field
  - Risk: in-memory rate limiting resets on restart and does not scale
  - Risk: no documented cleanup of stale OTP sessions

- `POST /api/auth/verify-otp`
  - Critical: purpose mismatch blocks phone-change flows
  - Critical: no real session creation
  - Risk: does not clearly bound attempts using `otp_sessions.attempts`

- `GET /api/auth/callback`
  - Risk: callback seems consumer-oriented only; role assumptions need stronger validation

- `POST /api/auth/wholesaler/register`
  - Risk: multi-step user/profile creation not wrapped transactionally
  - Risk: admin notifications sent in a loop after account creation, increasing partial-failure surface

### Voice API

- `POST /api/agent/process`
  - Risk: in-memory 30 req/min rate limiter is not durable
  - Risk: fallback chain may generate inconsistent shapes across providers unless normalized strictly

### Cron APIs

- `GET /api/cron/mandi-sync`
  - Risk: provider specs conflict across docs
  - Risk: documented schedule conversions conflict

- `GET /api/cron/standing-orders`
  - Risk: creates confirmed orders without transaction
  - Risk: date logic uses generic `new Date()` without explicit IST normalization
  - Risk: route in [04_api_routes.md](D:/agriplans/AgriConnect-Plans_new/04_api_routes.md:370) and [20_cron_jobs.md](D:/agriplans/AgriConnect-Plans_new/20_cron_jobs.md:245) differ materially

- `GET /api/cron/auto-complete-deliveries`
  - Risk: assumes full quantity received, which is business-sensitive

- `GET /api/cron/auto-close-disputes`
  - Risk: resolves in farmer favor by default; must be clearly accepted product policy

- `GET /api/cron/expire-listings`
  - Risk: referenced as bonus/fifth cron while another document still frames system as four crons

### Admin APIs

- `POST /api/admin/users/[id]/suspend`
  - Risk: depends on fragile `requireAdmin`

- `POST /api/admin/wholesalers/[id]/approve`
  - High risk: undefined `wholesalerEmail`

- `POST /api/admin/farmers/[id]/verify`
  - Risk: missing idempotency details

- `POST /api/admin/mandi/sync`
  - In [20_cron_jobs.md](D:/agriplans/AgriConnect-Plans_new/20_cron_jobs.md:426), manual trigger example incorrectly uses `supabaseAdmin.auth.getSession()`, which is not a valid session-source pattern for route auth

- `POST /api/admin/notifications/broadcast`
  - Risk: no explicit input validation, length validation, or rate limiting in route spec

- `POST /api/admin/disputes/[orderId]/resolve`
  - Risk: `refundAmount` accepted but not shown being applied to payment math or credit ledger

## 10. Role-Based Flow Report

### Farmer flow

Runtime status: not testable

Static blockers:

- OTP session creation is incomplete
- Phone change cannot work with current verify route
- Voice intent actions are incomplete
- Dashboard query mismatches schema

### Consumer flow

Runtime status: not testable

Static blockers:

- Checkout is non-transactional
- Payment action has ownership gap
- Review and dispute permissions are under-specified

### Wholesaler flow

Runtime status: not testable

Static blockers:

- KYC gate depends on broken or incomplete admin approval route
- Standing orders can race stock and credit
- Route for `/wholesaler/rfq/new` is referenced but not fully documented as a page

### Admin flow

Runtime status: not testable

Static blockers:

- `requireAdmin` error control flow risk
- TOTP behavior is documented conceptually, not concretely tested
- Several actions lack transaction and audit-depth details

### Delivery/logistics role

Status:

- No separate delivery/logistics portal exists in V1
- Delivery is assigned directly to farmers

Risk:

- User request asked for delivery/logistics testing if present
- Current product scope does not supply that role

## 11. Responsive Design Report

Visual responsive testing status: `Blocked`

No frontend could be launched for viewport testing.

Static responsive risks:

- Farmer portal is mobile-first with `max-width: 480px`, which is reasonable but unverified
- Consumer marketplace uses grid/list modes but no actual CSS proof exists
- Admin and wholesaler dashboards rely heavily on data tables and may collapse poorly on mobile
- Landing page uses large hero cards and marquee ticker, both common sources of overflow and clipping
- Modal-heavy flows need explicit mobile viewport and keyboard handling that is not documented in enough detail

## 12. Code Quality Report

Source code quality could not be linted or typechecked because no source code exists in the audited target.

Documentation/pseudocode quality findings:

- Multiple snippets are not TypeScript-complete
- Missing imports are common
- Undefined variables appear in key flows
- Schema/query drift is frequent
- Service boundaries are blurred between spec and implementation
- "Production-verified" labels are overused relative to evidence

Specific examples:

- [04_api_routes.md](D:/agriplans/AgriConnect-Plans_new/04_api_routes.md:534) undefined email variable
- [05_voice_agent.md](D:/agriplans/AgriConnect-Plans_new/05_voice_agent.md:452) incomplete action handling
- [15_seed_data.md](D:/agriplans/AgriConnect-Plans_new/15_seed_data.md:451) inconsistent review seed shape
- [17_testing_cicd.md](D:/agriplans/AgriConnect-Plans_new/17_testing_cicd.md:242) tests assert invented local objects rather than implementation outcomes

## 13. Performance Report

Runtime performance testing status: `Blocked`

Static performance concerns:

- Provider waterfalls use sequential fallbacks with long timeouts, risking slow user-facing responses
- Order polling every 10 seconds may be acceptable for demo but needs scale analysis
- Standing order cron processes entries sequentially
- Email and WhatsApp loops can become slow and rate-limit prone
- `auth.admin.listUsers()` in seed strategy is inefficient
- Non-transactional server actions increase retried work under failure

## 14. Security Report

Top security concerns:

1. Broad self-update RLS on `users`
2. Weak review insert policy
3. Public dispute evidence bucket
4. Payment mutation route lacking documented ownership checks
5. In-memory rate limiting unsuitable for multi-instance deployments
6. Team process docs encourage sharing `.env.local` over chat channels
7. Service-role-heavy design increases blast radius if route guards are imperfect

Additional security observations:

- `SUPABASE_SERVICE_ROLE_KEY` is correctly documented as server-side only, but operational sharing practices are too loose
- Admin helper patterns need more robust session verification and error handling
- Generated API keys for wholesalers need stronger regeneration and single-display guarantees in implementation

## 15. Hackathon Readiness Report

Current readiness from this folder: `Not ready`

Reasons:

- Nothing runnable exists here
- Seed and demo flows cannot be validated
- Mock payment and multiple placeholder features are acceptable for demo only if implemented cleanly elsewhere
- Too many foundational contradictions remain unresolved even at the planning level

Biggest demo risks:

- Wrong folder on demo day
- Broken farmer login
- Broken seed script
- Order placement inconsistencies under concurrency
- Admin KYC approval crash
- Cron timing mistakes

## 16. Mandatory Action Items

1. Confirm the correct source repository path and audit the real application directory next.
2. Create or supply the executable Next.js codebase with `package.json`, source folders, and test setup.
3. Reconcile schema versus planned queries before any feature implementation.
4. Redesign farmer OTP login to produce a real authenticated session.
5. Tighten RLS for `users`, `orders`, and `order_reviews`.
6. Make dispute evidence private by default.
7. Replace sequential checkout/order logic with a transactional DB procedure or RPC.
8. Repair seed script until `seed` and `seed:reset` run cleanly and idempotently.
9. Resolve cron schedule discrepancies and normalize all times explicitly in UTC and IST.
10. Downgrade unsupported "production-ready" claims until the product is actually verified.

## 17. Recommended Improvements

- Add a real QA matrix covering every route, button, modal, and API
- Add Playwright E2E tests for all four user roles
- Add API contract tests for auth, payment, cron, and admin endpoints
- Add schema validation CI that compares queries and types against generated Supabase types
- Add accessibility acceptance criteria for every modal and form
- Add centralized input validation for all route handlers
- Add audit logging for sensitive admin actions
- Use a single storage source of truth and document migration steps clearly

## 18. Suggested Implementation Order

1. Foundation repo and runnable app bootstrap
2. Database schema corrections and generated types
3. Seed script and demo credential validation
4. Auth flows and middleware
5. Marketplace plus farmer listing flows
6. Cart, checkout, and payment mock with proper authorization
7. Admin KYC, notifications, and disputes
8. Wholesaler RFQ, credit, and standing orders
9. Cron stabilization
10. Accessibility, responsiveness, and demo polish
11. Full end-to-end test sweep

## Evidence Appendix

### Real commands executed

- `Get-ChildItem -Recurse -Force` in `D:\agriplans\AgriConnect-Plans_new`
- `npm run dev`
- `npm run build`
- `npm test`
- `npm run lint`
- `Invoke-WebRequest http://localhost:3000`
- `Invoke-WebRequest http://127.0.0.1:3000`
- `node --version`
- `npm --version`

### Real outcomes

- No `package.json` in audited folder
- No server available on port `3000`
- Node present: `v20.19.0`
- npm present: `10.8.2`

### Audit limitation statement

This report is complete relative to the artifact that was actually present at `D:\agriplans\AgriConnect-Plans_new`. It is not a substitute for a live product audit of the real implementation repository. If a different folder contains the application code, that folder should be audited next using the same checklist.
