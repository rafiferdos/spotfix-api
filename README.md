# 🛠️ Spotfix - Backend API

Spotfix is a robust, modular, and scalable backend service for an on-demand service booking platform. It features a strict state-machine-driven booking lifecycle, secure role-based access control (RBAC), and fully automated Stripe payment integrations via webhooks.

## ✨ Key Features

- **Role-Based Access Control (RBAC):** Distinct authorization flows for `ADMIN`, `TECHNICIAN`, and `CUSTOMER`.
- **Strict State Machine Validation:** Booking lifecycles are tightly controlled (`REQUESTED` ➔ `ACCEPTED` ➔ `PAID` ➔ `IN_PROGRESS` ➔ `COMPLETED`).
- **Secure Payments:** End-to-end Stripe checkout session integration.
- **Webhook Security:** Automated payment confirmations via Stripe webhooks using `express.raw` for signature verification.
- **Concurrent Booking Prevention:** Intelligent checks to prevent multiple active bookings for the same schedule.

## 💻 Tech Stack

- **Runtime environment:** Node.js
- **Framework:** Express.js (TypeScript)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Payments:** Stripe API & Stripe CLI
- **Package Manager:** pnpm

## 📂 Resource-Based Folder Structure

The application follows a clean, resource-based architecture mapping directly to the API endpoints:

```text
src/
 ├── app/
 │   ├── modules/
 │   │   ├── auth/           # Registration, Login, Token generation
 │   │   ├── admin/          # Category creation, User management
 │   │   ├── technician/     # Profile, Availability, Job assignment
 │   │   ├── service/        # Service catalogs
 │   │   ├── booking/        # Core state-machine logic
 │   │   ├── payment/        # Stripe sessions and webhook handlers
 │   │   └── review/         # Post-completion ratings
 │   ├── middlewares/        # Global error handlers, Auth guards
 │   └── routes/             # Central API router
 └── server.ts               # Application entry point
```

## 🚀 Installation & Local Setup

**1. Clone the repository and install dependencies:**

```bash
git clone <repository_url>
cd spotfix-backend
pnpm install
```

**2. Configure Environment Variables:**
Create a `.env` file in the root directory and configure the following variables:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="your_database_connection_string"

# Authentication
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="7d"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**3. Database Setup (Prisma):**

```bash
pnpm prisma generate
pnpm prisma db push
```

**4. Start the Development Server:**

```bash
pnpm run dev
```

The server should now be running on `http://localhost:5000`.

## 💳 Stripe Webhook Setup (Local Testing)

To test the payment completion flow locally, you need to forward Stripe events to your local endpoint.

1. Ensure you have the [Stripe CLI](https://stripe.com/docs/stripe-cli) installed and authenticated.
2. Open a new terminal window and run the pre-configured webhook script:

```bash
pnpm run stripe:webhook
```

_(This executes: `stripe listen --forward-to localhost:5000/api/payments/confirm`)_

3. Copy the `whsec_...` webhook secret provided in the terminal output and update your `.env` file with it.

## 🔄 Booking State Machine Flow

The backend enforces strict validation for booking statuses. Manual transitions bypassing the flow will throw a `403 Forbidden` error.

1.  **REQUESTED:** Initial state when a customer creates a booking.
2.  **ACCEPTED / DECLINED:** Technician reviews the request. (Cannot bypass to PAID).
3.  **PAID:** Automatically updated by the Stripe Webhook upon successful payment.
4.  **IN_PROGRESS:** Technician starts the job.
5.  **COMPLETED:** Technician finishes the job (Terminal state).
6.  **CANCELLED:** If the user backs out before payment (Terminal state).

_Note: Customers can safely create a new booking for the same service if their previous booking is in a terminal state._

## 📚 API Documentation

The complete API reference is maintained in **Apidog / Postman**. Import the collection to access request payloads, authorization headers, and response schemas for all endpoints mapped to the resource structure mentioned above.

---

_Built with ❤️ by Rafi Ferdos_
