# DEPLOYMENT.md
# Deao Studios Pitch Deck Generator — Deployment Guide
# pitch.deaostudios.cloud

---

## Prerequisites

- Node.js 18+ (check: `node --version`)
- npm 9+ (check: `npm --version`)
- PostgreSQL 14+ (check: `psql --version`)
- VPS running Ubuntu 22.04+ with at least 2GB RAM

---

## 1. Transfer Project to VPS

```bash
# On your local machine:
scp -r ~/Documents/pitch-deaostudios user@your-vps-ip:~/

# Or via git (recommended):
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/your-org/pitch-deaostudios.git
git push origin main

# On VPS:
git clone https://github.com/your-org/pitch-deaostudios.git
cd pitch-deaostudios
```

---

## 2. Set Up PostgreSQL

```bash
# Install PostgreSQL
sudo apt update && sudo apt install -y postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << 'EOF'
CREATE DATABASE deao_pitch;
CREATE USER deao_user WITH PASSWORD 'your_strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE deao_pitch TO deao_user;
\q
EOF
```

---

## 3. Set Up Backend

```bash
cd ~/pitch-deaostudios/backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
nano .env
```

**Required .env values:**
```
PORT=4000
JWT_SECRET=<generate with: openssl rand -hex 32>
DATABASE_URL=postgresql://deao_user:your_strong_password_here@localhost:5432/deao_pitch
GEMINI_API_KEY=<your Gemini API key from https://aistudio.google.com>
FRONTEND_URL=https://pitch.deaostudios.cloud
```

**Optional .env values:**
```
ANTHROPIC_API_KEY=<add when you have credits>
AI_PROVIDER=auto
DECK_EXPIRY_DAYS=7
```

```bash
# Run database migrations
node utils/migrate.js
# → Creates tables + default admin: admin@deaostudios.com / deao2024!
# → CHANGE THIS PASSWORD after first login!
```

---

## 4. Set Up Frontend

```bash
cd ~/pitch-deaostudios/frontend

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
nano .env.local
```

**.env.local values:**
```
NEXT_PUBLIC_API_URL=https://pitch.deaostudios.cloud/api-backend
NEXT_PUBLIC_WS_URL=wss://pitch.deaostudios.cloud/api-backend
```

*(Or use separate subdomain: api.pitch.deaostudios.cloud)*

```bash
# Build for production
npm run build
```

---

## 5. Create Storage Directories

```bash
mkdir -p ~/pitch-deaostudios/storage/decks
mkdir -p ~/pitch-deaostudios/storage/uploads
chmod 755 ~/pitch-deaostudios/storage/decks
chmod 755 ~/pitch-deaostudios/storage/uploads
```

Update backend `.env`:
```
STORAGE_PATH=../storage
```

---

## 6. Set Up PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start backend
cd ~/pitch-deaostudios/backend
pm2 start main.js --name "deao-backend" --env production

# Start frontend
cd ~/pitch-deaostudios/frontend
pm2 start npm --name "deao-frontend" -- start

# Save PM2 config
pm2 save
pm2 startup
# (run the command it outputs)

# Useful PM2 commands:
pm2 status          # check processes
pm2 logs            # view logs
pm2 restart all     # restart everything
pm2 monit           # monitoring dashboard
```

---

## 7. Nginx Configuration

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/pitch.deaostudios.cloud
```

```nginx
server {
    listen 80;
    server_name pitch.deaostudios.cloud;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api-backend/ {
        rewrite ^/api-backend/(.*) /$1 break;
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 15M;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:4000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/pitch.deaostudios.cloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 8. SSL with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d pitch.deaostudios.cloud
# Follow prompts - auto-renews
```

---

## 9. Scheduled Cleanup Cron

```bash
crontab -e
# Add this line (runs cleanup daily at 3am):
0 3 * * * find ~/pitch-deaostudios/storage/decks -mtime +7 -delete
```

---

## 10. Getting Your Gemini API Key (Free)

1. Go to https://aistudio.google.com
2. Sign in with Google account
3. Click "Get API Key" → "Create API key"
4. Copy the key starting with `AIza...`
5. Add to backend `.env`: `GEMINI_API_KEY=AIza...`
6. Restart backend: `pm2 restart deao-backend`

**Gemini free tier:** 15 requests/minute, 1500 requests/day (plenty for internal use)

---

## 11. Adding Anthropic Key (When Ready)

1. Go to https://console.anthropic.com
2. Add credits and create an API key
3. Update backend `.env`: `ANTHROPIC_API_KEY=sk-ant-...`
4. Optionally set `AI_PROVIDER=anthropic` or keep `auto`
5. In the running app: Admin Panel → AI Settings → enter the key and save

The app supports **live key updates** via the Admin Panel without restarting the server.

---

## 12. Default Credentials

After migration, log in with:
- Email: `admin@deaostudios.com`
- Password: `deao2024!`

**⚠️ Change this password immediately in Admin → Settings!**

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Backend port (default: 4000) |
| `JWT_SECRET` | Yes | Random secret for auth tokens |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `GEMINI_API_KEY` | Yes* | Primary AI provider (free) |
| `ANTHROPIC_API_KEY` | No | Optional Claude AI (paid) |
| `AI_PROVIDER` | No | `auto`/`gemini`/`anthropic` |
| `FRONTEND_URL` | Yes | For CORS allowlist |
| `STORAGE_PATH` | No | Where to store files (default: `../storage`) |
| `DECK_EXPIRY_DAYS` | No | Auto-delete old exports (default: 7) |
| `MAX_CONCURRENT_GENERATIONS` | No | Queue limit (default: 2) |
| `UPLOAD_MAX_SIZE_MB` | No | Max upload size (default: 10) |

*At least one AI key (Gemini or Anthropic) is required.

---

## Troubleshooting

**Backend won't start:**
```bash
pm2 logs deao-backend
# Check DATABASE_URL is correct
# Check node_modules: npm install
```

**AI not working:**
```bash
# Visit: https://pitch.deaostudios.cloud → Admin → AI Settings → Test Connection
# Check GEMINI_API_KEY is set correctly
```

**WebSocket not connecting:**
```bash
# Check Nginx config has the /ws location block
# Check wss:// URL in frontend .env.local
```

**Database errors:**
```bash
sudo -u postgres psql -d deao_pitch
\dt  # should list tables
# If empty: node utils/migrate.js
```
