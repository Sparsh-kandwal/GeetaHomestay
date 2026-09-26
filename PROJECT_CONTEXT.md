# PROJECT_CONTEXT.md — Geeta Homestay

> **Read this file before touching any code.** It describes the full stack
> of a production homestay-booking web app (React + Express + MongoDB) with
> Razorpay payments and Google OAuth.

---

## 1. Project Overview

Geeta Homestay is a full-stack room-booking application for a real homestay
business located in Karanprayag, Uttarakhand, India. Guests browse available
rooms, select check-in/check-out dates, add rooms to a server-side cart,
pay via Razorpay, and receive a booking confirmation with an emailed invoice.
Authentication is Google OAuth only (authorization-code flow), with a JWT
stored in an httpOnly cookie. The app is deployed on Vercel (separate
projects for frontend and backend).

---

## 2. Architecture

| Layer | Stack |
|---|---|
| **Frontend** | React 18 + Vite 6, React Router v7, TailwindCSS 3, Framer Motion, Swiper, `react-toastify` / `react-hot-toast` |
| **Backend** | Node.js + Express 4 (ES Modules), Mongoose 8 (MongoDB Atlas) |
| **Database** | MongoDB Atlas (`GeetaHomeStay` database in cluster `GeetaHomeStayCLuster`) |
| **Auth** | Google OAuth 2.0 (auth-code flow via `@react-oauth/google`) → backend exchanges code → issues JWT in httpOnly cookie (`accessToken`) |
| **Payments** | Razorpay (test keys currently) — Checkout SDK loaded via `<script>` tag |
| **Email** | Nodemailer → Brevo (Sendinblue) SMTP relay |
| **Images** | Cloudinary CDN (`VITE_CLOUDINARY_CLOUD` env var), with responsive transforms applied client-side |
| **Deployment** | Vercel (both frontend and backend have `vercel.json`) |
| **Analytics** | Google Analytics (gtag `G-SNFQV9XWVH`) + Google Ads conversion snippet |

### Communication

- **Protocol**: REST (JSON bodies). No GraphQL or WebSocket.
- **Base URL**: `VITE_BACKEND_URL` (default `http://localhost:5000`)
- **Auth transport**: httpOnly cookie named `accessToken` (JWT, 5-day expiry). Every protected request uses `credentials: "include"`.
- **CORS**: Backend allows only `CLIENT_URL` (from `.env`). Credentials are enabled.

### Dev servers

```
frontend:  npm run dev   →  Vite on http://localhost:5173
backend:   npm run dev   →  Nodemon on http://localhost:5000
```

---

## 3. Folder Structure

```
GeetaHomestay/
├── frontend/
│   ├── public/                  # Static assets (logos, images, maintenance page)
│   │   └── static/              # Room images, mountain backgrounds, user avatar fallback
│   ├── src/
│   │   ├── App.jsx              # Router setup, provider wrappers, animated route transitions
│   │   ├── main.jsx             # ReactDOM entry — wraps App in UserProvider + RoomProvider
│   │   ├── auth/
│   │   │   ├── Userprovider.jsx # UserContext + RoomContext (fetches user profile & room list)
│   │   │   └── api.jsx          # Axios instance for /auth endpoints
│   │   ├── contexts/
│   │   │   ├── CartContext.jsx   # Client-side cart context (localStorage, add/remove/clear)
│   │   │   └── DateContext.jsx   # Shared check-in / check-out date state
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # Landing page — fullscreen morning town hero, homestay story, room preview, location, facilities, testimonials
│   │   │   ├── Rooms.jsx         # Room collection page — boutique 1/2/3 responsive grid, live date search, and filters
│   │   │   ├── RoomDetails.jsx   # Room detail + booking card (add to cart / buy now)
│   │   │   ├── BookingConfirmation.jsx  # Post-payment success page
│   │   │   ├── BookingHistory.jsx       # Lists all user bookings, retry pending payments
│   │   │   └── Profile.jsx             # User profile (read-only currently)
│   │   ├── components/           # 20 reusable UI components (see §4 for key ones)
│   │   ├── constants/
│   │   │   └── PopularSites.jsx  # Array of nearby tourist attractions (Cloudinary images)
│   │   └── utils/
│   │       ├── Payment.jsx       # checkouthandler() — Razorpay checkout flow
│   │       └── roomData.js       # normalizeRoom, buildAssetUrl, slug helpers
│   ├── index.html               # Loads Google Fonts, gtag, Razorpay checkout script
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── vercel.json              # SPA rewrite rule
│
├── backend/
│   ├── app.js                   # Express entry — CORS, cookie-parser, MongoDB connect, route mounts
│   ├── routes/
│   │   ├── routes.js            # Main routes (rooms, cart, booking, availability, email, testimonials)
│   │   ├── authrouter.js        # /auth (google login, profile, logout)
│   │   └── payment_routes.js    # /payment (checkout, verification, status, rollback)
│   ├── controllers/
│   │   ├── authController.js    # Google OAuth exchange, JWT issue, welcome email
│   │   ├── cartController.js    # addToCart, getCart, updateCart, changeMember, deleteFromCart
│   │   ├── book.js              # createOrder — moves cart → pending bookings + BookedDates
│   │   ├── paymentController.js # Razorpay order creation, signature verification, key endpoint
│   │   ├── bookingController.js # getUserBookings, bookingFailed (rollback)
│   │   ├── availabilityController.js  # Room availability check
│   │   ├── roomData.js          # getAllRooms
│   │   ├── EmailController.js   # sendInvoice (manual) + sendInvoiceForBookingId (auto)
│   │   └── TestimonialController.js   # getAllTestimonials
│   ├── models/                  # Mongoose schemas (see §5)
│   ├── middleware/
│   │   └── auth.js              # verifyToken — JWT from cookie, attaches req.user
│   ├── utils/
│   │   ├── roomAvailability.js  # calculateRoomAvailability() — core availability logic
│   │   ├── rollbackBookings.js  # rollbackBookings() — cancels pending bookings + frees dates
│   │   └── MailClient.js        # Nodemailer transporter (Brevo SMTP)
│   ├── constants/
│   │   ├── EmailTemplate.js     # Welcome email HTML template
│   │   └── InvoiceTemplate.js   # Booking invoice HTML template
│   ├── Dockerfile
│   └── vercel.json              # Vercel serverless config
│
└── PROJECT_CONTEXT.md           # ← You are here
```

---

## 4. Core Features

| Feature | Frontend files | Backend files |
|---|---|---|
| **Google OAuth login** | `Navbar.jsx`, `RoomDetails.jsx` (inline login), `auth/api.jsx`, `auth/Userprovider.jsx` | `controllers/authController.js`, `routes/authrouter.js`, `middleware/auth.js` |
| **Room listing** | `pages/Rooms.jsx`, `components/ExploreRooms.jsx`, `components/RoomCard.jsx`, `components/SearchFilter.jsx`, `components/SearchBar.jsx` | `controllers/roomData.js` (GET `/allRooms`) |
| **Room detail + gallery** | `pages/RoomDetails.jsx`, `components/BookingFlowIndicator.jsx` | — (room data already fetched) |
| **Date-aware availability** | `pages/RoomDetails.jsx` (checks before add-to-cart) | `controllers/availabilityController.js`, `utils/roomAvailability.js` |
| **Server-side cart** | `components/Cart.jsx`, `components/Cartitem.jsx` | `controllers/cartController.js`, `models/cart.js` |
| **Booking creation** | `components/Cart.jsx` → calls `/bookroom` | `controllers/book.js`, `models/booking.js`, `models/bookedDates.js` |
| **Razorpay payment** | `utils/Payment.jsx` (checkouthandler), `components/Cart.jsx`, `pages/BookingHistory.jsx` | `controllers/paymentController.js`, `models/paymentmodel.js` |
| **Payment rollback** | — (server-side) | `utils/rollbackBookings.js`, `controllers/bookingController.js` |
| **Booking confirmation** | `pages/BookingConfirmation.jsx` | — (renders from router state) |
| **Booking history** | `pages/BookingHistory.jsx`, `components/BookingCard.jsx` | `controllers/bookingController.js` (POST `/bookings`) |
| **Invoice email** | — (auto-triggered after payment) | `controllers/EmailController.js`, `constants/InvoiceTemplate.js`, `utils/MailClient.js` |
| **Welcome email** | — (auto-triggered on first login) | `controllers/authController.js`, `constants/EmailTemplate.js` |
| **Testimonials** | `components/Testimonials.jsx`, `components/TestimonialCard.jsx` | `controllers/TestimonialController.js`, `models/Testimonials.js` |
| **Nearby attractions carousel** | `components/HomeCarousel.jsx`, `constants/PopularSites.jsx` | — (static data) |
| **User profile** | `pages/Profile.jsx` | `controllers/authController.js` (getMyprofile) |

---

## 5. Data Models / Schemas

### User (`models/user.js`)
| Field | Type | Notes |
|---|---|---|
| `userName` | String | Required |
| `email` | String | Required, unique |
| `phoneNumber` | String | Optional |
| `photo` | String | Google profile picture URL |
| `timestamps` | — | Auto `createdAt`, `updatedAt` |

### Room (`models/room.js`)
| Field | Type | Notes |
|---|---|---|
| `id` | String | Unique room identifier (acts as `roomType` key) |
| `name` | String | Display name |
| `price` | Number | Per night (INR) |
| `image` | String | Cloudinary path |
| `description` | String | — |
| `amenities` | `[{name, icon}]` | Array of amenity objects |
| `maxGuests` | Number | Max guests per room |
| `totalRooms` | Number | Total inventory count |
| `gallery` | `[String]` | Array of Cloudinary image paths |

### Booking (`models/booking.js`)
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | — |
| `bookingId` | ObjectId | Groups multiple room bookings from a single cart checkout |
| `roomType` | String | — |
| `members` | Number | Guest count |
| `checkIn` | Date | — |
| `checkOut` | Date | — |
| `roomsBooked` | Number | — |
| `totalAmount` | Number | — |
| `discount` | Number | Default 0 |
| `paymentStatus` | Enum | `pending` / `confirmed` / `cancelled` |
| `emailSent` | Boolean | Invoice email flag |
| `createdAt` | Date | — |

### Cart (`models/cart.js`)
| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId → User | — |
| `roomType` | String | — |
| `members` | Number | — |
| `checkIn` | Date | — |
| `checkOut` | Date | — |
| `quantity` | Number | Rooms requested |

### BookedDate (`models/bookedDates.js`)
| Field | Type | Notes |
|---|---|---|
| `date` | Date | Single calendar day |
| `roomType` | String | — |
| `quantity` | Number | Rooms booked on that date |

> **Purpose**: Tracks per-day room occupancy. The availability engine
> (`utils/roomAvailability.js`) uses this to calculate remaining rooms.

### Payment (`models/paymentmodel.js`)
| Field | Type | Notes |
|---|---|---|
| `razorpay_order_id` | String | — |
| `razorpay_payment_id` | String | — |
| `razorpay_signature` | String | — |
| `user` | ObjectId → User | — |
| `amount` | Number | In rupees (divided by 100 from paise) |
| `currency` | String | Default `INR` |
| `status` | Enum | `created` / `success` / `failed` / `refunded` |
| `payment_method` | String | — |
| `receipt` | String | — |
| `createdAt` | Date | — |

### Testimonial (`models/Testimonials.js`)
| Field | Type | Notes |
|---|---|---|
| `username` | String | — |
| `testimonial` | String | — |
| `rating` | String | — |
| `image` | String | — |

### Key Relationships

```
User ──1:N──> Booking
User ──1:N──> Cart
User ──1:N──> Payment
Booking.bookingId groups multiple Booking docs from a single checkout
BookedDate is a denormalized day-level occupancy counter (not linked by FK)
```

---

## 6. API Endpoints

### Auth — prefix `/auth`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/google` | No | Exchange Google auth code → create/update user → set JWT cookie → return user |
| POST | `/auth/profile` | JWT | Get current user profile |
| POST | `/auth/logout` | JWT | Clear `accessToken` cookie |

### Main — prefix `/`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/status` | No | Health check |
| GET | `/allRooms` | No | All rooms sorted by price descending |
| GET | `/testimonials` | No | All testimonials |
| POST | `/checkAvailability` | JWT | `{checkIn, checkOut}` → room availability map |
| POST | `/addToCart` | JWT | `{members, checkIn, checkOut, roomType, quantity}` → add/merge cart item |
| GET | `/getCart` | JWT | Returns `{available[], removed[], price}` — auto-adjusts for availability |
| POST | `/updateCart` | JWT | `{updates: [{roomType, quantity, members, checkIn, checkOut}]}` → batch update |
| POST | `/changeQuantity` | JWT | `{roomType, members, checkIn, checkOut}` → update member count |
| POST | `/deleteFromCart` | JWT | `{roomType, checkIn, checkOut}` → remove item |
| POST | `/bookroom` | JWT | Convert cart → pending Booking docs + BookedDate entries |
| POST | `/bookings` | JWT | Get user's booking history (confirmed + recent pending) |
| POST | `/email` | No | `{bookingId}` → send invoice email |

### Payment — prefix `/payment`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/payment/checkout` | No | `{amount}` → create Razorpay order |
| POST | `/payment/paymentVerification` | No | Verify Razorpay signature → confirm bookings → send invoice → clear cart |
| GET | `/payment/getKey` | No | Return Razorpay public key |
| POST | `/payment/rollbackBooking` | No | `{userId, bookingId}` → rollback failed booking |
| POST | `/payment/checkPaymentStatus` | No | `{paymentId, userId, bookingId}` → fetch Razorpay status, confirm/rollback |

---

## 7. State Management

| Context / Store | Location | Scope | Persistence |
|---|---|---|---|
| **UserContext** | `auth/Userprovider.jsx` | `{user, setUser, isLoading}` | Cookie-based (JWT); user re-fetched on mount via `/auth/profile` |
| **RoomContext** | `auth/Userprovider.jsx` | `{rooms, setRooms, roomsLoading, fetchRooms}` | `sessionStorage.rooms` |
| **CartContext** | `contexts/CartContext.jsx` | `{cartItems, addToCart, removeFromCart, clearCart}` | `localStorage.cart` — **NOTE**: this is a client-side shadow; the real cart lives on the server |
| **DateContext** | `contexts/DateContext.jsx` | `{checkInDate, setCheckInDate, checkOutDate, setCheckOutDate}` | None (in-memory only) |

### Provider hierarchy (outermost → innermost)

```
UserProvider → RoomProvider → GoogleOAuthProvider → CartProvider → DateProvider → Router
```

> **Important**: The server-side cart (`/getCart`, `/addToCart`, etc.) is the
> source of truth for checkout. The client-side `CartContext` in
> `contexts/CartContext.jsx` is used within `RoomDetails` for local UI but
> the `Cart.jsx` component fetches directly from the server.

---

## 8. Key Conventions

### Naming

- **Backend**: `camelCase` for files (`authController.js`, `cartController.js`); PascalCase for models/templates (`Testimonials.js`, `EmailTemplate.js`)
- **Frontend**: PascalCase for components (`RoomCard.jsx`, `BookingHistory.jsx`); camelCase for utils/contexts (`roomData.js`, `DateContext.jsx`)
- **Routes**: lowercase, no hyphens (`/bookroom`, `/addToCart`, `/allRooms`)
- **Room identity**: `roomType` (string) is the canonical key used across cart, booking, and availability. It maps to `Room.id` in the DB.

### Auth pattern

- `verifyToken` middleware reads JWT from `req.cookies.accessToken`
- If no token is present, middleware calls `next()` (does **not** reject) — controllers must check `req.user?.id` and return 403 themselves
- Frontend always sends `credentials: "include"` with fetch/axios

### Error handling

- Backend returns `{ message: "..." }` for errors; no standard error wrapper
- Frontend uses `toast.error()` / `toast.success()` (mix of `react-toastify` and `react-hot-toast`)
- No global error boundary on the frontend

### Styling

- TailwindCSS 3 utility classes (extensive use of custom color values like `#17322e`, `#1f5b52`, `#8b4e31`, `#f7efe3`)
- Google Fonts: `Merriweather Sans`, `Grand Hotel`
- Rounded card design system: `rounded-[24px]` / `rounded-[28px]` / `rounded-[32px]` with soft shadow patterns
- Color palette: dark teal (`#17322e`, `#1f5b52`, `#295046`) + warm brown/terracotta (`#8b4e31`, `#f1c8af`) + cream/beige (`#f7efe3`, `#fffdf9`, `#faf7f2`)
- Hero styling: Fullscreen viewport height (`h-screen min-h-[660px]`), natural unshadowed morning town photography (`/static/mount1.jpg`), clear screen boundary at the bottom, and transparent text layering with high-contrast text drop shadows rather than solid card backdrops
- Room listing styling: Boutique responsive grid (1 col mobile, 2 col tablet `md:`, 3 col desktop `lg:`), large focal imagery, prominent name and honest price focus, understated bullet-separated text amenities (no fake crossed-out discounts or badge clutter)
- Room details styling: Clean boutique editorial structure — Room identity header (name + honest price) positioned right below navbar → "Reserve your stay" card placed below room name and above room photo on mobile & tablet (`lg:hidden`), while on desktop (`lg:`) it resides in a 2-column layout as a sticky card alongside room story, specs, and amenity list → expanded container max-width (`max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12`) for an expansive desktop view with comfortable side margins. Honest pricing calculation (price × nights × rooms) without inflated strikethroughs or sales-y badges.
- Booking confirmation styling: Warm and personal thank-you note from Geeta Homestay — single clean summary card displaying booking reference ID, total amount paid, room list with formatted date ranges, and an automatic invoice delivery notice. Minimalist design with no stock success graphics, heavy gradients, or filler cards.
- Booking history & card styling: Redesigned to match RoomCard's visual identity — rounded cards (`rounded-[28px] border border-[#ede3d5] bg-white shadow-sm`), `font-merriweather` room titles, and understated palette status badges (`#1f5b52` Confirmed, `#8b4e31` Pending, `#6f746d` Cancelled). Responsive 2-column card grid with intact Razorpay retry-payment functionality.
- Cart & item styling: Clean boutique reservation summary — honest pricing (removed fake 1.4x strikethroughs and savings rows), `font-merriweather` headings and prices, understated text remove controls, and clean responsive stacking for mobile. Includes room count steppers in `Cartitem.jsx` positioned on a dedicated line below the room name/price value with a big font quantity display (`font-merriweather text-xl font-bold text-[#17322e]`). Calls `POST /updateCart` which validates total unbooked date availability directly (without deducting the user's current cart quantity); if room count cannot be increased due to date inventory limits, a clean dark teal/terracotta modal popup (`modalInfo`) overlays the screen with detailed availability information.
- Global Scroll Restoration: `<ScrollToTop />` component rendered inside `<Router>` in `App.jsx` listens to `useLocation().pathname` changes and executes `window.scrollTo(0, 0)` on every page transition, ensuring every navigated page starts at the top.

### Booking flow

```
1. Browse rooms (/rooms)
2. Select room (/rooms/:id) — pick dates, guests, room count
3. Add to cart → server-side cart
4. Review cart (/cart) — adjust quantities
5. Proceed to pay → POST /bookroom (creates pending bookings)
                   → POST /payment/checkout (Razorpay order)
                   → Razorpay SDK modal opens
                   → POST /payment/paymentVerification (signature check)
                   → Bookings confirmed, cart cleared, invoice emailed
6. Confirmation page (/booking-confirmation)
```

### Pending booking timeout

- Pending bookings older than **5 minutes** (`PENDING_VISIBILITY_WINDOW_MS`) are auto-rolled-back (cancelled + BookedDates freed)
- Rollback is triggered lazily when `createOrder` or `getUserBookings` is called — there is no cron/scheduler

### Image handling

- Room images are Cloudinary paths; `utils/roomData.js` builds full URLs with transforms
- `buildRoomCardImageUrl()` applies `w_900,h_620,f_auto,q_auto,c_fill` transforms
- Fallback image: `/static/mount1.jpg`

---

## 9. Known TODOs / Incomplete Areas

| Area | Issue |
|---|---|
| **Client-side CartContext vs server cart** | `contexts/CartContext.jsx` maintains a separate client-side cart (localStorage) that is largely unused by the actual checkout flow. The `Cart.jsx` component fetches from the server. This dual-cart creates confusion. |
| **Profile update** | `Profile.jsx` has a `handleSubmit` that PUTs to `/auth/profile`, but the backend has no PUT handler for that route — form inputs are `disabled` anyway. Profile is read-only in practice. |
| **`verifyToken` is permissive** | If no cookie is present, middleware calls `next()` without setting `req.user`. Some protected routes might not properly guard against unauthenticated access. |
| **Payment routes are unprotected** | `/payment/checkout`, `/payment/paymentVerification`, `/payment/rollbackBooking`, `/payment/checkPaymentStatus` have no auth middleware. |
| **Room model field mismatch** | The Mongoose `Room` model has `maxGuests` and `id`, but some controller code references `room.maxAdults`, `room.discount`, and `room.roomType` which aren't in the schema. The `normalizeRoom()` utility on the frontend patches this. |
| **Mixed toast libraries** | Both `react-toastify` and `react-hot-toast` are imported and used in different components. |
| **No test suite** | `"test": "echo \"Error: no test specified\""` in both packages. |
| **Welcome email** | The `isNewUser` flag in `authController.js` uses `user.wasNew` which is not a standard Mongoose property — the welcome email may never trigger after the first upsert. |
| **Hardcoded inflated price** | Frontend shows a fake "original" price at `1.4×` the actual price in `Cartitem.jsx` and `RoomDetails.jsx`. (Removed from `RoomCard.jsx` which now uses honest boutique pricing). |
| **No admin panel** | Rooms, testimonials, and bookings are managed directly in the database. No CRUD UI for admins. |
| **COOP/COEP headers** | `index.html` sets `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`, which can break the Google OAuth popup flow in some browsers. |

---

## Quick Reference: Environment Variables

### Backend (`.env`)
| Variable | Purpose |
|---|---|
| `PORT` | Express listen port (5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing key |
| `RAZORPAY_KEY_ID` | Razorpay public key (test) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key (test) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth redirect (matches frontend URL) |
| `CLIENT_URL` | Allowed CORS origin (frontend URL) |
| `SMTP_USER` | Brevo SMTP username |
| `SMTP_PASS` | Brevo SMTP password |

### Frontend (`.env`)
| Variable | Purpose |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `VITE_BACKEND_URL` | Backend API base URL |
| `VITE_CLOUDINARY_CLOUD` | Cloudinary base URL for images |
