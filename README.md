# User Invitation Management System

A role-based user invitation and management system built with Django REST Framework and React.

---

## Tech Stack

- Backend: Python 3.12, Django 6, Django REST Framework
- Frontend: React 19 (Vite), Bootstrap 5
- Database: PostgreSQL 16
- Auth: JWT via djangorestframework-simplejwt
- Containerization: Docker + Docker Compose

---

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed on your machine

### Steps

1. Clone the repository
   ```bash
   git clone <repo-url>
   cd <repo-name>
   ```

2. Create the backend environment file
   ```bash
   cp backend/.env.example backend/.env
   ```

3. Fill in all values in `backend/.env` (see Environment Variables section below)

4. Build and start all services
   ```bash
   docker-compose up --build
   ```

5. Run database migrations
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

6. Create the initial admin user
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

7. Access the application
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api/v1/

---

## Environment Variables

All variables live in `backend/.env`. A template with empty values is committed at `backend/.env.example`.

| Variable | Description | Example |
|---|---|---|
| `SECRET_KEY` | Django secret key | long random string |
| `DEBUG` | Debug mode | `true` / `false` |
| `POSTGRES_DB` | PostgreSQL database name | `elevare_db` |
| `POSTGRES_USER` | PostgreSQL username | `elevare` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `yourpassword` |
| `DATABASE_HOST` | PostgreSQL host (use `db` inside Docker) | `db` |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `JWT_ACCESS_TOKEN_MINUTES` | Access token lifetime in minutes | `15` |
| `JWT_REFRESH_TOKEN_DAYS` | Refresh token lifetime in days | `7` |
| `FRONTEND_URL` | Frontend base URL for invitation links | `http://localhost:5173` |
| `EMAIL_FROM` | Sender address for invitation emails | `noreply@example.com` |

> Note: In development, emails are printed to the Docker terminal log. No SMTP configuration is required.

---

## Assumptions Made During Development

**1. Invitation-only registration**
There is no open registration endpoint. Users can only join the platform via an invitation sent by an Admin. This was a deliberate design decision — the invitation link sent to an email address serves as implicit email verification. Sending a separate verification email after registration would be redundant and add unnecessary friction.

**2. Email verification skipped**
Following from the above, email verification as a separate step was omitted. The invitation token is tied to a specific email address. Completing registration through that link is sufficient proof of email ownership.

**3. Admin-only invitation privileges**
Only users with the `ADMIN` role can send invitations, view the user list, and manage roles and statuses. Regular users see a limited dashboard with no administrative actions.

**4. Status as source of truth for account access**
The `status` field (`ACTIVE`, `BANNED`, `SUSPENDED`, `PENDING_VERIFICATION`) drives whether a user can log in, rather than Django's built-in `is_active` flag. The `is_active` field is kept in sync automatically via the model's `save()` method to maintain compatibility with Django internals.

**5. Token storage**
Access tokens are stored in `localStorage`. Refresh tokens are stored in HTTP-only cookies. This is a known tradeoff — `localStorage` is accessible to JavaScript and carries XSS risk. For the scope of this project this is acceptable. In production, access tokens should be stored in memory only.

**6. Integer primary keys on User model**
The `User` model uses Django's default integer primary key rather than UUID. This is a known limitation — the `Invitation` model uses UUID PKs via the shared `TokenBaseModel`. Migrating the User model to UUID after initial migrations would require a destructive migration, which was deferred given the development timeline.

**7. Session invalidation on ban/suspend**
When a user's status is set to `BANNED` or `SUSPENDED`, all their outstanding refresh tokens are immediately blacklisted. Their current access token will expire naturally within 15 minutes (the configured lifetime). This is an acceptable window given the short token lifetime.

**8. Pagination**
All list endpoints use page-number pagination with a default page size of 10. Cursor-based pagination would be more performant at scale but page-number pagination was chosen for its simpler UX (page numbers vs next/previous only) given the expected dataset size.
