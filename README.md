# Vanuit Ambacht — ERP / CRM & Customer Portal

Modern management portal and digital sales application for Vanuit Ambacht (luxury custom outdoor kitchens and garden rooms).

## Project Structure

```text
vanuit-ambatch/
├── frontend/             # React (Vite) + Tailwind CSS Frontend Application
│   ├── src/              # Pages, components, hooks, utils, and layouts
│   ├── public/           # Static assets, logos, and previews
│   ├── package.json      # Frontend dependencies & scripts
│   └── vite.config.js    # Vite configuration
│
├── backend/              # Fastify + TypeScript + Drizzle + PostgreSQL (Upcoming)
│
├── README.md             # Project documentation
└── .gitignore            # Monorepo git ignore rules
```

## Running the Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Frontend Build Verification

```bash
cd frontend
npm run build
```
