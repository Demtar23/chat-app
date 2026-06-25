# CLAUDE.md — AI Agent Entry Point

> This file is the primary entry point for AI agents working in this repository.
> Read this file first, then ARCHITECTURE.md for deeper system design.

---

## 1. Project Overview

A **production-ready, full-stack real-time chat application** deployed on Vercel (frontend) and Render (backend).

Users can:
- Register / login with email+password or Google OAuth2
- Chat in a **global channel**, **named rooms**, or **private (1-to-1) DMs**
- React to messages (emoji), edit/delete messages, pin messages, reply to messages
- See typing indicators, online presence, and message delivery/seen status
- Upload and manage profile avatars
- Switch UI language (English / Ukrainian)
- Toggle dark/light theme

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, TailwindCSS v4 |
| Routing | React Router v7 |
| State | React Context + custom hooks (no external state manager) |
| WebSocket client | socket.io-client v4 |
| HTTP client | native `fetch` wrapped in `fetchWithAuth` |
| i18n | i18next + react-i18next (en / uk) |
| UI utilities | lucide-react (icons), react-toastify (toasts), lottie-react (animations) |
| Validation (client) | Zod v4 |
| Backend | Node.js, Express 5, TypeScript |
| WebSocket server | Socket.IO v4 |
| Database | MongoDB via Mongoose 9 |
| Auth | JWT (access 10 min / refresh 7 d) + Passport.js (Google OAuth2) |
| Password hashing | bcrypt |
| Email | Brevo (Sendinblue) API via axios |
| File uploads | multer (in-memory) to Cloudinary |
| Validation (server) | Zod v4 |
| Testing (server) | Jest + ts-jest + Supertest + mongodb-memory-server |
| Testing (client) | Vitest + @testing-library/react |
| Monorepo tooling | npm workspaces, ESLint, Prettier |

---

## 3. Project Structure

```
chat-app/                     <- monorepo root
├── package.json              <- workspace root (scripts: check, lint:fix, format)
├── .eslintrc.js / .eslintignore / .prettierrc
├── CLAUDE.md                 <- this file
├── ARCHITECTURE.md           <- system design deep-dive
│
├── client/                   <- React SPA (Vite)
│   ├── index.html
│   ├── vite.config.ts        <- vitest + react plugin + tailwindcss plugin
│   ├── vercel.json           <- rewrites /api/* -> Render backend; SPA fallback
│   ├── .env                  <- VITE_API_URL, VITE_BACKEND_URL, VITE_IMAGE_KIT_URL
│   └── src/
│       ├── main.tsx          <- React entry point
│       ├── App.tsx           <- BrowserRouter + ThemeProvider + AuthProvider + routes
│       ├── index.css         <- base Tailwind import
│       ├── api/              <- all HTTP fetch functions
│       │   ├── fetchWithAuth.ts   <- silent token-refresh interceptor
│       │   ├── auth.api.ts
│       │   ├── messages.api.ts
│       │   ├── rooms.api.ts
│       │   └── users.api.ts
│       ├── services/
│       │   └── socket.ts     <- socket.io-client singleton (connect/disconnect/getSocket)
│       ├── context/
│       │   ├── AuthContext.tsx    <- user + accessToken state, refresh logic, socket lifecycle
│       │   └── ThemeContext.tsx   <- dark/light theme toggle
│       ├── hooks/
│       │   ├── useMessages.ts        <- message list state + load-more + search + scroll-to
│       │   ├── useSocketListeners.ts <- ALL socket event subscriptions for the chat page
│       │   ├── useRooms.ts           <- room list, join/leave/delete
│       │   ├── useUsers.ts           <- all-users list fetch
│       │   ├── useBackendHealth.ts   <- polls GET /api/health before rendering app
│       │   ├── useBreakpoint.ts      <- responsive breakpoint detection
│       │   ├── useFormField.ts       <- controlled input helper
│       │   ├── useSendingFallback.ts <- optimistic send timeout fallback
│       │   └── useTheme.ts           <- reads ThemeContext
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── ActivationPage.tsx       <- handles /auth/activation/:token
│       │   ├── ForgotPasswordPage.tsx
│       │   ├── ResetPasswordPage.tsx    <- handles /auth/reset-password/:token
│       │   ├── GoogleCallbackPage.tsx   <- handles /auth/callback (Google login)
│       │   ├── SetupProfilePage.tsx     <- handles /auth/setup-profile (new Google users)
│       │   ├── ChatPage.tsx             <- thin wrapper that renders Chat component
│       │   └── NotFoundPage.tsx
│       ├── components/
│       │   ├── ProtectedRoute.tsx    <- redirects to /login if not authenticated
│       │   ├── AppLoader.tsx         <- full-screen loading state
│       │   ├── LangToggle.tsx        <- i18n language switcher
│       │   ├── ThemeToggle.tsx       <- dark/light toggle
│       │   ├── ToastWrapper.tsx      <- react-toastify container
│       │   └── Chat/
│       │       ├── Chat.tsx               <- main chat page component (manages all state)
│       │       └── components/
│       │           ├── Sidebar.tsx            <- room list, user list, DM navigation
│       │           ├── TopBar.tsx             <- current chat header, search toggle
│       │           ├── MessageList.tsx        <- scroll, load-more
│       │           ├── MessageItem.tsx        <- single message with edit/delete/react/reply
│       │           ├── MessageInput.tsx       <- text input, send button
│       │           ├── TypingIndicator.tsx
│       │           ├── PinnedMessageBar.tsx
│       │           ├── ReactionBar.tsx / ReactionPicker.tsx
│       │           ├── ReplyPreview.tsx
│       │           ├── SearchResults.tsx
│       │           ├── Avatar.tsx
│       │           ├── ProfileModal.tsx
│       │           ├── EditProfileModal.tsx
│       │           ├── RoomInfoPanel.tsx
│       │           ├── CreateRoomModal.tsx
│       │           ├── DateSeparator.tsx
│       │           ├── ChatSkeletons.tsx
│       │           ├── EmptyChat.tsx
│       │           ├── MessageStatus.tsx
│       │           └── UserHoverCard.tsx
│       ├── types/
│       │   ├── message.ts   <- Message, MessageType, MessageStatus, Reaction, ReplyTo
│       │   ├── room.ts      <- Room
│       │   ├── user.ts      <- UserProfile
│       │   ├── chat.ts      <- ActiveChat (discriminated union: global | room | private)
│       │   └── socket.ts    <- OnlineUser
│       ├── validations/
│       │   └── auth.schema.ts  <- Zod schemas for client-side form validation
│       ├── utils/
│       │   ├── toast.ts          <- notify helpers (notify.success, notify.error)
│       │   └── formatLastSeen.ts
│       ├── styles/
│       │   ├── theme.ts              <- CSS class maps for dark/light mode
│       │   └── authPageClasses.ts    <- class maps for auth form pages
│       ├── i18n/
│       │   ├── index.ts             <- i18next init (LanguageDetector, en/uk)
│       │   └── locales/
│       │       ├── en.ts
│       │       └── uk.ts
│       └── tests/                   <- Vitest test files
│
└── server/                   <- Express API + Socket.IO
    ├── package.json
    ├── tsconfig.json
    ├── .env                  <- all secrets (see Section 5 below)
    └── src/
        ├── server.ts         <- entry: HTTP server, Socket.IO init, DB connect
        ├── app.ts            <- Express app, CORS, middleware chain, route mounts
        ├── config/
        │   ├── db.ts         <- mongoose.connect(MONGO_URL)
        │   ├── passport.ts   <- 'google' and 'google-register' strategies
        │   └── cloudinary.ts <- cloudinary.config(...)
        ├── models/
        │   ├── User.ts       <- IUser interface + Mongoose schema
        │   ├── Message.ts    <- Message schema with indexes
        │   └── Room.ts       <- Room schema
        ├── routes/
        │   ├── authRouter.ts
        │   ├── userRouter.ts
        │   ├── messageRouter.ts
        │   └── roomRouter.ts
        ├── controllers/
        │   ├── auth.controller.ts
        │   ├── user.controller.ts
        │   ├── message.controller.ts
        │   └── room.controller.ts
        ├── services/
        │   ├── auth.service.ts         <- user CRUD, password, email verification
        │   ├── user.service.ts         <- getMe, updateUser, lastSeen
        │   ├── message.service.ts      <- all message queries + mutations
        │   ├── room.service.ts         <- room CRUD, join/leave
        │   ├── permissions.service.ts  <- assertRoomMember, assertRoomOwner, assertMessageOwner
        │   └── upload.service.ts       <- Cloudinary upload/delete avatar
        ├── middlewares/
        │   ├── auth.middleware.ts    <- Bearer token validation, sets req.user
        │   ├── guestMiddleware.ts    <- rejects authenticated users on public routes
        │   ├── errorMiddleware.ts    <- global error handler (AppError + fallbacks)
        │   ├── validateBody.ts       <- Zod request body validator
        │   └── upload.ts            <- multer memory storage (max 5 MB)
        ├── socket/
        │   ├── socket.ts            <- initSocket(): auth middleware + event dispatch
        │   ├── socketAuth.ts        <- JWT validation for socket handshake
        │   ├── socketInstance.ts    <- singleton: setIo / getIo (for use in HTTP controllers)
        │   └── handlers/
        │       ├── message.handler.ts   <- send/edit/delete/pin/unpin (global/room/private)
        │       ├── typing.handler.ts    <- typing:start / typing:stop
        │       ├── room.handler.ts      <- room:join / room:leave / room:created broadcast
        │       ├── reaction.handler.ts  <- reaction:toggle
        │       ├── status.handler.ts    <- messages:seen
        │       └── user.handler.ts      <- user:update -> user:updated broadcast
        ├── state/
        │   └── onlineUsers.ts  <- Map<userId, {userId, userName, socketId}> (in-memory)
        ├── errors/
        │   └── AppError.ts     <- AppError base + NotFoundError, ValidationError,
        │                          UnauthorizedError, ForbiddenError, ConflictError, FileTooLargeError
        ├── utils/
        │   ├── jwt.ts        <- generateAccessToken/RefreshToken/SetupToken + validate*
        │   ├── mailer.ts     <- Brevo API: sendActivationLink, sendResetLink (en/uk HTML)
        │   └── catchError.ts <- async error wrapper for Express route handlers
        ├── validations/
        │   └── auth.schema.ts  <- Zod: registerSchema, loginSchema, changePasswordSchema, etc.
        ├── types/
        │   ├── socket.ts      <- SocketWithUser (extends Socket with .user field)
        │   ├── message.ts     <- SendMessageData, ReplyTo types
        │   └── express/       <- Express Request augmentation (req.user)
        └── tests/             <- Jest test files
```

---

## 4. Deployment

| Component | Platform | Config |
|---|---|---|
| Frontend (SPA) | Vercel | `client/vercel.json` — rewrites `/api/*` to Render, SPA fallback |
| Backend (API + WS) | Render | `server/package.json` `start` script (`node dist/server.js`) |
| Database | MongoDB Atlas | `MONGO_URL` in server env |
| File storage | Cloudinary | `CLOUDINARY_*` env vars |
| Email | Brevo | `BREVO_API_KEY` + `FROM_EMAIL` |

**Production backend URL (from vercel.json):** `https://chat-app-a77u.onrender.com`

---

## 5. Environment Variables

### Server (`server/.env`)

```
PORT=5000
MONGO_URL=                    # MongoDB Atlas connection string
JWT_ACCESS_SECRET=            # used for 10-min access tokens
JWT_REFRESH_SECRET=           # used for 7-day refresh tokens
JWT_SETUP_SECRET=             # used for 15-min Google OAuth setup tokens
NODE_ENV=production|development
CLIENT_URL=                   # frontend origin (CORS + redirect URLs)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
BREVO_API_KEY=
FROM_EMAIL=                   # sender address for transactional email
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Client (`client/.env`)

```
VITE_API_URL=                 # e.g. http://localhost:5000/api
VITE_BACKEND_URL=             # e.g. http://localhost:5000 (socket.io target)
VITE_IMAGE_KIT_URL=           # ImageKit CDN prefix for avatar display
```

---

## 6. Commands

### Development

```bash
# From server/
npm run dev          # ts-node-dev --respawn --transpile-only

# From client/
npm run dev          # Vite dev server
```

### Production Build

```bash
# Server
npm run build        # tsc -> dist/
npm run start        # node dist/server.js

# Client
npm run build        # tsc -b && vite build -> dist/
```

### Tests

```bash
# Server (from server/)
npm test             # Jest --runInBand (uses mongodb-memory-server)

# Client (from client/)
npm test             # vitest run
npm run test:watch   # vitest watch
```

### Linting (from root)

```bash
npm run check        # eslint .
npm run lint:fix     # eslint . --fix
npm run format       # prettier --write .
```

---

## 7. Core Rules for AI Agents

### NEVER do without explicit instruction:

1. **Do NOT modify database models** (`server/src/models/`) without auditing all downstream consumers: services, types, socket handlers, and client-side types.
2. **Do NOT change JWT payload shape** — `{ id, username }` is relied on by `jwt.ts`, `auth.middleware.ts`, `socketAuth.ts`, and `AuthContext.tsx` simultaneously.
3. **Do NOT touch CORS settings** in `app.ts` or `server.ts` — production cross-origin delivery depends on these exact values.
4. **Do NOT change `COOKIE_OPTIONS`** in `auth.controller.ts` — `sameSite: 'none'` and `secure: true` in production are required for cross-origin cookie delivery (Vercel to Render).
5. **Do NOT add more in-memory server state** without documenting that it resets on restart and is not shared across multiple server instances.
6. **Do NOT modify `vercel.json`** rewrite rules without understanding the impact on API proxying.

### Always do:

1. **Use `catchError()`** wrapper for all new Express route handlers — forwards async errors to `errorMiddleware`.
2. **Throw `AppError` subclasses** from services/controllers, not raw `Error` — `errorMiddleware` maps them to correct HTTP status codes.
3. **Use `permissionsService`** for all access-control checks (room membership, message ownership, room ownership).
4. **Use `getIo()`** from `socketInstance.ts` when emitting socket events from HTTP controllers.
5. **Handle all three `ActiveChat` variants** (`global`, `room`, `private`) in any client code that reads `activeChat`.
6. **Use `fetchWithAuth()`** (not raw `fetch`) for all authenticated API calls from the client — handles silent token refresh automatically.

---

## 8. Safe Development Workflow

1. **Identify scope**: backend-only, frontend-only, or full-stack?
2. **Check types first**: For full-stack changes, update `server/src/types/` and `client/src/types/` together.
3. **Backend order**: model → service → controller → route → socket handler.
4. **Frontend order**: `api/*.api.ts` → hook → component.
5. **Test locally**: Run `npm run dev` in both `client/` and `server/`.
6. **Lint before committing**: `npm run lint:fix` from root.

---

## 9. Key Patterns

| Pattern | File | Notes |
|---|---|---|
| Silent token refresh | `client/src/api/fetchWithAuth.ts` | On 401 → refresh once → retry all pending requests |
| Socket singleton | `client/src/services/socket.ts` | One instance per session; re-authenticates on reconnect |
| In-memory online users | `server/src/state/onlineUsers.ts` | `Map<userId, OnlineUser>` — not persistent |
| Cursor-based pagination | `message.service.ts` `getBefore*` functions | `_id < beforeId` for efficient MongoDB paging |
| Soft delete (all) | `Message.isDeleted = true` | Records kept; text replaced with "Message deleted" |
| Delete for me | `Message.deletedFor: string[]` | User ID appended; filtered with `$ne` in all queries |
| Private message emit | `emitPrivateEvent()` in `message.handler.ts` | Emits to both sender and receiver socket |
| Google setup flow | `jwt.generateSetupToken()` → `setupProfile` | New Google users pick username before account creation |
| Error hierarchy | `server/src/errors/AppError.ts` | 6 typed subclasses map to HTTP status via `errorMiddleware` |
