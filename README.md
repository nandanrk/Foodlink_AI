# FoodLink AI – AI Powered Smart Food Redistribution Platform

> Connecting restaurants with NGOs and volunteers to eliminate food waste and fight hunger.
> Supporting **SDG 2 – Zero Hunger** and **SDG 12 – Responsible Consumption**.

---

## 🚀 Tech Stack

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **Framer Motion** for animations
- **React Router** for navigation
- **React Hook Form** + **Zod** for forms
- **Leaflet** + **OpenStreetMap** for maps
- **Supabase JS** for auth

### Backend
- **Node.js** + **Express.js**
- **Supabase** (PostgreSQL + Auth + Storage)
- **OpenRouter API** for AI features
- **OpenRouteService** for route calculation
- **PDFKit** for certificate generation
- **node-cron** for automation

---

## 🗄️ Project Structure

```
foodlinkai/
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # Button, Card, Badge, etc.
│   │   │   └── layout/     # Navbar, PageLayout
│   │   ├── pages/          # All route pages
│   │   │   ├── auth/       # Login, Register
│   │   │   ├── restaurant/ # Restaurant dashboard & pages
│   │   │   ├── ngo/        # NGO dashboard & pages
│   │   │   └── volunteer/  # Volunteer dashboard & pages
│   │   ├── contexts/       # AuthContext
│   │   ├── hooks/          # useNotifications, useDashboard
│   │   ├── services/       # Axios API service layer
│   │   ├── lib/            # Utils, Supabase client
│   │   └── types/          # TypeScript interfaces
│   ├── vite.config.ts
│   └── vercel.json
├── backend/                # Express.js backend
│   ├── src/
│   │   ├── server.js       # Main Express app
│   │   ├── config/         # Supabase config
│   │   ├── middleware/     # Auth, validation
│   │   ├── routes/         # Express routes
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # AI, Maps, PDF, Notifications
│   │   └── automation/     # Automation engine + cron jobs
│   └── render.yaml
└── supabase_schema.sql     # Database schema
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/your-repo/foodlinkai.git
cd foodlinkai
```

### 2. Supabase Setup
1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase_schema.sql` in your SQL Editor
3. Create Storage buckets: `food-images` and `certificates` (both public)
4. Copy your Project URL, anon key, and service role key

### 3. Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your keys in .env
npm install
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
cp .env.example .env
# Fill in your keys in .env
npm install
npm run dev
```

### 5. Environment Variables

**Backend `.env`:**
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
OPENROUTER_API_KEY=your-openrouter-key
ORS_API_KEY=your-openrouteservice-key
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000/api
```

---

## 🛠️ Features

### 🍽️ Restaurant
- Register & complete restaurant profile
- Create food donations with optional photo
- AI-generated food descriptions (OpenRouter)
- Shelf-life guidance (clearly marked as estimates)
- View donation status & history
- Download PDF donation certificates

### 🤝 NGO
- Register & complete NGO profile
- Browse nearby available donations
- Accept donations (auto-triggers volunteer assignment)
- Track assigned volunteer
- View donation history & impact dashboard

### 🚴 Volunteer
- Register & complete volunteer profile
- View assigned pickups
- Accept/reject assignments
- OTP-verified pickup confirmation
- Mark delivery completed
- Track completed deliveries

### 🤖 AI Features
- **Food Description Generator** – Professional descriptions from basic food details
- **Shelf-Life Guidance** – Safe handling estimates (with appropriate disclaimers)
- **AI Chat Assistant** – Platform Q&A chatbot
- **Analytics Summary** – Natural language impact summaries

### 🗺️ Maps
- Interactive Leaflet map
- NGO & volunteer location markers
- Distance calculation (Haversine)
- Route planning via OpenRouteService

### 🔔 Notifications
- Real-time notification system
- Role-based notifications (restaurant/NGO/volunteer)
- Polling every 30 seconds
- Mark read / mark all read

### 🏆 Certificates
- Auto-generated PDF certificates on delivery
- Stored in Supabase Storage
- Downloadable from dashboard

---

## 🚀 Deployment

### Frontend – Vercel
1. Import frontend folder to Vercel
2. Set environment variables
3. Deploy (Vite build auto-detected)

### Backend – Render
1. Connect backend folder to Render
2. Set environment variables
3. Build: `npm install`, Start: `npm start`
4. The `render.yaml` is pre-configured

---

## ⚠️ Important Disclaimers

- Shelf-life guidance provided by AI is **for informational purposes only** and is **not a food safety certification**. Always follow local food safety regulations.
- OpenRouter AI responses may vary. Always review AI-generated content before use.

---

## 🌍 SDG Alignment

| Goal | How FoodLink AI Contributes |
|------|----------------------------|
| **SDG 2 – Zero Hunger** | Redistributes surplus food to NGOs feeding communities in need |
| **SDG 12 – Responsible Consumption** | Reduces restaurant food waste through intelligent matching and automated logistics |

---

*Built with ❤️ to fight food waste and hunger.*

