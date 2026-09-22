# ⬡ Deao Studios Pitch Deck Generator
### pitch.deaostudios.cloud — Internal Tool

AI-powered pitch deck creation in minutes.

## Stack
- **Frontend:** Next.js / React, Chart.js, TailwindCSS
- **Backend:** Node.js / Express, WebSocket
- **AI:** Google Gemini (primary, free tier) + Anthropic Claude (optional)
- **DB:** PostgreSQL
- **Export:** pptxgenjs + pdfkit

## Quick Start (Development)

```bash
# 1. Clone and install
cd backend && npm install
cd ../frontend && npm install

# 2. Configure
cp backend/.env.example backend/.env
# Edit backend/.env — add GEMINI_API_KEY and DATABASE_URL

cp frontend/.env.local.example frontend/.env.local

# 3. Run migrations
cd backend && node utils/migrate.js

# 4. Start (two terminals)
cd backend && npm run dev
cd frontend && npm run dev

# 5. Open http://localhost:3000
# Login: admin@deaostudios.com / deao2024!
```

## AI Providers

| Provider | Cost | Setup |
|---|---|---|
| Google Gemini | Free (1500 req/day) | aistudio.google.com |
| Anthropic Claude | Paid | console.anthropic.com |

The app uses Gemini by default. When Anthropic credits are added, enable Claude via Admin Panel → AI Settings.

## Features
- ✅ Multi-step deck creation form
- ✅ AI brainstorms slide structure, writes content, refines copy
- ✅ 3 visual styles (Modern Tech, Corporate, Creative)
- ✅ Chart.js charts embedded in slides
- ✅ Real-time generation progress via WebSocket
- ✅ Queue management (max 2 concurrent)
- ✅ Export .pptx and .pdf
- ✅ Revision history (3 versions)
- ✅ Multi-user collaboration
- ✅ AI decision logs
- ✅ Admin panel for key management

## Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for full VPS deployment guide.
