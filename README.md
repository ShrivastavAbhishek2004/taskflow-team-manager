# ⚡ TaskFlow — Team Task Manager

A full-stack team task management platform with role-based access control, Kanban boards, and real-time project tracking.

## 🚀 Features

- **Authentication** — JWT-based signup/login with secure password hashing
- **Project Management** — Create projects, manage teams, track progress
- **Kanban Board** — Visual task board with Todo / In Progress / Review / Done columns
- **Role-Based Access** — Admin (full control) and Member (create/edit tasks)
- **Task Management** — Assign tasks, set priorities, due dates, tags
- **Dashboard** — Stats cards, overdue alerts, my tasks view
- **Profile** — Update name and change password

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + React Router |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (Free M0 Cluster) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Deployment | Railway |

---

## 📦 Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free at [mongodb.com/atlas](https://mongodb.com/atlas))

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd Abhishek_Ethara_Project
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and fill in MONGODB_URI and JWT_SECRET
npm install
npm run dev   # starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# VITE_API_URL is empty by default (uses Vite proxy to localhost:5000)
npm install
npm run dev   # starts on http://localhost:5173
```

---

## 🌐 Railway Deployment

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: TaskFlow full-stack app"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

### Step 2 — Deploy Backend on Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your repository
3. Set **Root Directory** to `backend`
4. Add **Environment Variables**:
   ```
   MONGODB_URI=<your MongoDB Atlas connection string>
   JWT_SECRET=<generate a random 64-char string>
   CLIENT_URL=<your frontend Railway URL (add after frontend deploy)>
   PORT=5000
   ```
5. Railway auto-deploys. Note your backend URL: `https://xxx.railway.app`

### Step 3 — Deploy Frontend on Railway

1. In same Railway project → **New Service** → **GitHub Repo** again
2. Set **Root Directory** to `frontend`
3. Set **Build Command**: `npm run build`
4. Set **Start Command**: `npx serve dist -p $PORT`
5. Add **Environment Variable**:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
6. Deploy → note your frontend URL

### Step 4 — Update Backend CORS

Go back to backend service on Railway → update:
```
CLIENT_URL=https://your-frontend.railway.app
```
Redeploy backend.

### Step 5 — MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a **Free M0 cluster**
3. Create a **Database User** (username + password)
4. Under **Network Access** → Add IP Address → Allow **0.0.0.0/0** (all IPs, for Railway)
5. Click **Connect** → **Connect your application** → copy the connection string
6. Replace `<password>` in the string with your DB user password
7. Paste into Railway backend `MONGODB_URI` variable

---

## 🔐 Role-Based Access Control

| Permission | Admin | Member |
|---|---|---|
| View project & tasks | ✅ | ✅ |
| Create & edit tasks | ✅ | ✅ |
| Delete tasks | ✅ | ❌ |
| Update project info | ✅ | ❌ |
| Delete project | ✅ | ❌ |
| Add / remove members | ✅ | ❌ |
| Change member roles | ✅ | ❌ |

---

## 📡 API Reference

**Auth** — `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me`

**Projects** — `GET/POST /api/projects` · `GET/PUT/DELETE /api/projects/:id` · `POST/DELETE /api/projects/:id/members` · `PUT /api/projects/:id/members/:userId/role`

**Tasks** — `GET /api/tasks/project/:projectId` · `POST /api/tasks/project/:projectId` · `GET/PUT/DELETE /api/tasks/:id` · `GET /api/tasks/dashboard/summary`

**Users** — `GET /api/users/search?email=` · `PUT /api/users/profile`
