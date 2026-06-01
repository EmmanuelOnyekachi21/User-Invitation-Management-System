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

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/login/` | Login | Public |
| POST | `/api/v1/auth/token/refresh/` | Refresh access token | Public |
| POST | `/api/v1/auth/logout/` | Logout | Authenticated |
| GET | `/api/v1/dashboard/stats/` | Invitation stats | Admin |
| GET | `/api/v1/users/` | List users | Admin |
| PATCH | `/api/v1/users/<id>/role/` | Update user role | Admin |
| PATCH | `/api/v1/users/<id>/status/` | Update user status | Admin |
| GET | `/api/v1/invitations/` | List invitations | Admin |
| POST | `/api/v1/invitations/` | Create invitation | Admin |
| POST | `/api/v1/invitations/validate-token/` | Validate invite token | Public |
| POST | `/api/v1/invitations/accept/` | Accept invitation | Public |
| DELETE | `/api/v1/invitations/<id>/revoke/` | Revoke invitation | Admin |
| GET | `/api/v1/audit-logs/` | List audit logs | Admin |

---

## Frontend Pages

| Route | Description | Access |
|---|---|---|
| `/login` | Login page | Public |
| `/register?token=` | Invitation registration | Public |
| `/check-email` | Post-registration confirmation | Public |
| `/dashboard` | Role-aware dashboard | Authenticated |
| `/invite` | Send invitation form | Admin |
| `/users` | User management table | Admin |
| `/invitations` | Invitations list | Admin |
| `/audit-logs` | Audit log viewer | Admin |

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

**1. No open registration**
I decided not to build a public signup page. The only way to create an account is through an invite link sent by an admin. This made sense to me because the system is meant to be controlled. You don't want random people signing up.

**2. Skipped email verification**
I skipped the email verification step after registration. My thinking was: if the invite link was sent to your email and you clicked it, that's already proof you own the email. Sending another verification email on top of that felt unnecessary and a bit annoying for the user.

**3. Only admins can do admin things**
Things like sending invites, managing users, viewing audit logs — all of that is locked to admin accounts only. Regular users just see a basic dashboard. I felt this was the whole point of having roles in the first place.

**4. Status field controls login, not is_active**
Django has a built-in `is_active` field that controls whether a user can log in. I kept it but made it follow the `status` field automatically. So if someone is banned, `is_active` becomes false on its own. I also had to work around Django's default login function because it was swallowing the real error — it would just say "wrong credentials" even when the account was banned. I fixed that by checking things manually.

**5. Where tokens are stored**
The short-lived access token goes in localStorage, the refresh token goes in an HTTP-only cookie. I know localStorage isn't the safest place for tokens (it can be read by JavaScript on the page), but it's a common pattern and acceptable for this scope.

**6. User IDs are integers, not UUIDs**
I noticed this late. The invitation model uses UUIDs (which is better for security), but the user model still uses regular integer IDs. Changing it after migrations were already created would've meant wiping the database, so I left it and noted it as something to fix properly later.

**7. Banning someone kicks them out immediately (mostly)**
When an admin bans or suspends a user, I blacklist all their refresh tokens right away. Their current session will still work for up to 15 minutes until the access token expires, but that felt like an acceptable tradeoff given how short the token lifetime is.

**8. Page numbers over cursor pagination**
I went with regular page-number pagination (page 1, 2, 3...) instead of cursor-based pagination. Cursor pagination is faster for huge datasets but the UI is less intuitive. For an admin dashboard with a few hundred users, page numbers made more sense.

**9. Audit logs can't be deleted**
The audit log endpoint only supports GET. There's no way to delete or edit logs through the API. I did this on purpose — logs are only useful if nobody can tamper with them.

**10. Role checks on the frontend are just for show**
I decode the JWT on the frontend to decide what to show or hide in the UI (like hiding admin buttons from regular users). But this is purely cosmetic. The real permission checks happen on the backend for every request. The frontend check is just so the UI doesn't look broken.
