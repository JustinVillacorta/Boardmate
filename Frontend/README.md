# Boardmate Frontend (React + Vite + TypeScript)

A modern, responsive frontend for the Boardmate boarding house management system. Built with React, Vite, TypeScript, Tailwind CSS, and Axios.

## Overview

This app connects to the Boardmate Express/MongoDB backend and provides role‑based dashboards and management tools for Admin, Staff, and Tenants.

Highlights:
- Clean, responsive UI using Tailwind CSS
- Role‑aware navigation and pages (Admin, Staff, Tenant)
- Centralized Axios client with JWT support (`src/config/api.ts`)
- Reusable dashboards with metric cards and charts
- Polished loading experience via `LoadingState` component

## Quick start

1) Install dependencies
```bash
cd Frontend
npm install
```

2) Configure API base URL
Create a `.env` file in `Frontend/` (same folder as `package.json`):
```env
VITE_API_URL=http://localhost:8000/api
```
If omitted, the app falls back to `http://localhost:8000/api`.

3) Run the dev server
```bash
npm run dev
```

4) Build and preview
```bash
npm run build
npm run preview
```

## Available scripts
- `npm run dev` – start Vite dev server
- `npm run build` – type‑check and build for production
- `npm run preview` – preview the production build locally
- `npm run lint` – run ESLint on ts/tsx files

## Tech stack
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- Axios for HTTP
- React Router 6
- Recharts for charts
- Lucide Icons

## Project structure
```
Frontend/
├── public/
│   ├── index.html                # Legacy/placeholder static HTML (not used by Vite app)
│   ├── manifest.json             # PWA manifest (if/when enabled)
│   └── vite.svg                  # Vite icon asset
├── src/
│   ├── App.tsx                   # Root app component and routing shell
│   ├── index.tsx                 # React DOM entry; mounts <App />
│   ├── main.tsx                  # App bootstrap (providers/setup)
│   ├── vite-env.d.ts             # Vite TypeScript types
│   ├── styles/
│   │   └── globals.css           # Tailwind directives and global styles
│   ├── config/
│   │   └── api.ts                # Axios instance, base URL, and auth interceptors
│   ├── components/
│   │   ├── announcements/
│   │   │   ├── AnnouncementCard.tsx         # Card UI for a single announcement
│   │   │   ├── AnnouncementDetailModal.tsx  # Modal to view full announcement details
│   │   │   └── CreateAnnouncementModal.tsx  # Modal to compose a new announcement
│   │   ├── auth/
│   │   │   ├── ForgotPasswordForm.tsx       # Form for requesting password reset
│   │   │   ├── ForgotPasswordModal.tsx      # Modal wrapper for the form
│   │   │   └── LoginForm.tsx                # Login form (uses API auth service)
│   │   ├── dashboard/
│   │   │   ├── Charts.tsx                   # Recharts-based visualizations
│   │   │   ├── DashboardHeader.tsx          # Dashboard title/toolbar row
│   │   │   ├── MetricCards.tsx              # Stat cards (icon+title, centered value, subtitle)
│   │   │   ├── QuickActions.tsx             # Shortcut actions block
│   │   │   └── RecentTenancyChanges.tsx     # Recent changes list
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx                  # Left navigation (role-aware)
│   │   │   └── TopNavbar.tsx                # Top bar with notifications and user menu
│   │   ├── tenant/
│   │   │   ├── ConfirmationDialog.tsx       # Confirm actions dialog for tenant flows
│   │   │   ├── SubmitMaintenanceForm.tsx    # Form to submit maintenance/report
│   │   │   ├── TenantInfoCards.tsx          # Tenant info and next payment widgets
│   │   │   ├── TenantNotificationCard.tsx   # Notification list item for tenant
│   │   │   ├── TenantPaymentSummary.tsx     # Tenant payments summary
│   │   │   ├── TenantQuickActions.tsx       # Quick actions panel for tenant
│   │   │   └── TenantRecentActivity.tsx     # Combined recent tenant activity
│   │   ├── ui/
│   │   │   ├── Button.tsx                   # Primary button component
│   │   │   ├── ConfirmDialog.tsx            # Generic confirm dialog
│   │   │   ├── DownloadDialog.tsx           # Download receipt/dialog shell
│   │   │   ├── ExportButton.tsx             # Helper for exporting data
│   │   │   ├── Input.tsx                    # Text input component
│   │   │   ├── LoadingState.tsx             # Animated loading card used across dashboards
│   │   │   └── RoleBadge.tsx                # Small badge showing user role
│   │   ├── notifications/                   # Role-specific notification components (placeholder)
│   │   ├── payments/                        # Payment UI components (placeholder)
│   │   ├── reports/                         # Report UI components (placeholder)
│   │   ├── rooms/                           # Room UI components (placeholder)
│   │   └── users/                           # User admin components (placeholder)
│   ├── pages/
│   │   ├── Admin/
│   │   │   └── Dashboard.tsx                # Admin dashboard container
│   │   ├── Staff/
│   │   │   └── Dashboard.tsx                # Staff dashboard container
│   │   ├── Tenant/
│   │   │   └── Dashboard.tsx                # Tenant dashboard container
│   │   └── shared/                          # Shared page-level components (placeholder)
│   ├── services/
│   │   ├── announcementService.ts           # Announcement API calls
│   │   ├── authService.ts                   # Auth/login/logout helpers
│   │   ├── dashboardService.ts              # Dashboard data aggregation calls
│   │   ├── notificationService.ts           # Notification API calls
│   │   ├── paymentService.ts                # Payment API calls (tenant + staff/admin)
│   │   ├── registerService.ts               # Registration flows
│   │   ├── reportService.ts                 # Report API calls
│   │   ├── roomManagementService.ts         # Room management API calls
│   │   ├── tenantDashboardService.ts        # Tenant dashboard data fetcher
│   │   └── userManagementService.ts         # User admin API calls
│   ├── types/
│   │   ├── announcement.ts                  # TS types for announcement domain
│   │   ├── index.ts                         # Common/shared types
│   │   ├── notification.ts                  # Notification types
│   │   ├── payment.ts                       # Payment types and DTOs
│   │   ├── report.ts                        # Report types
│   │   └── room.ts                          # Room and occupancy types
│   ├── utils/
│   │   ├── excelExport.ts                   # Export tabular data to XLSX
│   │   ├── receiptPdfGenerator.ts           # Generate receipt PDFs on client
│   │   ├── userUtils.ts                     # Small helpers for user display/logic
│   │   └── validation.ts                    # Shared client-side validation helpers
│   └── hooks/
│       └── useFormValidation.ts             # Basic form validation hook
├── index.html                               # Main Vite HTML entry (mounts app)
├── vite.config.ts                           # Vite configuration
├── tailwind.config.js                       # Tailwind configuration
├── postcss.config.cjs                       # PostCSS configuration
├── tsconfig.json                            # TypeScript compiler settings
├── tsconfig.node.json                       # TS settings for tools/scripts
├── package.json                             # Frontend dependencies and scripts
└── README.md                                # This documentation
```

## File structure explanation
- public/: Static assets served as‑is by Vite (HTML, manifest, icons)
- src/index.tsx, src/main.tsx, src/App.tsx: Application bootstrap and root component
- src/config/api.ts: Axios instance with base URL and auth interceptors
- src/components/: Reusable UI and feature components
	- announcements/, auth/: Feature‑specific UI blocks
	- dashboard/: Metric cards, charts, and quick actions
	- layout/: App shell (Sidebar, TopNavbar)
	- tenant/: Widgets for the tenant dashboard
	- ui/: Generic UI primitives (Button, Input, LoadingState, etc.)
- src/pages/: Page‑level screens grouped by role (Admin/Staff/Tenant) + shared
- src/services/: Typed API wrappers for feature areas (payments, rooms, reports, etc.)
- src/types/: Shared TypeScript interfaces matching backend models
- src/utils/: Helpers (Excel export, PDF receipt generator, validation)
- src/styles/: Global CSS (Tailwind base and app styles)
- src/hooks/: Custom hooks (form validation, etc.)
- vite.config.ts, tailwind.config.js, postcss.config.cjs: Tooling configuration
- index.html (root): Vite mount point (in addition to public/index.html for static)

## Features in this repo
- Admin/Staff/Tenant dashboards wired to backend services
- Metric cards layout with centered value and subtitle
- New animated loading screen (`components/ui/LoadingState.tsx`)
- Auth token handling via Axios interceptors
- Typed service layer and DTOs (e.g., `paymentService.ts`)

## Configuration notes
- API base URL is read from `VITE_API_URL` in `src/config/api.ts`.
- Auth token is read from `localStorage` and added as `Authorization: Bearer <token>` automatically.
- 401 responses clear auth data and redirect to `/login`.

## Contributing
1) Create a feature branch off `main` or your working branch
2) Keep components small and reusable
3) Prefer typed service methods over inline axios calls
4) Run `npm run lint` before pushing

## Troubleshooting
- Blank screen on startup: verify `VITE_API_URL` and backend server status.
- 401 loops: clear browser storage and log in again.
- CORS errors: ensure backend CORS allows the Vite dev origin.

---

This README reflects the current codebase (Vite + React TS) and removes legacy references to a separate static HTML demo.