# 💬 Real-Time Chat Application

A fullstack real-time chat application with support for private messages, group rooms, user profiles, authentication (JWT + Google OAuth), and live updates via WebSockets.

The app includes features such as message reactions, pinning, editing, search, pagination, profile customization, email verification, and responsive UI with theme and localization support.

**Live Demo:** https://chat-app-iota-three-22.vercel.app/chat

**Backend API:** https://chat-app-a77u.onrender.com/api/health

## 🏗️ Architecture Overview

The application is a fullstack monorepo split into two workspaces — `client` and `server` — managed via npm workspaces.

**How it fits together:**
- The frontend communicates with the backend via REST API (HTTP) and WebSockets (Socket.IO)
- HTTP requests go through a Vercel proxy (`/api/*`) to keep cookies first-party and avoid cross-site blocking
- WebSocket connection goes directly to the backend on Render
- Real-time events are always broadcast from the server after data is persisted — the client only sends action requests
- Auth state lives in React Context; refresh tokens are stored in HTTP-only cookies and never appear in the URL

**Auth flow:**
- Email/password: `POST /api/auth/login` → access token (10min) in response + refresh token (7d) in HTTP-only cookie
- Google OAuth: Google → Vercel proxy → backend sets cookie → redirects to `/auth/callback` → client calls `/api/auth/refresh`
- Token refresh happens automatically via `fetchWithAuth` when a 401 response is received

**Storage:**
- MongoDB Atlas — messages, rooms, users
- Cloudinary — user avatar uploads
- ImageKit CDN — preset avatar images

### 📁 Project Structure

```
chat-app/
├── client/                          # React + Vite frontend
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── api/                     # REST API functions
│       │   ├── auth.api.ts          # login, register, refresh, OAuth
│       │   ├── fetchWithAuth.ts     # fetch wrapper with auto token refresh
│       │   ├── messages.api.ts      # fetch, search, pin, react
│       │   ├── rooms.api.ts         # CRUD, join, leave
│       │   └── users.api.ts         # profile, avatar upload
│       ├── assets/                  # Lottie animations, SVG
│       ├── components/
│       │   ├── Chat/
│       │   │   ├── components/      # All chat UI components
│       │   │   │   ├── Avatar.tsx
│       │   │   │   ├── MessageList.tsx
│       │   │   │   ├── MessageItem.tsx
│       │   │   │   ├── Sidebar.tsx
│       │   │   │   ├── TopBar.tsx
│       │   │   │   ├── RoomInfoPanel.tsx
│       │   │   │   └── ...          # 20 components total
│       │   │   └── Chat.tsx         # Main chat orchestration component
│       │   ├── icons/
│       │   │   └── icons.ts         # Lucide icon map
│       │   ├── AppLoader.tsx        # Fullscreen / overlay loader
│       │   ├── LangToggle.tsx       # uk/en language switcher
│       │   ├── ProtectedRoute.tsx   # Auth guard for /chat
│       │   ├── ThemeToggle.tsx      # Dark/light toggle
│       │   └── ToastWrapper.tsx     # react-toastify config
│       ├── context/
│       │   ├── AuthContext.tsx      # User state + token refresh logic
│       │   └── ThemeContext.tsx     # Dark/light theme
│       ├── hooks/
│       │   ├── useMessages.ts       # Messages + search + scroll + pagination
│       │   ├── useRooms.ts          # Room CRUD + join/leave
│       │   ├── useSocketListeners.ts # All socket event subscriptions
│       │   ├── useUsers.ts          # User list + own profile
│       │   ├── useSendingFallback.ts # Send state with timeout fallback
│       │   ├── useBackendHealth.ts  # Backend availability polling
│       │   ├── useBreakpoint.ts     # mobile/tablet/desktop detection
│       │   ├── useFormField.ts      # Zod-backed form field state
│       │   └── useTheme.ts          # System/manual theme detection
│       ├── i18n/                    # Internationalization
│       │   ├── locales/
│       │   │   ├── en.ts
│       │   │   └── uk.ts
│       │   └── index.ts             # i18next config
│       ├── pages/                   # Route-level components
│       │   ├── ChatPage.tsx         # Entry point → renders <Chat />
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── ActivationPage.tsx
│       │   ├── ForgotPasswordPage.tsx
│       │   ├── ResetPasswordPage.tsx
│       │   ├── GoogleCallbackPage.tsx
│       │   ├── SetupProfilePage.tsx
│       │   └── NotFoundPage.tsx
│       ├── services/
│       │   └── socket.ts            # Socket.IO client singleton
│       ├── styles/
│       │   ├── theme.ts             # Design tokens (colors, borders)
│       │   └── authPageClasses.ts   # Shared auth page styles
│       ├── types/                   # TypeScript interfaces
│       │   ├── chat.ts              # ActiveChat union type
│       │   ├── message.ts
│       │   ├── room.ts
│       │   ├── socket.ts
│       │   └── user.ts
│       ├── utils/
│       │   ├── formatLastSeen.ts
│       │   └── toast.ts
│       ├── validations/
│       │   └── auth.schema.ts       # Zod schemas (client-side)
│       ├── App.tsx                  # Routes + backend health gate
│       ├── index.css                # Tailwind base
│       └── main.tsx                 # Entry point
│
└── server/                          # Node.js + Express backend
    └── src/
        ├── config/
        │   ├── cloudinary.ts        # Cloudinary SDK setup
        │   ├── db.ts                # MongoDB connection
        │   └── passport.ts          # Google OAuth strategies
        ├── controllers/             # Thin request handlers
        │   ├── auth.controller.ts
        │   ├── message.controller.ts
        │   ├── room.controller.ts
        │   └── user.controller.ts
        ├── errors/
        │   └── AppError.ts          # Typed error classes
        ├── middlewares/
        │   ├── auth.middleware.ts   # JWT validation
        │   ├── errorMiddleware.ts   # Global error handler
        │   ├── guestMiddleware.ts   # Block authenticated users
        │   ├── upload.ts            # Multer config
        │   └── validateBody.ts      # Zod request validation
        ├── models/                  # Mongoose schemas
        │   ├── Message.ts
        │   ├── Room.ts
        │   └── User.ts
        ├── routes/                  # Express routers
        │   ├── authRouter.ts
        │   ├── messageRouter.ts
        │   ├── roomRouter.ts
        │   └── userRouter.ts
        ├── services/                    # Business logic layer
        │   ├── auth.service.ts          # User CRUD, password, tokens
        │   ├── message.service.ts       # Queries + deletedFor filtering
        │   ├── permissions.service.ts   # assertRoomMember, assertMessageOwner
        │   ├── room.service.ts
        │   ├── upload.service.ts        # Cloudinary upload/delete
        │   └── user.service.ts
        ├── socket/
        │   ├── handlers/            # Event handlers by domain
        │   │   ├── message.handler.ts
        │   │   ├── reaction.handler.ts
        │   │   ├── room.handler.ts
        │   │   ├── status.handler.ts
        │   │   ├── typing.handler.ts
        │   │   └── user.handler.ts
        │   ├── socket.ts            # Connection lifecycle
        │   ├── socketAuth.ts        # JWT middleware for sockets
        │   └── socketInstance.ts    # getIo/setIo singleton
        ├── state/
        │   └── onlineUsers.ts       # In-memory Map of connected users
        ├── types/
        │   ├── express/             # Express Request augmentation
        │   ├── message.ts
        │   └── socket.ts
        ├── utils/
        │   ├── catchError.ts        # Async handler wrapper
        │   ├── jwt.ts               # Token generation/validation
        │   └── mailer.ts            # Brevo email templates
        ├── validations/
        │   └── auth.schema.ts       # Zod schemas (server-side)
        ├── app.ts                   # Express app + middleware setup
        └── server.ts                # HTTP server + Socket.IO init
```

## 🛠️ Technologies Used

### 🎨 Frontend

- **React (v19.2.5)** — UI library
- **React DOM** — rendering engine
- **TypeScript** — static typing
- **Vite** — build tool & dev server
- **React Router DOM** — routing
- **Tailwind CSS** — styling
- **Lucide React** — icons
- **React Toastify** — notifications
- **Lottie React** — animations
- **i18next + react-i18next** — internationalization
- **Socket.io Client** — real-time communication

---

### ⚙️ Backend

- **Node.js** — runtime environment
- **Express (v5.2.1)** — backend framework
- **MongoDB + Mongoose** — database & ODM
- **Socket.io** — real-time communication (WebSockets)
- **JWT** — authentication (access & refresh tokens)
- **Passport.js** — Google OAuth authentication
- **bcrypt** — password hashing
- **Zod** — schema validation
- **Multer** — file uploads

---

### 📧 Services & Integrations

- **Brevo (Sendinblue API)** — email delivery service
- **Nodemailer** — email sending (development / fallback)
- **Google OAuth 2.0** — external authentication provider
- **Cloudinary** — image storage & management
- **ImageKit (CDN / Image Optimization)** — image uploads and delivery

---

### 🧰 Development Tools

- **npm workspaces** — monorepo (client + server)
- **ESLint + Prettier** — linting & formatting
- **Jest + ts-jest** — backend testing
- **Vitest + Testing Library** — frontend testing
- **mongodb-memory-server** — in-memory MongoDB for tests
- **TypeScript** — static type checking

---

### 🚀 Deployment

- **Vercel** — frontend hosting
- **Render** — backend hosting

## ⚙️ Setup & Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/your-username/chat-app.git
cd chat-app
```

### 2. Install dependencies

```bash
npm install
```

This installs dependencies for both `client` and `server` via npm workspaces.

### 3. Environment variables

Create .env files in both server and client folders.

**`server/.env`**
```env

PORT=5000
MONGO_URL=your_mongodb_connection

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_SETUP_SECRET=your_setup_secret

NODE_ENV=production

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

BREVO_API_KEY=your_brevo_api_key
FROM_EMAIL=your_email_from_brevo

CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SERVER_URL=https://your-backend.onrender.com
CLIENT_URL=https://your-frontend.vercel.app
```

**`client/.env`**
```env

VITE_API_URL=https://your-backend.onrender.com
VITE_SOCKET_URL=https://your-backend.onrender.com
VITE_IMAGE_KIT_URL=your_api_secret
```

> **Required third-party services:**
> - [MongoDB Atlas](https://www.mongodb.com/atlas) — database
> - [Google Cloud Console](https://console.cloud.google.com) — OAuth credentials
> - [Brevo](https://www.brevo.com) — email delivery
> - [Cloudinary](https://cloudinary.com) — avatar storage
> - [ImageKit](https://imagekit.io) — CDN for preset avatars

### 4. Run locally

**Backend**
```bash
cd server
npm run dev
```

**Frontend** (in a separate terminal):
```bash
cd client
npm run dev
```
## 📜 Scripts

### Root
| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint + Prettier check |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format all files with Prettier |

### Server (`cd server`)
| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend in development mode with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Start compiled production server |
| `npm test` | Run backend test suite |

### Client (`cd client`)
| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm test` | Run frontend test suite |
| `npm run test:watch` | Run tests in watch mode |

## 🧪 Tests

### Backend tests (Jest + ts-jest + mongodb-memory-server)

```bash
cd server
npm test
```

Covers:
- `auth.test.ts` — user creation, password hashing, JWT generation and validation
- `permissions.test.ts` — room membership, room ownership, message ownership checks
- `messages.test.ts` — delete-for-me filtering, delete-for-all behavior

> Tests use an in-memory MongoDB instance — they never touch the real database.

### Frontend tests (Vitest + Testing Library)

```bash
cd client
npm test
```

Covers:
- `ProtectedRoute.test.tsx` — auth loading state, redirect when unauthenticated, render when authenticated

## ✨ Features

### 💬 Real-time communication

- Private messaging between users
- Group chat rooms
- Live updates via WebSockets (Socket.io)

### 🔐 Authentication & Security

- JWT authentication (access + refresh tokens)
- Google OAuth login
- Email verification system
- Password reset (forgot password flow)
- Protected routes and middleware

### 👤 User system

- Custom user profiles (username, bio, avatar)
- Avatar upload (with size & type validation)
- Online/last seen status
- Profile customization

### 💬 Messaging system

- Send, edit, delete messages
- Message reactions (emoji reactions)
- Pin messages in chats
- Message search
- Pagination / infinite loading

### 🏠 Chat rooms

- Create and manage group rooms
- Room owner permissions (edit/delete room)
- Room metadata (name, description, members)
- Real-time room updates

### 🎨 UI / UX

- Responsive design (mobile, tablet, desktop)
- Dark/light theme support
- Emoji picker with icons
- Smooth animations and loaders
- Empty states for all main views

### 🌍 Localization

- Multi-language support (i18n)
- Auto-detection of user language
- Persistent language settings

### ⚙️ System & performance

- Pagination for messages and rooms
- Optimized real-time updates
- Cold start loading state
- Error handling for API and sockets


## 🔧 Technical Decisions

| Decision | Reason |
|----------|--------|
| React + Vite | Fast dev experience, modern tooling, good TypeScript support |
| Express 5 | Familiar REST framework, async error handling built-in |
| MongoDB | Flexible schema fits chat data (varied message types, reactions) |
| Socket.io | Reliable WebSocket abstraction with fallback to polling |
| JWT + HTTP-only cookies | Stateless auth with XSS protection for refresh tokens |
| Vercel proxy for API | Avoids cross-site cookie blocking without requiring a custom domain |
| npm workspaces | Single repo for client and server, shared scripts |
| Brevo instead of nodemailer | Render free tier blocks outbound SMTP ports |

## ⚠️ Known Limitations

- **In-memory online users state** — the server tracks online users in a `Map`. If the backend restarts, all users appear offline until they reconnect. A production-ready solution would use Redis.
- **Email in spam** — transactional emails (verification, password reset) may land in spam without a custom verified domain on Brevo.
- **Free tier cold start** — the backend is hosted on Render free tier, which may take 30–60 seconds to start after inactivity. The frontend shows a loading screen until the backend is ready.

## 🎯 Portfolio Notes

This project was built to demonstrate full-stack product development across multiple interacting concerns:

- **Most technically challenging:** Google OAuth token flow with cross-site cookie handling across Vercel + Render, and real-time socket reconnect behavior.
- **Skills demonstrated:** REST API design, WebSocket architecture, auth flows, file uploads, i18n, responsive UI, automated testing, deployment configuration.
- **Known tradeoffs:** Prioritized feature completeness and architectural clarity over production scalability (no Redis, no message queue, no CI/CD pipeline).