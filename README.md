# 🧾 GST AI — Intelligent GST Invoicing Platform

> A modern, full-stack GST invoice management SaaS built with **Next.js 16**, **Prisma**, and **NextAuth**. Streamline your Indian tax compliance with AI-powered invoicing, customer management, inventory tracking, and financial reporting — all in one place.

---------------------------------------------------------------------------------------------

## ✨ Features

### 📄 Invoice Management
- Create, edit, and manage GST-compliant invoices (B2B & B2C)
- Auto-calculation of **CGST / SGST / IGST** based on place of supply
- Invoice statuses: Draft → Sent → Paid → Partial → Overdue → Cancelled
- Unique invoice numbering per organization with configurable prefix
- Reverse charge mechanism support

### 👥 Customer Management
- Maintain customer directory with GSTIN, billing & shipping addresses
- State-wise customer tracking for inter/intra-state tax computation

### 📦 Product & Inventory
- Product catalog with **HSN codes**, SKU, and GST rate mapping
- Real-time stock tracking with low-stock alerts
- Unit-of-measure and purchase price tracking

### 💰 Payments & Expenses
- Record payments against invoices (Cash, Bank Transfer, UPI, Cheque)
- Expense tracking with GST input tax credit (ITC) breakdown
- Categorized expense management (Rent, Salary, Utilities, Travel, Tax, etc.)

### 📊 Reports & Analytics
- Dashboard with key business metrics
- Revenue, tax, and expense summaries
- Visual analytics with **Recharts**

### 🔐 Authentication & Multi-tenancy
- Secure authentication via **NextAuth v5** (credentials + OAuth)
- Role-based access control (Admin / Staff)
- Organization-level data isolation

### 🎨 Modern UI/UX
- Beautiful, responsive interface built with **shadcn/ui** + **Radix UI**
- Dark mode support via **next-themes**
- Toast notifications with **Sonner**
- AI-powered components for intelligent workflows

---

## 🏗️ Tech Stack

| Layer          | Technology                                         |
| -------------- | -------------------------------------------------- |
| **Framework**  | [Next.js 16](https://nextjs.org/) (App Router)     |
| **Language**   | TypeScript                                         |
| **Database**   | SQLite (via Prisma + LibSQL adapter)                |
| **ORM**        | [Prisma 7](https://www.prisma.io/)                 |
| **Auth**       | [NextAuth v5](https://authjs.dev/)                 |
| **UI**         | [shadcn/ui](https://ui.shadcn.com/) + Radix UI     |
| **Styling**    | [Tailwind CSS v4](https://tailwindcss.com/)        |
| **Charts**     | [Recharts](https://recharts.org/)                  |
| **Validation** | [Zod](https://zod.dev/)                            |

---

## 📂 Project Structure

```
GST_ai/
├── package.json              # Root workspace scripts
├── gstflow/                  # Main Next.js application
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema (9 models)
│   │   ├── migrations/       # Database migrations
│   │   └── seed.ts           # Seed data
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/       # Login / Register pages
│   │   │   ├── (dashboard)/  # Protected dashboard routes
│   │   │   │   ├── customers/
│   │   │   │   ├── invoices/
│   │   │   │   ├── products/
│   │   │   │   ├── reports/
│   │   │   │   ├── documents/
│   │   │   │   └── settings/
│   │   │   ├── api/          # API routes
│   │   │   └── onboarding/   # Org setup wizard
│   │   ├── backend/
│   │   │   ├── actions/      # Server actions
│   │   │   ├── auth/         # Auth configuration
│   │   │   ├── db/           # Database client
│   │   │   ├── services/     # Business logic
│   │   │   └── validations/  # Zod schemas
│   │   ├── frontend/
│   │   │   └── components/
│   │   │       ├── ai/       # AI-powered components
│   │   │       ├── analytics/# Chart & metric widgets
│   │   │       ├── documents/# Document viewers
│   │   │       ├── forms/    # Input forms
│   │   │       ├── layout/   # Shell, sidebar, nav
│   │   │       └── ui/       # shadcn/ui primitives
│   │   └── shared/           # Shared utilities & types
│   └── public/               # Static assets
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/HarryInData/GST_Ai.git
cd GST_Ai

# Install dependencies
cd gstflow
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL, auth secrets, etc.

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Root-level Commands

From the project root you can also run:

```bash
npm run dev     # Start dev server
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

---

## 🗄️ Database Schema

The Prisma schema defines **9 core models**:

| Model               | Purpose                                |
| -------------------- | -------------------------------------- |
| `User`               | Authentication & role management       |
| `Account` / `Session`| OAuth & session handling (NextAuth)    |
| `Organization`       | Multi-tenant business profiles         |
| `Customer`           | B2B/B2C customer directory             |
| `Product`            | Inventory with HSN codes & GST rates   |
| `Invoice`            | GST-compliant invoices with tax splits |
| `InvoiceItem`        | Line items with per-item tax breakdown |
| `Payment`            | Payment records linked to invoices     |
| `Expense`            | Business expenses with ITC tracking    |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private. All rights reserved.

---

<p align="center">
  Built with ❤️ for Indian businesses
</p>
