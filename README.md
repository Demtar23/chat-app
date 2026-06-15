# 💬 Real-Time Chat Application

A fullstack real-time chat application with support for private messages, group rooms, user profiles, authentication (JWT + Google OAuth), and live updates via WebSockets.

The app includes features such as message reactions, pinning, editing, search, pagination, profile customization, email verification, and responsive UI with theme and localization support.

**Live Demo:** https://chat-app-iota-three-22.vercel.app/chat

**Backend API:** https://chat-app-a77u.onrender.com/api/health

## 🛠️ Technologies Used

### 🎨 Frontend

- React (v19.2.5) — UI library
- React DOM — rendering engine
- TypeScript — static typing
- Vite — build tool & dev server
- React Router DOM — routing
- Tailwind CSS — styling
- Lucide React — icons
- React Toastify — notifications
- Lottie React — animations
- i18next + react-i18next — internationalization
- Socket.io Client — real-time communication

---

### ⚙️ Backend

- Node.js — runtime environment
- Express (v5.2.1) — backend framework
- MongoDB + Mongoose — database & ODM
- Socket.io — real-time communication (WebSockets)
- JWT — authentication (access & refresh tokens)
- Passport.js — Google OAuth authentication
- bcrypt — password hashing
- Zod — schema validation
- Multer — file uploads

---

### 📧 Services & Integrations

- Brevo (Sendinblue API) — email delivery service
- Nodemailer — email sending (development / fallback)
- Google OAuth 2.0 — external authentication provider
- Cloudinary — image storage & management
- ImageKit (CDN / Image Optimization) — image uploads and delivery

---

### 🧰 Development Tools

- npm workspaces — monorepo structure (client + server)
- ESLint — code linting
- Prettier — code formatting
- TypeScript — static type checking

---

### 🚀 Deployment

- Vercel — frontend hosting
- Render — backend hosting

## ⚙️ Setup & Run Locally

### Clone the repository:

```bash
git clone https://github.com/your-username/chat-app.git
cd chat-app

### Install dependencies:

npm install
# or
yarn install

### Environment variables:

Create .env files in both server and client folders.
#server/.env

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


#client/.env

VITE_API_URL=https://your-backend.onrender.com
VITE_SOCKET_URL=https://your-backend.onrender.com
VITE_IMAGE_KIT_URL=your_api_secret


### Run the project locally:

#Backend
cd server
npm run dev
# or
yarn dev

#Frontend
cd server
npm run dev
# or
yarn dev

### Build for production:
#Backend
cd client
npm run build
npm start
# or
yarn build
yarn start

#Frontend
cd client
npm run build
npm run preview
# or
yarn build
yarn preview

```

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
