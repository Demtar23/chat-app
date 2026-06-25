# RULES.md — AI Agent Behavioral Rules

> **Scope**: These rules apply to ALL AI agents (Claude, Cursor, Antigravity, or any other) working in this repository.
> **Status**: Mandatory. No rule may be silently skipped.
> **Reference**: See also `CLAUDE.md` (entry point) and `ARCHITECTURE.md` (system design).

---

## 1. Safety Rules

### 1.1 — Never Break Production Without Explicit Confirmation

- This application is **live in production** (Vercel + Render + MongoDB Atlas).
- Before modifying any of the following files, you MUST state the change explicitly and wait for user confirmation:
  - `server/src/app.ts` — CORS and middleware chain
  - `server/src/server.ts` — HTTP server, Socket.IO init, DB connection
  - `server/src/config/passport.ts` — Google OAuth strategies
  - `server/src/config/db.ts` — MongoDB connection
  - `client/vercel.json` — Vercel deployment rewrites (API proxy + SPA fallback)
  - `server/src/middlewares/auth.middleware.ts` — JWT Bearer validation
  - `server/src/socket/socketAuth.ts` — Socket.IO JWT validation
  - `server/src/utils/jwt.ts` — Token generation and validation
- The rule applies even for "small" changes like adding a console.log or changing a timeout value.

### 1.2 — Never Break Authentication or WebSocket Flow

Authentication and real-time communication are the two most critical system paths. Never modify:
- The JWT payload shape `{ id, username }` — used in `jwt.ts`, `auth.middleware.ts`, `socketAuth.ts`, and `AuthContext.tsx` simultaneously
- Cookie configuration (`COOKIE_OPTIONS`) in `auth.controller.ts` — `sameSite: 'none'` + `secure: true` are required for Vercel → Render cross-origin delivery
- The socket connection lifecycle in `AuthContext.tsx` — specifically the `connectSocket()` / `disconnectSocket()` calls tied to login/logout/refresh
- The `fetchWithAuth` silent-refresh logic in `client/src/api/fetchWithAuth.ts` — altering the `isRefreshing` flag or `pendingRequests` queue will break concurrent request handling

### 1.3 — Never Remove Working Features

Do NOT delete, disable, or comment out any working feature, including:
- Typing indicators (`typing:start` / `typing:stop` / `typing:update` events)
- Message delivery/seen status tracking (`status.handler.ts`, `messagesService.markAsDelivered`)
- Message pinning / unpinning
- Reaction toggling
- "Delete for me" vs. "Delete for all" message deletion
- Private message emit (the `emitPrivateEvent()` helper in `message.handler.ts`)
- Online users tracking (`state/onlineUsers.ts`)
- `useBackendHealth` health check — it gates the entire app render

### 1.4 — Never Expose or Log Secrets

- Do NOT log, print, or output any value from environment variables to the console, response body, or client.
- Do NOT hardcode secrets, tokens, API keys, or passwords in any source file.
- Do NOT commit changes that modify `.env` files (they are `.gitignore`d and should remain so).
- If a feature requires a new secret, document the required env var name in a comment — never set a default value for a secret.

---

## 2. Scope Rules

### 2.1 — Stay Inside the Project Directory

- Only read, create, or modify files within the repository root.`.
- Do NOT access, read, or modify any files outside this directory (system files, other projects, user home directory).

### 2.2 — Do Not Inspect Unrelated Directories

- Do NOT traverse or read files in `node_modules/`, `.git/`, `dist/`, or `build/` directories.
- These directories exist but must not be modified manually.

### 2.3 — Do Not Execute Destructive Commands

The following commands are **prohibited** without explicit user approval in each individual case:
- Any `DROP`, `deleteMany`, or `deleteOne` on the live Atlas database
- `rm -rf` or equivalent on source directories
- `git reset --hard`, `git push --force`
- Direct modifications to production environment variables on Vercel or Render dashboards

### 2.4 — Only Modify What Was Asked

- If a user asks to fix a bug in one function, do NOT refactor neighboring code.
- If a user asks to add a feature, do NOT improve unrelated code style or structure in the same change.
- Limit the blast radius of every change to the minimum required.

---

## 3. Change Workflow

### 3.1 — Analyze Before Implementing

Before writing any code, you MUST:
1. Identify all files that will be affected by the change.
2. Identify all callers / consumers of the code being changed.
3. Check if the change touches shared types (`server/src/types/`, `client/src/types/`) — if so, both sides must be updated together.
4. Check if the change involves socket events — if so, verify both the server handler and the client `useSocketListeners.ts` listener.

### 3.2 — Propose a Plan for Structural Changes

For any change that involves more than one file or touches business logic, you MUST:
- State clearly: which files will change, what will change, and why.
- List any new dependencies that will be added.
- Identify any backward-compatibility concerns.
- Wait for user approval before starting implementation.

**What counts as a "structural change":**
- Adding a new socket event (requires server handler + client listener)
- Adding a new API endpoint (requires route + controller + service)
- Modifying a Mongoose model schema
- Adding a new React context or changing an existing one
- Changing the middleware chain order in `app.ts`
- Changing the token structure or expiry times

**What does NOT require a plan (minor changes):**
- Fixing a typo in an error message
- Adding a missing null-check
- Updating a string in a translation file
- Adding a CSS class to a component

### 3.3 — Apply Changes in Small, Reversible Steps

- Do not rewrite large sections of code in a single change.
- Make one logical change at a time and ensure the app still runs between steps.
- Prefer additive changes (adding new functions, new files) over modifying existing ones wherever possible.
- When modifying existing functions, preserve the original function signature unless changing the signature is the explicit goal.

### 3.4 — Verify the Application Still Runs

After any change, confirm that:
- The backend server starts (`npm run dev` from `server/`) without errors.
- The client dev server starts (`npm run dev` from `client/`) without errors.
- No TypeScript errors are introduced (`tsc --noEmit` in the respective workspace).
- If a socket event was changed, manually verify or trace that both the emit and the listener are aligned.

---

## 4. Communication Rules

### 4.1 — Explain Changes Before Making Them

Before modifying any file, state:
- **What** file(s) will be changed.
- **Why** the change is needed.
- **How** the change will be implemented.
- **What risks** the change carries (if any).

Never silently apply a change without this disclosure.

### 4.2 — Ask for Clarification When Requirements Are Ambiguous

If the user's request could be interpreted in more than one way, you MUST ask before implementing. Do not pick an interpretation and proceed silently.

Examples of ambiguous requests that require clarification:
- "Add a feature to rooms" — which feature, which room behaviors?
- "Fix the auth" — which auth flow, what is broken?
- "Make it faster" — which part, what is the performance target?
- "Refactor this" — what is the goal of the refactor?

### 4.3 — Declare When You Are Uncertain

If you are uncertain about the impact of a change, say so explicitly. Do not guess and silently apply a potentially breaking change.

### 4.4 — Do Not Assume Requirements

- Do not add features that were not requested.
- Do not "improve" code style, naming, or structure unless that was explicitly asked.
- Do not add logging, monitoring, or analytics code unless asked.

---

## 5. Testing Rules

### 5.1 — Do Not Break Existing Tests

- Server tests live in `server/src/tests/` and use Jest + mongodb-memory-server.
- Client tests live in `client/src/tests/` and use Vitest + @testing-library/react.
- If your change breaks an existing test, either fix the test (if the test was wrong) or revert the change (if the test was correct).
- Never delete a test to make a test suite pass.

### 5.2 — Add Tests for New Logic

- New server service functions should have corresponding Jest tests.
- New utility functions should be tested.
- Tests are not required for purely UI changes (new components), but are encouraged for any logic extracted into hooks or utilities.

---

## 6. Dependency Rules

### 6.1 — Do Not Add Dependencies Without Approval

- Do NOT add a new `npm` package without explicitly proposing it and getting user approval.
- Justify any new dependency: why is it needed, what does it do, what is its bundle size impact (for client deps).

### 6.2 — Prefer Existing Utilities

Before introducing a new library, check whether the need is already covered:
- HTTP requests: use `fetchWithAuth` (authenticated) or raw `fetch` (unauthenticated)
- Validation: use `zod` (already installed on both sides)
- Toast notifications: use `notify.success()` / `notify.error()` from `client/src/utils/toast.ts`
- Icon components: use `lucide-react` (already installed)
- Animations: use `lottie-react` (already installed)
- i18n strings: use `useTranslation()` from `react-i18next`

---

## 7. Quick Reference — Critical Files by Risk Level

### HIGH RISK (always confirm before touching)
- `server/src/server.ts`
- `server/src/app.ts`
- `server/src/utils/jwt.ts`
- `server/src/middlewares/auth.middleware.ts`
- `server/src/socket/socketAuth.ts`
- `server/src/config/passport.ts`
- `client/src/context/AuthContext.tsx`
- `client/src/api/fetchWithAuth.ts`
- `client/vercel.json`

### MEDIUM RISK (analyze consumers before touching)
- `server/src/models/*.ts` — schema changes affect all downstream code
- `server/src/socket/socket.ts` — changes affect all socket handlers
- `client/src/services/socket.ts` — changes affect all real-time behavior
- `client/src/hooks/useSocketListeners.ts` — changes affect all real-time UI updates
- `client/src/App.tsx` — changes affect routing for the entire app

### LOW RISK (safe to modify with care)
- `client/src/i18n/locales/*.ts` — translation strings only
- `client/src/styles/theme.ts` — design tokens only
- `client/src/utils/*.ts` — isolated utility functions
- `server/src/utils/mailer.ts` — email templates only
- Individual component files in `client/src/components/Chat/components/`
