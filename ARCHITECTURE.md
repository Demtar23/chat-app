# ARCHITECTURE.md — System Design

> Companion to CLAUDE.md. Describes the full-stack architecture, data flows, and module responsibilities.

---

## 1. High-Level System Design

```
┌─────────────────────────────────────────────────────────┐
│                      BROWSER (Client)                   │
│  React SPA (Vite) — deployed on Vercel                  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  HTTP requests  →  /api/*  (Vercel rewrite proxy) │  │
│  │  WebSocket      →  wss://chat-app-a77u.onrender.com│  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │  HTTPS / WSS
                         │
┌────────────────────────▼────────────────────────────────┐
│                    SERVER (Backend)                      │
│  Node.js + Express 5 + Socket.IO — deployed on Render   │
│                                                         │
│  ┌─────────────────┐   ┌──────────────────────────────┐ │
│  │  REST API        │   │  Socket.IO                   │ │
│  │  /api/auth       │   │  auth via JWT handshake      │ │
│  │  /api/user       │   │  handlers: message, typing,  │ │
│  │  /api/messages   │   │  room, reaction, status, user│ │
│  │  /api/rooms      │   └──────────────────────────────┘ │
│  │  GET /api/health │                                   │
│  └─────────────────┘                                   │
│                                                         │
│  ┌────────────┐  ┌───────────┐  ┌────────────────────┐  │
│  │  Passport  │  │  multer   │  │  onlineUsers Map   │  │
│  │  Google    │  │  5 MB max │  │  (in-memory)       │  │
│  └────────────┘  └───────────┘  └────────────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
     ┌─────▼─────┐  ┌──────▼──────┐  ┌────▼──────┐
     │  MongoDB  │  │  Cloudinary │  │  Brevo    │
     │  Atlas    │  │  (avatars)  │  │  (email)  │
     └───────────┘  └─────────────┘  └───────────┘
```

---

## 2. Authentication Flow

### 2a. Email/Password Registration

```
Client                          Server                         DB / Email
  │                                │                               │
  │  POST /api/auth/register        │                               │
  │  {username, email, password}    │                               │
  │ ──────────────────────────────► │                               │
  │                                 │  createUser()                │
  │                                 │  bcrypt.hash(password, 10)   │
  │                                 │  crypto.randomBytes(32)      │
  │                                 │  → emailVerificationToken    │
  │                                 │ ─────────────────────────────►
  │                                 │  User.create(...)            │
  │                                 │  mailer.sendActivationLink() │
  │                                 │ ─────────────────────────────►
  │  201 { message }               │                               │
  │ ◄────────────────────────────── │                               │
```

### 2b. Email Verification

```
Client                          Server
  │                                │
  │  GET /api/auth/verify-email/:token │
  │ ──────────────────────────────► │
  │                                 │  User.findOne({ emailVerificationToken: token,
  │                                 │                 emailVerificationExpires: {$gt: now} })
  │                                 │  user.isEmailVerified = true
  │                                 │  generateAccessToken() [10 min]
  │                                 │  generateRefreshToken() [7 days]
  │                                 │  Set-Cookie: refreshToken (httpOnly)
  │  200 { user, accessToken }     │
  │ ◄────────────────────────────── │
  │  connectSocket(accessToken)    │
```

### 2c. Login

```
Client                          Server
  │                                │
  │  POST /api/auth/login           │
  │  {email, password}              │
  │ ──────────────────────────────► │
  │                                 │  findUserByEmail()
  │                                 │  bcrypt.compare(password, hash)
  │                                 │  check isEmailVerified
  │                                 │  generateAccessToken() [10 min]
  │                                 │  generateRefreshToken() [7 days]
  │                                 │  Set-Cookie: refreshToken (httpOnly)
  │  200 { user, accessToken }     │
  │ ◄────────────────────────────── │
  │  setUser() + connectSocket()   │
```

### 2d. Silent Token Refresh

```
Client (fetchWithAuth.ts)           Server
  │                                    │
  │  Any API call → 401                │
  │  (access token expired)            │
  │                                    │
  │  POST /api/auth/refresh             │
  │  (sends httpOnly refreshToken cookie)│
  │ ──────────────────────────────────► │
  │                                     │  validateRefreshToken(cookie)
  │                                     │  generateAccessToken() [new 10 min]
  │  200 { user, accessToken }         │
  │ ◄───────────────────────────────── │
  │  retry original request             │
  │  (+ all queued parallel requests)  │
```

### 2e. Google OAuth Login

```
Client                Server                        Google
  │                      │                              │
  │  GET /api/auth/google │                              │
  │ ─────────────────────►│                              │
  │                       │  passport.authenticate()    │
  │                       │ ────────────────────────────►
  │                       │      redirect to Google     │
  │ ◄─────────────────────│◄────────────────────────────│
  │  user authenticates   │                              │
  │ ─────────────────────►│                              │
  │                       │  Google callback             │
  │                       │  User.findOne({ email })     │
  │                       │                              │
  │  CASE A: Existing user│                              │
  │                       │  generateAccessToken()       │
  │                       │  generateRefreshToken()      │
  │                       │  Set-Cookie: refreshToken    │
  │                       │  redirect to /auth/callback  │
  │                       │                              │
  │  CASE B: New user     │                              │
  │                       │  generateSetupToken() [15min]│
  │                       │  redirect to /auth/setup-profile?setup_token=...
```

### 2f. Google Setup Profile (new users only)

```
Client                          Server
  │                                │
  │  POST /api/auth/setup-profile   │
  │  {setup_token, username}        │
  │ ──────────────────────────────► │
  │                                 │  validateSetupToken(setup_token)
  │                                 │  check username uniqueness
  │                                 │  createGoogleUser(email, username, avatar)
  │                                 │  io.emit('user:new', ...)
  │                                 │  generateAccessToken()
  │                                 │  generateRefreshToken()
  │                                 │  Set-Cookie: refreshToken
  │  201 { user, accessToken }     │
  │ ◄────────────────────────────── │
```

---

## 3. WebSocket Architecture

### 3a. Connection Lifecycle

```
Client                              Server (socket.ts)
  │                                      │
  │  io(BACKEND_URL, { auth: { token } }) │
  │ ─────────────────────────────────────►│
  │                                       │  socketAuth middleware:
  │                                       │    jwt.validateAccessToken(token)
  │                                       │    socket.user = { id, username }
  │                                       │
  │  (on connection)                      │  messagesService.markAsDelivered(user.id)
  │                                       │  onlineUsers.set(user.id, { userId, userName, socketId })
  │                                       │  io.emit('online_users', [...onlineUsers.values()])
  │                                       │
  │                                       │  Register handlers:
  │                                       │    messageHandler(io, socket)
  │                                       │    typingHandler(io, socket)
  │                                       │    roomHandler(io, socket)
  │                                       │    reactionHandler(io, socket)
  │                                       │    statusHandler(io, socket)
  │                                       │    userHandler(io, socket)
  │                                       │
  │  (on disconnect)                      │  onlineUsers.delete(user.id)
  │                                       │  io.emit('online_users', [...])
  │                                       │  userService.updateLastSeen(user.id)
```

### 3b. Socket Event Reference

#### Client → Server (emit)

| Event | Payload | Handler |
|---|---|---|
| `send_message` | `{ text, replyTo? }` | `message.handler.ts` → broadcasts `receive_message` |
| `room:message:send` | `{ roomId, text, replyTo? }` | `message.handler.ts` → room broadcast `room:message:receive` |
| `private:send` | `{ receiverId, text, replyTo? }` | `message.handler.ts` → both sockets `private:receive` |
| `message:edit` | `{ messageId, text }` | `message.handler.ts` → emits `message:edited` to scope |
| `message:delete` | `{ messageId }` | `message.handler.ts` → soft-delete, emits `message:deleted` |
| `message:delete:me` | `{ messageId }` | `message.handler.ts` → `deletedFor` push, emits `message:deleted:me` |
| `message:pin` | `{ messageId }` | `message.handler.ts` → emits `message:pinned` to scope |
| `message:unpin` | `{ messageId }` | `message.handler.ts` → emits `message:unpinned` to scope |
| `reaction:toggle` | `{ messageId, emoji }` | `reaction.handler.ts` → emits `reaction:updated` to scope |
| `typing:start` | `{ type, roomId?, receiverId? }` | `typing.handler.ts` → `socket.broadcast.emit('typing:update')` |
| `typing:stop` | `{ type, roomId?, receiverId? }` | `typing.handler.ts` → `socket.broadcast.emit('typing:update')` |
| `room:join` | `roomId: string` | `room.handler.ts` → `socket.join(roomId)` |
| `room:leave` | `roomId: string` | `room.handler.ts` → `socket.leave(roomId)` |
| `room:created` | `room` (object) | `room.handler.ts` → `socket.broadcast.emit('room:created')` |
| `messages:seen` | `senderId: string` | `status.handler.ts` → marks DB seen, notifies sender |
| `user:update` | `{ bio?, avatar? }` | `user.handler.ts` → `io.emit('user:updated')` |
| `online_users:request` | — | `socket.ts` → `socket.emit('online_users', ...)` |
| `users:get` | — | `socket.ts` → `socket.emit('online_users', ...)` |

#### Server → Client (emit)

| Event | Payload | Scope |
|---|---|---|
| `online_users` | `OnlineUser[]` | `io.emit` (all) |
| `receive_message` | `Message` | `io.emit` (all) |
| `room:message:receive` | `Message` | `io.to(roomId).emit` |
| `private:receive` | `Message` | sender + receiver socket only |
| `message:edited` | `Message` | scope-dependent (global/room/private) |
| `message:deleted` | `Message` | scope-dependent |
| `message:deleted:me` | `{ messageId }` | `socket.emit` (self only) |
| `message:pinned` | `Message` | scope-dependent |
| `message:unpinned` | `Message` | scope-dependent |
| `reaction:updated` | `Message` | scope-dependent |
| `typing:update` | `{ userId, username, isTyping, type, roomId?, receiverId? }` | `socket.broadcast.emit` (all others) |
| `messages:seen` | `{ by, from }` | sender socket only |
| `room:created` | `Room` | `io.emit` (all) or `socket.broadcast.emit` |
| `room:updated` | `Room` | `io.emit` (all) |
| `room:deleted` | `{ roomId }` | `io.emit` (all) |
| `room:joined` | `{ roomId }` | `socket.emit` (self) |
| `room:left` | `{ roomId }` | `socket.emit` (self) |
| `room:error` | `{ message }` | `socket.emit` (self) |
| `user:updated` | `UserProfile` | `io.emit` (all) |
| `user:new` | `UserProfile` | `io.emit` (all) |

### 3c. Emit Scope Rules

- **Global messages**: `io.emit(event, payload)` — all connected clients.
- **Room messages**: `io.to(roomId).emit(event, payload)` — only clients that have joined the room via `socket.join(roomId)`.
- **Private messages**: custom `emitPrivateEvent()` — sends to sender socket AND the peer socket (looked up from `onlineUsers` map).
- **Self-only**: `socket.emit(event, payload)`.
- **All others**: `socket.broadcast.emit(event, payload)` — everyone except the emitting socket.

---

## 4. REST API Reference

All routes are prefixed with `/api`.

### Auth — `/api/auth`

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/register` | guest | `{ username, email, password, locale? }` | Sends verification email |
| POST | `/login` | guest | `{ email, password }` | Returns access token + sets refresh cookie |
| GET | `/verify-email/:token` | — | — | Activates account, returns tokens |
| POST | `/refresh` | — | — | Uses httpOnly cookie; returns new access token |
| POST | `/logout` | — | — | Clears refresh cookie |
| POST | `/change-password` | JWT | `{ oldPassword, newPassword }` | |
| POST | `/forgot-password` | — | `{ email, locale? }` | Silent if email not found |
| POST | `/reset-password/:token` | — | `{ newPassword }` | Token expires in 1 hour |
| POST | `/setup-profile` | — | `{ setup_token, username }` | Google new-user profile creation |
| GET | `/google` | — | — | Initiates Google OAuth login |
| GET | `/google/register` | — | — | Initiates Google OAuth registration |
| GET | `/google/callback` | — | — | Google OAuth login callback |
| GET | `/google/register/callback` | — | — | Google OAuth register callback |

### Users — `/api/user`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/me` | JWT | Returns current user profile |
| GET | `/all` | JWT | Returns all user profiles |
| GET | `/:id` | JWT | Returns user by ID |
| PATCH | `/me` | JWT | Update bio, bannerColor, username |
| POST | `/me/avatar` | JWT | Upload avatar (multipart/form-data, field: `avatar`) |
| DELETE | `/me/avatar` | JWT | Delete avatar from Cloudinary |

### Messages — `/api/messages`

| Method | Path | Auth | Query Params | Notes |
|---|---|---|---|---|
| GET | `/global` | JWT | `before?` (cursor ID) | Returns 30 messages before cursor |
| GET | `/room/:roomId` | JWT | `before?` | Returns 30 room messages before cursor |
| GET | `/private/:userId` | JWT | `before?` | Returns 30 private messages before cursor |
| GET | `/pinned` | JWT | `type, roomId?, userId?` | Returns pinned messages |
| GET | `/search` | JWT | `q, type, roomId?, userId?` | Regex search (max 20 results) |
| GET | `/around/:messageId` | JWT | `type, roomId?, userId?` | Returns 30 messages around a target |
| POST | `/:messageId/pin` | JWT | — | |
| POST | `/:messageId/unpin` | JWT | — | |
| POST | `/:messageId/react` | JWT | — | Body: `{ emoji }` |
| PATCH | `/:messageId` | JWT | — | Body: `{ text }` |
| DELETE | `/:messageId` | JWT | — | Soft-delete for all |
| DELETE | `/:messageId/me` | JWT | — | Hide from current user only |

### Rooms — `/api/rooms`

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/` | JWT | Create room; body: `{ name, description? }` |
| GET | `/` | JWT | List all rooms |
| GET | `/:roomId` | JWT | Get room by ID |
| POST | `/:roomId/join` | JWT | Join room (adds to members, emits room:updated) |
| POST | `/:roomId/leave` | JWT | Leave room (removes from members, emits room:updated) |
| DELETE | `/:roomId` | JWT | Owner only; emits room:deleted |
| PATCH | `/:roomId` | JWT | Owner only; update description; emits room:updated |

### Health

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | Returns `{ status: 'ok' }` — used by `useBackendHealth` hook |

---

## 5. Database Schema

### Collection: `users`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `username` | String | unique, trimmed |
| `email` | String | unique, lowercase |
| `passwordHash` | String | bcrypt hash (Google users get random bytes) |
| `isEmailVerified` | Boolean | default false; Google users start as true |
| `emailVerificationToken` | String\|null | 32-byte hex; nulled after verification |
| `emailVerificationExpires` | Date\|null | 24 hours from registration |
| `passwordResetToken` | String\|null | 32-byte hex |
| `passwordResetExpires` | Date\|null | 1 hour from request |
| `bio` | String | max 200 chars |
| `avatar` | String\|null | Cloudinary secure URL |
| `lastSeen` | Date\|null | updated on socket disconnect |
| `bannerColor` | String\|null | profile banner hex color |
| `createdAt` | Date | auto (timestamps: true) |
| `updatedAt` | Date | auto |

### Collection: `messages`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | used as cursor for pagination |
| `text` | String | required; set to "Message deleted" on soft-delete |
| `senderId` | String | userId string |
| `senderUsername` | String | denormalized for display |
| `type` | Enum | `'global'` \| `'room'` \| `'private'` |
| `roomId` | ObjectId\|null | ref: Room; populated for room messages |
| `receiverId` | String\|null | userId string for private messages |
| `reactions` | `[{emoji, users[]}]` | embedded sub-documents, `_id: false` |
| `status` | Enum | `'sent'` \| `'delivered'` \| `'seen'` |
| `isEdited` | Boolean | |
| `isDeleted` | Boolean | soft delete |
| `deletedFor` | String[] | user IDs who deleted for themselves |
| `replyTo` | `{messageId, text, senderUsername}` \| null | embedded reply data |
| `isPinned` | Boolean | |
| `pinnedAt` | Date\|null | |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes:**
- `{ type: 1, createdAt: -1 }` — global message queries
- `{ roomId: 1, createdAt: -1 }` — room message queries
- `{ senderId: 1, receiverId: 1, createdAt: -1 }` — private message queries

### Collection: `rooms`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `name` | String | unique, 2–32 chars |
| `description` | String | max 128 chars |
| `createdBy` | String | userId string; used for owner permission checks |
| `members` | String[] | array of userId strings |
| `createdAt` | Date | |
| `updatedAt` | Date | |

---

## 6. Frontend Architecture

### 6a. Context Providers (global state)

```
App
└─ BrowserRouter
   └─ ThemeProvider          (dark/light mode, persisted to localStorage)
      └─ AppContent           (calls useBackendHealth; shows loader until backend ready)
         └─ AuthProvider      (user, accessToken, isLoading; manages socket lifecycle)
            └─ Routes
               └─ ProtectedRoute -> ChatPage -> Chat.tsx
```

### 6b. Chat.tsx — Central State Hub

`Chat.tsx` is the largest component (~500 lines). It owns:
- `activeChat: ActiveChat` — which channel/room/DM is open
- `onlineUsers`, `allUsers`, `myProfile`, `selectedProfileUser`
- `typingUsers`
- `isSending`, `mobileView`, `isRoomInfoOpen`
- Delegates to hooks: `useMessages`, `useRooms`, `useUsers`, `useSocketListeners`, `useSendingFallback`

### 6c. Data Flow — Sending a Message

```
User types text in MessageInput.tsx
  │
  │  getSocket().emit('send_message', { text, replyTo })
  │
  ▼
socket.ts (client singleton)
  │
  │  WebSocket frame → server
  │
  ▼
message.handler.ts (server)
  │
  │  messagesService.createMessage({ text, senderId, type: 'global', ... })
  │  → Message.create(data)  [MongoDB]
  │
  │  io.emit('receive_message', message)
  │
  ▼
useSocketListeners.ts (client)
  │
  │  socket.on('receive_message', (message) => {
  │    if (activeChat.type === 'global') setMessages(prev => [...prev, message])
  │  })
  │
  ▼
MessageList.tsx re-renders with new message
```

### 6d. Data Flow — Loading Messages on Chat Switch

```
User clicks a room/user in Sidebar.tsx
  │
  │  setActiveChat({ type: 'room', roomId, roomName })
  │
  ▼
useMessages.ts — useEffect([activeChat])
  │
  │  fetchRoomMessages(token, roomId)  →  GET /api/messages/room/:roomId
  │
  ▼
MessageList.tsx renders messages
  │
  │  (infinite scroll trigger)
  │  loadMore() → fetchRoomMessages(token, roomId, firstMessage._id)
  │               → GET /api/messages/room/:roomId?before=<id>
```

### 6e. Token Refresh Flow (fetchWithAuth)

```
Component/hook calls fetchWithAuth(url, options, accessToken)
  │
  │  fetch(url, { Authorization: Bearer <token> })
  │  → 401 response
  │
  ▼
fetchWithAuth.ts
  │
  │  isRefreshing flag prevents concurrent refresh storms
  │  POST /api/auth/refresh (sends httpOnly cookie automatically)
  │  → { accessToken: newToken }
  │
  │  onTokenRefreshed(newToken)
  │    → setAccessToken(newToken) in AuthContext
  │    → connectSocket(newToken)  (reconnects socket with fresh token)
  │
  │  Retry original request with new token
  │  Drain pending requests queue
```

---

## 7. Server Module Responsibilities

### 7a. Entry Chain

```
server.ts
  ├── dotenv.config()
  ├── http.createServer(app)
  ├── new Server(httpServer, { cors }) → Socket.IO
  ├── setIo(io)         ← stores singleton for HTTP controllers
  ├── initSocket(io)    ← registers auth + all socket handlers
  └── connectDB() → httpServer.listen(PORT)

app.ts
  ├── cors({ origin: CLIENT_URL, credentials: true })
  ├── express.json()
  ├── cookieParser()
  ├── passport.initialize()
  ├── /api/auth   → authRouter
  ├── /api/user   → userRouter
  ├── /api/messages → messageRouter
  ├── /api/rooms  → roomRouter
  └── errorMiddleware (last, 4-arg signature)
```

### 7b. Request Lifecycle (HTTP)

```
HTTP Request
  → CORS (express cors middleware)
  → express.json() parser
  → cookieParser()
  → Route match (authRouter / userRouter / messageRouter / roomRouter)
  → [guestMiddleware | authMiddleware] (route-specific)
  → [validateBody(zodSchema)] (if applicable)
  → catchError(controllerFn)
  → controller → service → MongoDB
  → res.json(data)
  → [on error] errorMiddleware → res.status(code).json({ message, code })
```

### 7c. Service Layer Design

Services are plain objects (not classes) exported as named constants:
- `usersService` — `auth.service.ts`
- `userService` — `user.service.ts`
- `messagesService` — `message.service.ts`
- `roomsService` — `room.service.ts`
- `permissionsService` — `permissions.service.ts`

Services interact directly with Mongoose models. They never import from controllers or routes.

### 7d. Permission Checks

All permission checks go through `permissionsService`:

| Function | Checks | Throws |
|---|---|---|
| `assertRoomMember(roomId, userId)` | `room.members.includes(userId)` | `ForbiddenError` |
| `assertRoomOwner(roomId, userId)` | `room.createdBy === userId` | `ForbiddenError` |
| `assertMessageOwner(messageId, userId)` | `message.senderId === userId` | `ForbiddenError` |
| `canAccessPrivateChat(userId, peerId)` | `userId !== peerId` | returns `false` (not a throw) |

---

## 8. Internationalization

- Languages supported: **English** (`en`) and **Ukrainian** (`uk`)
- Detection: `i18next-browser-languagedetector` (reads browser language preference)
- Fallback: `en`
- Translation files: `client/src/i18n/locales/en.ts` and `uk.ts`
- Server-side locale: email templates in `mailer.ts` also support `'en' | 'uk'` via `locale` param sent in register/forgot-password requests
- Usage: `useTranslation()` hook in all components that display user-facing text

---

## 9. File Upload Flow (Avatar)

```
Client (EditProfileModal.tsx)
  │
  │  FormData with file field 'avatar'
  │  POST /api/user/me/avatar
  │  fetchWithAuth(url, { method: 'POST', body: formData }, token)
  │
  ▼
Server
  │
  │  upload.ts (multer, memoryStorage, max 5 MB)
  │    → req.file.buffer
  │
  │  uploadAvatar(buffer, userId)
  │    → cloudinary.uploader.upload_stream(
  │        { folder: 'avatars', public_id: 'avatar_<userId>', overwrite: true,
  │          transformation: [256x256 crop fill face, webp auto quality] }
  │      )
  │    → returns secure_url
  │
  │  User.findByIdAndUpdate(userId, { avatar: secure_url })
  │
  │  io.emit('user:updated', updatedUser)
  │
  ▼
Client (useSocketListeners.ts)
  │
  │  socket.on('user:updated', updated => {
  │    setAllUsers(...), setMyProfile(...), setSelectedProfileUser(...)
  │  })
```

---

## 10. Key Constraints and Gotchas

1. **`onlineUsers` is in-memory** — if the server restarts, all users appear offline until they reconnect. This is not a bug; it is intentional for simplicity.

2. **Socket rooms vs. Chat rooms** — Socket.IO uses `socket.join(roomId)` to add a socket to a real-time broadcast group. This is separate from the database `Room.members` array. Both must be in sync: HTTP join updates `members`, socket join adds to broadcast group.

3. **Access token is 10 minutes** — very short by design to minimize exposure. The silent refresh in `fetchWithAuth` and the reconnect logic in `socket.ts` handle this transparently.

4. **`NODE_ENV=production` in server `.env`** — even during local development if the server `.env` has `NODE_ENV=production`, cookies will be sent with `secure: true` and `sameSite: 'none'`, which requires HTTPS. Ensure local development uses `NODE_ENV=development`.

5. **Cursor pagination uses MongoDB ObjectId ordering** — `_id < beforeId` works because ObjectIds are time-ordered. Do not use `createdAt` for cursor pagination; use `_id`.

6. **`getIo()` may return null** — at server startup, `setIo()` is called before `start()`. If `getIo()` is called before `setIo()`, it returns `null`. All usages safely use optional chaining: `getIo()?.emit(...)`.

7. **`guestMiddleware`** blocks authenticated users from hitting `/register` and `/login` — it checks for a valid access token in the Authorization header and returns 403 if found. This prevents double-login scenarios.

8. **Google OAuth callbacks** are routed through the SERVER (not the client) — the Passport callback hits the server, then the server redirects to the client's `/auth/callback` or `/auth/setup-profile`. The client URL in `CLIENT_URL` env var must be correct.
