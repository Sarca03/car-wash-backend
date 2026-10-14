# Car wash app: backend

REST API for a car wash management app: clients, vehicles, services, staff and bookings.
The frontend is in a separate repo: [car-wash-frontend](https://github.com/Sarca03/car-wash-frontend), live at https://car-wash-bogdan.netlify.app.

The app was made for the local market, so the interface and API messages are in Serbian.

## Stack

Node.js, Express, PostgreSQL (Neon), `pg`, JWT, bcrypt. The server runs on Render.

## Routes

Every route except login needs `Authorization: Bearer <token>`.

| Route | What it does |
| --- | --- |
| `POST /api/auth/login` | login, returns a JWT |
| `GET /api/auth/me` | the logged-in user |
| `GET/POST/PUT/DELETE /api/clients` | clients |
| `GET/POST/PUT/DELETE /api/vehicles` | vehicles, plus `GET /api/vehicles/client/:id` |
| `GET/POST/PUT/DELETE /api/services` | services |
| `GET/POST/PUT/DELETE /api/workers` | staff |
| `GET/POST/PUT/DELETE /api/appointments` | bookings |
| `GET /api/appointments/stats` | numbers for the dashboard; revenue counts only completed bookings |
| `PATCH /api/appointments/:id/status` | status change only |

## Security

- Passwords are hashed with bcrypt, tokens expire after 7 days
- The demo account is read-only: every POST, PUT, PATCH and DELETE gets a 403 (`middleware/readOnlyDemo.js`)
- Public sign-up is closed; it only turns on with `ALLOW_REGISTER=true`, and a new account is always a regular staff member
- CORS allows the frontend address (`FRONTEND_URL`) and `localhost:5173`/`5174` for local development

## Running it

```bash
npm install
npm run dev
```

Variables: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production` on the server.
Locally you can use `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` and `DB_NAME` instead of `DATABASE_URL`.
All of them are listed in `.env.example`.

Run `db/schema.sql` first, then `db/demo-data.sql`. The first creates the tables, the second fills them with sample data.

## Author

Bogdan Šarčević, Užice, Serbia
