# Auto perionica: backend

REST API za aplikaciju auto perionice: klijenti, vozila, usluge, radnici i termini.
Frontend je u posebnom repou: [car-wash-frontend](https://github.com/Sarca03/car-wash-frontend), uživo na https://car-wash-bogdan.netlify.app.

## Tehnologije

Node.js, Express, PostgreSQL (Neon), `pg`, JWT, bcrypt. Server radi na Render-u.

## Rute

Sve rute osim prijave traže `Authorization: Bearer <token>`.

| Ruta | Šta radi |
| --- | --- |
| `POST /api/auth/login` | prijava, vraća JWT |
| `GET /api/auth/me` | ulogovani korisnik |
| `GET/POST/PUT/DELETE /api/clients` | klijenti |
| `GET/POST/PUT/DELETE /api/vehicles` | vozila, plus `GET /api/vehicles/client/:id` |
| `GET/POST/PUT/DELETE /api/services` | usluge |
| `GET/POST/PUT/DELETE /api/workers` | radnici |
| `GET/POST/PUT/DELETE /api/appointments` | termini |
| `GET /api/appointments/stats` | brojevi za pregled; prihod se računa samo od završenih termina |
| `PATCH /api/appointments/:id/status` | samo promena statusa |

## Bezbednost

- Lozinke su heširane bcrypt-om, token ističe posle 7 dana
- Demo nalog može samo da čita: svaki POST, PUT, PATCH i DELETE dobija 403 (`middleware/readOnlyDemo.js`)
- Javna registracija je zatvorena; uključuje se samo sa `ALLOW_REGISTER=true`, a nov nalog je uvek običan radnik
- CORS pušta adresu frontenda (`FRONTEND_URL`) i `localhost:5173`/`5174` za lokalni razvoj

## Pokretanje

```bash
npm install
npm run dev
```

Promenljive: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production` na serveru.
Lokalno se umesto `DATABASE_URL` koriste `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` i `DB_NAME`.
Sve promenljive su u `.env.example`.

Prvo `db/schema.sql`, pa `db/demo-data.sql`. Prvi pravi tabele, drugi puni bazu primerima.

## Autor

Bogdan Šarčević, Užice
