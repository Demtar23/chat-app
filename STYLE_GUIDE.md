# STYLE_GUIDE.md — Coding Conventions & Standards

This document defines the strict coding conventions and standards for both human developers and AI agents working on the chat application codebase. Every new file, feature, or bug fix must adhere strictly to these rules.

---

## 1. Naming Conventions

### 1.1 — Variables
- **CamelCase for standard variables**: Always use camelCase for variables, objects, and properties.
  - *Correct*: `accessToken`, `isRoomsLoading`, `currentUserId`.
  - *Incorrect*: `access_token`, `IsRoomsLoading`, `currentuserid`.
- **Boolean prefixes**: Boolean variables must be prefixed with `is`, `has`, `should`, or `can` to clarify intent.
  - *Correct*: `isDark`, `hasAvatar`, `shouldRedirect`, `canAccess`.
- **Constants**: Global constants and configuration values must use UPPER_SNAKE_CASE.
  - *Correct*: `COOKIE_OPTIONS`, `API_URL`, `MAX_AVATAR_SIZE_MB`.

### 1.2 — Functions
- **CamelCase for functions**: All functions must use camelCase naming.
  - *Correct*: `findUserByUsername`, `verifyEmail`, `getTheme`.
- **Event handlers**: Frontend event handler functions must be prefixed with `handle`.
  - *Correct*: `handleSelectRoom`, `handleLeaveRoom`, `handleSendMessage`.
- **API calls**: Frontend API layer functions must be prefixed with `api`.
  - *Correct*: `apiLogin`, `apiRegister`, `apiFetchMessages`.

### 1.3 — React Components
- **PascalCase for components**: React components must use PascalCase.
  - *Correct*: `Sidebar`, `MessageList`, `ThemeToggle`.
- **Matching filenames**: The file name must match the component name exactly.
  - *Correct*: `MessageList.tsx` for the component `MessageList`.

### 1.4 — Hooks
- **CamelCase with `use` prefix**: Custom hooks must start with `use` in camelCase.
  - *Correct*: `useMessages`, `useRooms`, `useSocketListeners`.

### 1.5 — Contexts
- **PascalCase with `Context` suffix**: React context declarations must end with `Context`.
  - *Correct*: `AuthContext`, `ThemeContext`.
- **Accessor hooks**: Each context must expose a corresponding custom hook named `useContextName`.
  - *Correct*: `useAuth` for `AuthContext`, `useTheme` for `ThemeContext`.

### 1.6 — Services
- **CamelCase with `Service` suffix (Server)**: Server-side services must be exported as named constants ending with `Service`.
  - *Correct*: `userService`, `messagesService`, `permissionsService`.

### 1.7 — Socket Handlers
- **CamelCase with `Handler` suffix (Server)**: Socket message handler registration functions must end with `Handler`.
  - *Correct*: `messageHandler`, `typingHandler`, `roomHandler`.

### 1.8 — TypeScript Types and Interfaces
- **PascalCase**: All type aliases and interfaces must use PascalCase.
  - *Correct*: `Room`, `ActiveChat`, `OnlineUser`.
- **Mongoose interfaces**: Server-side Mongoose document interfaces must start with an `I` prefix and extend `Document`.
  - *Correct*: `export interface IUser extends Document { ... }`.
- **Client-side types**: Prefer type aliases (`type`) over interfaces for data structures, props, and states.
  - *Correct*: `export type Room = { ... }` or `type Props = { ... }`.

---

## 2. No Hardcoding Rules

### 2.1 — User-Facing UI Text
- **No hardcoded text**: All UI text displayed to the user must be translated.
- **react-i18next usage**: Use the `useTranslation` hook in React components and fetch translations from local dictionaries.
  - *Correct*: `const { t } = useTranslation();` → `<span>{t('chat.sidebar.rooms')}</span>`.
  - *Incorrect*: `<span>Rooms</span>`.
- **Server translations**: Email notifications and templates sent by the backend (e.g., verification links) must respect the user's `locale` parameter (`'en' | 'uk'`) passed from the frontend.

### 2.2 — Colors
- **No inline hex or color utility classes**: Never hardcode hex codes (e.g., `#1a1d24`) or ad-hoc Tailwind color classes (e.g., `text-blue-500`, `bg-gray-800`) directly inside component styling.
- **Theme token usage**: Always retrieve the active theme tokens using `getTheme(isDark)` and apply style classes dynamically.
  - *Correct*:
    ```typescript
    const theme = getTheme(isDark);
    return <div className={theme.bgPrimary}>{/* ... */}</div>;
    ```

### 2.3 — URLs
- **No hardcoded API/socket domains**: The client application must read URLs from environment variables (`import.meta.env`).
  - *Correct*: `const API_URL = import.meta.env.VITE_API_URL;`
  - *Incorrect*: `const API_URL = 'http://localhost:5000/api';`

### 2.4 — Magic Values
- **No magic numbers/strings**: Define all timeouts, retry counts, pagination sizes, and database boundaries as constants.
  - *Correct*: `const MESSAGE_PAGE_SIZE = 30;`
  - *Incorrect*: `const messages = await getMessages(beforeId, 30);`

---

## 3. React Rules

### 3.1 — Component Organization
- **Named exports**: Always use named exports for components, not default exports.
  - *Correct*: `export function Sidebar() { ... }`
  - *Incorrect*: `export default function Sidebar() { ... }`
- **Internal components**: If a sub-component is only used within a single page, place it in the page's local `components/` subdirectory (e.g. `client/src/components/Chat/components/Sidebar.tsx`).

### 3.2 — State Management
- **Context for global state**: Global state must be scoped to dedicated Context Providers (`AuthProvider`, `ThemeProvider`).
- **Hooks for business logic state**: Use domain hooks (`useRooms`, `useMessages`) to encapsulate and manage related state variables, fetching routines, and socket lifecycle hooks.
- **No external stores**: Do not introduce Redux, Zustand, Recoil, or any other third-party state managers.

### 3.3 — Separation of UI and Business Logic
- **Thin visual components**: Components should be clean visual structures. They must delegate side effects, complex mutations, and API requests to hooks or external helper functions.
- **No direct API calls in JSX**: Never trigger a fetch call or update active socket connections directly from the component's event triggers. Call functions returned by hooks or helper interfaces instead.

---

## 4. TypeScript Rules

### 4.1 — Typing Requirements
- **Explicit typing**: Define types for all function signatures (parameters and returns) and component inputs (`Props`).
- **Interface/Type definitions**: Avoid implicit type coercion or `any` casting.

### 4.2 — Avoid `any`
- **Zero `any` policy**: The `any` type is strictly prohibited in the codebase.
- **Alternative typings**: Use `unknown`, generic parameters (`<T>`), or declare specific union/intersection types if a runtime type is variable.

### 4.3 — Shared Types Strategy
- **Client-Server sync**: When adding a socket payload, amending a database model, or modifying an API payload schema, you must update the type definitions in both workspaces:
  - `client/src/types/`
  - `server/src/types/`

---

## 5. API Rules

### 5.1 — API Layer Conventions
- **Module separation**: Frontend API functions must be organized in files corresponding to backend controllers (`client/src/api/auth.api.ts`, `rooms.api.ts`, etc.).
- **Response validation**: Check response status (`res.ok`) and parse errors properly.
  ```typescript
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }
  ```

### 5.2 — `fetchWithAuth` Usage
- **Authenticated requests**: All client-side HTTP calls requiring authentication MUST be executed using `fetchWithAuth(url, options, accessToken)`.
- **Silent token refresh**: Do not write custom retry loops. `fetchWithAuth` automatically handles silent refresh via httpOnly cookies and queues requests if a refresh token rotation is underway.

### 5.3 — Backend Error Handling
- **catchError wrapper**: All Express controllers in routing modules must be wrapped in the `catchError` wrapper to forward errors to the middleware chain.
  - *Correct*: `authRouter.post('/login', catchError(authController.login));`
- **AppError usage**: Throw typed subclasses of `AppError` (e.g., `NotFoundError`, `UnauthorizedError`, `ConflictError`) in backend services. Do not throw raw generic errors.

---

## 6. Socket Rules

### 6.1 — Event Naming
- **Structured namespacing**: Socket events must use clear namespaces separated by colons or simple action descriptors.
  - *Server-bound examples*: `send_message`, `room:message:send`, `private:send`, `typing:start`, `room:join`.
  - *Client-bound examples*: `receive_message`, `room:message:receive`, `private:receive`, `message:edited`.

### 6.2 — Payload Typing
- **Explicit interfaces**: Define explicit types for socket payloads on both client and server sides. Do not emit untyped objects.

### 6.3 — Listener Cleanup
- **No dangling handlers**: Every socket event listener registered on the client must be managed within a React `useEffect` scope and unregistered during cleanup.
  ```typescript
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('event:name', handler);

    return () => {
      socket.off('event:name', handler);
    };
  }, [handler]);
  ```

---

## 7. Styling Rules

### 7.1 — Theme-First Approach
- **Dynamic classes**: Retrieve CSS style mappings using `getTheme(isDark)`. The configuration maps standard background, text, border, and brand categories into dynamic Tailwind tokens.

### 7.2 — Responsive Design
- **Mobile responsiveness**: Verify visual components on mobile devices. Use responsive design utilities (e.g. `sm:`, `md:`) or the `useBreakpoint` hook to toggle sidebars, menus, and detail panels.

### 7.3 — Reusable UI Patterns
- **Primitive extraction**: Isolate standard visual layouts, buttons, cards, skeletons, and icons into standalone, stateless primitives (e.g., `Avatar.tsx`, `AppLoader.tsx`, `ChatSkeletons.tsx`).

---

## 8. Testing Rules

### 8.1 — When Tests Are Required
- **Services & controller business logic**: When creating new services, utility helpers, permissions, validation schemas, or API modules, you must write corresponding test suites.
- **Location**:
  - Backend tests: `server/src/tests/` using Jest.
  - Frontend tests: `client/src/tests/` using Vitest + React Testing Library.

### 8.2 — When Tests Are Optional
- **Presentation layers**: Tests are optional for pure visual presentation updates, component markup, static style classes, and translation changes where core logic is unchanged.

---

## 9. File Organization Rules

### 9.1 — Folder Structure
Follow the established monorepo structure:
- **`client/src/`**:
  - `api/` — API fetch endpoints.
  - `components/` — React UI components.
  - `context/` — Context providers.
  - `hooks/` — Custom hooks.
  - `i18n/` — Translation files.
  - `styles/` — Global styling and themes.
  - `types/` — Type declarations.
- **`server/src/`**:
  - `controllers/` — Route controllers.
  - `errors/` — Custom error classes.
  - `middlewares/` — Express middlewares.
  - `models/` — Mongoose schemas.
  - `routes/` — HTTP routers.
  - `services/` — Database query operations.
  - `socket/` — Real-time event handlers.

### 9.2 — Import Ordering
Keep imports organized in the following order:
1. Third-party packages (React, React Router, Express, Mongoose, etc.).
2. Core context / custom hooks / local API functions.
3. Component primitives.
4. Themes, helpers, and assets.
5. TypeScript interfaces and type definitions.

---

## 10. AI Agent Specific Rules

- **Preserve Architecture**: Do not modify Mongoose model schemas, JWT configurations, or API middlewares without validating all downstream impacts.
- **Avoid Unnecessary Refactors**: Do not rewrite or restyle adjacent blocks of code. Limit the blast radius of changes strictly to what was requested.
- **Consistency First**: Replicate the structure of existing files. When adding a route, duplicate the schema, validation, route declaration, controller format, service layer, and client hook pattern.
- **Check Existing Utilities**: Do not add new NPM packages or write custom helper utilities before checking if they already exist in `RULES.md` / `CLAUDE.md` (e.g. Zod, Lucide, Lottie, catchError, permissionsService).
