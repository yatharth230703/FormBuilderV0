
# 🧠 Natural Form Builder (Supabase + Gemini AI)

This is a full-stack AI-powered form builder app that takes natural language prompts and generates multi-step dynamic forms using **Google Gemini API**, with data storage handled by **Supabase**.

---

## 🚀 Features

- ✨ Generate forms from plain English prompts  
- 📄 Supports components like sliders, textboxes, tiles, contact fields, etc.  
- 🔐 Supabase as backend for storing form configs and responses  
- 🤖 Gemini API used for intelligent form generation  
- 🌓 Responsive UI with modern design (Vite + Tailwind + TypeScript)  

---

## 🛠️ Getting Started

### 1. **Clone the Repository**
```bash
[git clone https://github.com/yatharth230703/scaile_assignment_v2.git
cd natural-form-builder
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Environment Variables**

Create a `.env` file at the root and add the following:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

> 🔑 **Important**: Without these secrets, form generation and storage will not work.

---

## 🧪 Running Locally

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to use the app.

---

## 📦 Project Structure

```
├── server/                  # Express backend
│   ├── routes.ts           # Main API routes
│   ├── services/           # Supabase + Gemini logic
│   └── storage.ts          # Fallback storage logic
├── shared/                 # Common types and schemas
├── public/                 # Static assets
├── .env                    # Environment variables
├── package.json
└── README.md
```


