# Empathy Forum - Development Guide

## Project Structure
```
empathy/
├── README.md
├── package.json (Frontend - React + Vite)
├── src/ (Frontend source)
├── public/ (Static assets)
├── backend/
│   └── server/
│       ├── package.json (Backend - Node.js + Express)
│       ├── src/ (API source)
│       └── index.js
└── deployment/
    ├── frontend.dockerfile
    └── backend.dockerfile
```

## Quick Start

### Development (Both services)
```bash
# Clone repository
git clone <repo-url>
cd empathy

# Install frontend dependencies
npm install

# Install backend dependencies  
cd backend/server
npm install

# Start backend (Terminal 1)
npm run dev

# Start frontend (Terminal 2)
cd ../../
npm run dev
```

### Production Build
```bash
# Build frontend
npm run build

# Start backend
cd backend/server
npm start
```

## When to Split?

Consider splitting when:
- [ ] Team grows beyond 10 developers
- [ ] Different deployment cycles needed
- [ ] Independent scaling requirements
- [ ] Different technology stacks

## Current Benefits of Monorepo:
- ✅ Single source of truth
- ✅ Simplified development workflow
- ✅ Shared configurations
- ✅ Easier dependency management
- ✅ Single deployment pipeline