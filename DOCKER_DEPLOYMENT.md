# 🐳 Docker Containerization & VPS Deployment Guide

This guide explains how to package and deploy **Deao Studios Pitch Generator** using Docker, Docker Compose, Nginx reverse proxy, and PostgreSQL 16.

---

## Architecture Overview

```
                   [ User Browser / Client ]
                               │
                               ▼ (Port 80 / 443)
                      ┌──────────────────┐
                      │  Nginx Container │
                      └────────┬─────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │ (HTTP / _next / assets)             │ (WebSocket /ws & API /api/)
            ▼                                     ▼
   ┌─────────────────┐                   ┌─────────────────┐
   │ Frontend (Next) │                   │ Backend (Express)│
   │ (Port 3000)     │                   │ (Port 4000)     │
   └─────────────────┘                   └────────┬────────┘
                                                  │
                                                  ▼ (Port 5432)
                                         ┌─────────────────┐
                                         │ PostgreSQL 16   │
                                         └─────────────────┘
```

---

## 🚀 Quick Automated Deployment (SSH)

You can deploy the entire stack to your Linux VPS with a single command:

```bash
./deploy.sh <VPS_IP_ADDRESS> <SSH_USER> <SSH_PORT>
```

**Example:**
```bash
./deploy.sh 192.168.1.100 root 22
```

The script automatically:
1. Tests SSH connectivity to your server.
2. Installs Docker & Docker Compose if missing on the VPS.
3. Syncs project files to `/opt/pitch-deaostudios`.
4. Builds Docker images and starts containers in detached mode (`-d`).
5. Runs database migrations (`node utils/migrate.js`).
6. Verifies container health and status.

---

## 🛠️ Local Docker Development

To run the container stack locally on your machine:

```bash
# 1. Copy sample environment
cp .env.docker.example .env

# 2. Build and start containers
docker compose up --build

# 3. Open http://localhost in browser
```

---

## 🔒 Production Hardening & SSL (Certbot)

To attach a domain and free SSL certificate on your VPS using Certbot:

```bash
# On your VPS:
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d pitch.deaostudios.cloud
```

---

## 📁 Container Storage Volumes

- **`pgdata`**: Persistent PostgreSQL database data.
- **`storage_data`**: Persistent storage for generated `.pptx` / `.pdf` deck exports and uploaded company logos (`/app/storage`).
