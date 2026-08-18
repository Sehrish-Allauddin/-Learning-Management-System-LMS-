# LMS

React/Vite frontend + Express/Prisma/PostgreSQL backend.

## Configuration

### Frontend
Copy `.env.example` to `.env` and set:

`VITE_API_URL=https://your-api-domain.example`

### Backend
Copy `server/.env.example` to `server/.env` and set a real PostgreSQL `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, and SMTP settings.

## Database

From `server/`:

```bash
npm install
npx prisma generate
npx prisma db push
npm run start
```

For production deployments, set the real `DATABASE_URL` in the hosting environment rather than committing credentials.

## Frontend

From the project root:

```bash
npm install
npm run build
npm run dev
```

The frontend API base URL is controlled by `VITE_API_URL`; there are no required hard-coded production backend URLs.
