# LoL-Stats Fullstack Project

A full-stack web application that displays League of Legends player statistics and leaderboards using the Riot Games API. Built with **React + Vite** on the frontend and **Node.js + Express** on the backend.

---

## 🎩 Project Structure

```
project-root/
├── frontend/                # React + Vite client
│   └── src/
│       ├── components/     # Reusable UI components (Navbar, Footer, etc.)
│       ├── pages/          # Main pages (Leaderboards, Home, etc.)
│       └── services/       # Frontend API interaction layer
├── backend/                 # Express API server
    ├── routes/          # Route handlers
    ├── services/        # Business logic & Riot API abstraction
    ├── utils/           # Caching, helpers
    ├── index.js         # Main server entry
    └── .env             # Riot API key and configs
```

---

## 🚀 Features

* 📊 **Live Leaderboards**: View top players by region.
* 🔍 **Summoner Search**: Look up summoner stats by name or PUUID.
* 🧠 **Match History**: Detailed stats from recent ranked games.
* 🛠️ **In-Memory Caching**: Reduces load on Riot API and speeds up repeat requests.
* 🎨 **Tailwind UI**: Clean, responsive, modern design.
* 🔐 **Secure Backend**: API keys are protected from the client.

---

## 🛠️ Tech Stack

### Frontend

* React 18
* Vite
* React Router
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express
* Axios
* dotenv
* Riot Games API

---

## ⚙️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/lol-stats.git
cd lol-stats
```

### 2. Set Up the Backend

```bash
cd backend
npm install
touch .env
```

In `.env`:

```
RIOT_API_KEY=your-riot-api-key-here
PORT=5000
```

Start backend:

```bash
npm run dev
```

### 3. Set Up the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

### 4. Visit the App

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🥪 API Examples

* `GET /api/summoner/na/summonerName`
* `GET /api/summoner/by-puuid/na1/puuid`
* `GET /api/summoner/na/puuid/ranked-matches`
* `GET /api/leaderboards/euw?limit=10`

---

## 📁 Environment Variables

Only the backend needs a `.env`:

```
RIOT_API_KEY=your-key
PORT=5000
```

---

## 📄 License

This project is for educational use. Riot Games trademarks and data belong to Riot Games.

---

## 🙌 Author

* Built by Rishad11 for educational evaluation
