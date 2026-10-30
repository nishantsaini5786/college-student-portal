# College Student Portal

A full-stack starter for a college student portal using HTML, CSS, Vanilla JS, Node.js, Express, MongoDB Atlas and cookie-based authentication.

## What's included
- Public landing page, student registration and login
- Student dashboard and profile
- Admin login and starter admin dashboard/API
- MongoDB/Mongoose student model with bcrypt password hashing
- HttpOnly authentication cookie, CSRF double-submit protection, Helmet, rate limiting, validation and role checks
- Netlify/Render deployment configuration

Academic records (attendance, marks, fees, exams, notices and documents) are represented in the data model/API foundation. They must be entered by an authorized admin; the student UI shows a clear empty state until real records exist. No fake payment or academic success is fabricated.

## Requirements
- Node.js 20+
- MongoDB Atlas database

## Run locally
1. Open a terminal in `backend/`.
2. Copy `.env.example` to `.env` and fill in the values.
3. Run:
   ```bash
   npm install
   npm run dev
   ```
4. In another terminal, open `frontend/` and run:
   ```bash
   python3 -m http.server 5500
   ```
5. Visit `http://localhost:5500`.

For local development, set `FRONTEND_ORIGIN=http://localhost:5500` in `.env`.
The API defaults to `http://localhost:5000/api`.

## Create the first admin
After configuring `.env`, run:
```bash
npm run create-admin
```
The script prompts for an email and password. Never commit admin credentials or `.env`.

## Deployment
### Backend (Render)
- Create a Web Service from the `backend` directory.
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables from `.env.example`.
- Set `NODE_ENV=production`, `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=none`.
- Set `FRONTEND_ORIGIN` to your exact Netlify site origin, e.g. `https://your-site.netlify.app`.
- Set `MONGODB_URI` and a long random `JWT_SECRET`.
- Set `COOKIE_DOMAIN` only if you use a shared custom parent domain. For separate Netlify/Render domains, leave it blank.

### Frontend (Netlify)
- Deploy the `frontend` directory.
- Set `API_BASE_URL` in `frontend/js/config.js` to your Render API URL, e.g. `https://your-api.onrender.com/api`.
- Configure the Netlify publish directory as `frontend`.

### Important cross-site cookie note
Netlify and Render use different site domains. Production cookies need `Secure` and `SameSite=None`; browser third-party-cookie restrictions can still affect cross-site setups. The most reliable production arrangement is to use custom domains under the same registrable domain (for example `portal.example.com` and `api.example.com`) and configure cookie/CORS settings accordingly. Keep HTTPS enabled.

## Security notes
- Passwords are bcrypt-hashed.
- Authentication JWT is stored in an HttpOnly cookie, not localStorage.
- State-changing requests require a CSRF token header matching the readable CSRF cookie.
- CORS allows only the configured frontend origin.
- Student APIs derive the student ID from the verified session; they do not accept a client-supplied student ID.
- This is a strong project foundation, not a substitute for a security audit before real student data is used.
