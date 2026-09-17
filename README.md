# InterviewOS

**A real-time technical interview platform for practicing and conducting coding interviews.**

InterviewOS combines live 1v1 interview simulation with AI-driven solo mock interviews, giving candidates a realistic environment to prepare for technical interviews and giving interviewers a structured platform to run them.

 **Live:** https://interview-os-zeta.vercel.app/
---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

InterviewOS is built around two core modules:

### War Room
Real-time 1v1 coding interview rooms. One participant joins as the interviewer, the other as the candidate. Code, cursor position, and problem state are synced live over WebSockets, with support for multiple problems per session, tab-switch detection, and AI-generated performance reports at the end.

### Phantom AI
Solo mock interview mode. Candidates practice against an AI interviewer that asks questions, evaluates responses, and tracks hesitation and problem-solving patterns — useful for practicing without needing a second person available.

---

## Features

- Real-time collaborative code editor (Monaco) synced via Socket.IO
- Interviewer / candidate role separation with live state sync
- Tab-switch and integrity enforcement during live sessions
- AI-generated post-session performance reports (DeepSeek via NVIDIA API)
- Remote code execution via Judge0 / JDoodle
- Session replay with code history, Q&A, and telemetry
- JWT-based authentication
- Dockerized deployment for both frontend and backend

---

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- Monaco Editor
- Socket.IO Client
- Axios

**Backend**
- Node.js + Express
- MongoDB (Mongoose)
- Socket.IO
- JWT Authentication

**AI / Execution**
- DeepSeek (via NVIDIA API) — interview evaluation and report generation
- Judge0 / JDoodle — code execution sandboxes

**Infrastructure**
- Docker (multi-stage builds)
- Nginx (Alpine) for frontend serving
- Node (Alpine) for backend runtime
- MongoDB Atlas

---

## Architecture

```
┌──────────────┐        WebSocket / REST        ┌──────────────┐
│   React +     │ ─────────────────────────────► │   Express +   │
│   Monaco      │ ◄───────────────────────────── │   Socket.IO   │
│   (client)    │                                 │   (server)    │
└──────────────┘                                 └──────┬───────┘
                                                          │
                                        ┌─────────────────┼─────────────────┐
                                        ▼                 ▼                 ▼
                                   MongoDB Atlas     Judge0 / JDoodle   DeepSeek (NVIDIA API)
                                   (sessions,        (code execution)   (evaluation, reports)
                                    users, rooms)
```

---

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- MongoDB instance (local or Atlas)
- API keys for NVIDIA (DeepSeek), Judge0/JDoodle

### Installation

```bash
git clone <repo-url>
cd interviewos
```

**Backend**
```bash
cd server
npm install
cp .env.example .env   # fill in required values — see below
npm run dev
```

**Frontend**
```bash
cd client
npm install
npm run dev
```

### Docker (recommended for full-stack local run)

```bash
docker compose up --build
```

---

## Environment Variables

**Server (`server/.env`)**

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas / local connection string |
| `JWT_SECRET` | Secret used to sign auth tokens |
| `NVIDIA_API_KEY` | API key for DeepSeek via NVIDIA |
| `JUDGE0_API_KEY` | Judge0 code execution key |
| `JDOODLE_CLIENT_ID` / `JDOODLE_CLIENT_SECRET` | JDoodle execution credentials |
| `NODE_ENV` | `development` / `production` |

**Client (`client/.env`)**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend REST API base URL |
| `VITE_SOCKET_URL` | Backend Socket.IO server URL |

> Never commit `.env` files. Use `.env.example` as a template.

---

## Project Structure

```
interviewos/
├── client/          # React frontend (War Room + Phantom AI UI)
│   ├── src/
│   └── ...
├── server/          # Express backend
│   ├── routes/
│   ├── models/
│   ├── sockets/
│   └── ...
└── docker-compose.yml
```

---


