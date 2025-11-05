# Secure Medical Storage — One-Link Vercel Setup

## Deploy
1) Push this folder to a new GitHub repo
2) On Vercel: New Project → Import → select repo
3) Add Environment Variables in Vercel Project Settings:
   - MONGODB_URI
   - JWT_SECRET
4) Deploy. Your app will be at https://<project>.vercel.app and APIs at /api/*.

## Local dev (optional)
- Frontend: cd client && npm install && npm start
- API (serverless): npx vercel dev  (requires Vercel CLI)
