# 💰 WealthPulse - AI-Powered Personal Finance

> **Your private, AI-powered finance companion** - Track expenses, manage income, detect recurring patterns, and achieve financial goals while keeping YOUR data on YOUR device!

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Privacy](https://img.shields.io/badge/Privacy-First-green)](https://github.com/BalajiJ234/wealthpulse)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 🌐 Live URLs

| Environment       | URL                                                 |
| ----------------- | --------------------------------------------------- |
| **Production**    | https://balaji-dev.in/life-sync/wealth              |
| **Direct Vercel** | https://wealth-pulse-ai.vercel.app/life-sync/wealth |

---

## 🎯 What is WealthPulse?

**WealthPulse** is an AI-powered personal finance application that respects your privacy:

| Feature               | Description                                             |
| --------------------- | ------------------------------------------------------- |
| 🔒 **100% Private**   | Your data NEVER leaves your device                      |
| 🤖 **AI-Powered**     | Smart categorization, recurring detection, and insights |
| 📱 **Offline-First**  | Works without internet (PWA)                            |
| 🎯 **Goal-Focused**   | Set and achieve realistic financial goals               |
| 👥 **Bill Splitting** | Manage shared expenses with friends/family              |
| 💵 **Multi-Currency** | Support for 30+ currencies                              |

---

## ✨ Live Features

### 💰 Smart Expense Tracking

- AI-powered automatic categorization
- Recurring expense detection with smart suggestions
- Daily budget calculator based on remaining monthly budget
- Category-based insights and analytics

### 📈 Income Management

- Track all income sources (salary, freelance, investments)
- Recurring income patterns
- Link income to financial goals
- Monthly income trends

### 🎯 Goal Setting & Tracking

- Multiple concurrent financial goals
- AI feasibility analysis
- Progress visualization
- Smart recommendations

### 🔄 AI Recurring Detection

- Automatic detection of recurring expenses
- Smart pattern recognition (weekly, monthly, yearly)
- Upcoming recurring expense alerts
- One-click confirmation to track subscriptions

### 👥 Bill Splitting

- Split expenses with friends
- Multiple split methods (equal, percentage, custom)
- Export/import for sharing
- Settlement tracking

### 🤖 AI Financial Advisor

- Personalized spending insights
- Budget recommendations
- Savings opportunities
- Pattern analysis

---

## 🏗️ Project Structure

```
wealthpulse/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── advisor/            # AI Financial Advisor
│   │   ├── expenses/           # Expense tracking
│   │   ├── goals/              # Goal management
│   │   ├── income/             # Income tracking
│   │   ├── settings/           # App settings & data management
│   │   └── splits/             # Bill splitting
│   ├── components/
│   │   ├── ai/                 # AI components (Advisor, Insights)
│   │   ├── forms/              # Form components
│   │   └── ui/                 # Reusable UI components
│   ├── store/
│   │   ├── slices/             # Redux slices (expenses, income, goals, etc.)
│   │   └── api/                # RTK Query API
│   └── utils/                  # Utility functions
├── public/                     # PWA assets, icons, manifest
└── archive/                    # Archived features for future apps
```

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/BalajiJ234/wealthpulse.git
cd wealthpulse

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

| Category      | Technology                          |
| ------------- | ----------------------------------- |
| **Framework** | Next.js 15.5.4 (App Router)         |
| **UI**        | React 19, Tailwind CSS 4            |
| **State**     | Redux Toolkit + Redux Persist       |
| **Language**  | TypeScript 5                        |
| **Storage**   | localStorage (100% client-side)     |
| **PWA**       | Service Worker, Web App Manifest    |
| **AI**        | Local pattern matching & algorithms |
| **Hosting**   | Vercel                              |
| **Routing**   | Cloudflare Workers (path-based)     |

---

## ⚙️ Path-Based Routing Configuration

This app uses `basePath` for path-based routing under the main domain:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  basePath: "/life-sync/wealth",
  assetPrefix: "/life-sync/wealth",
};
```

---

## 🔒 Privacy Architecture

| Feature           | Implementation            |
| ----------------- | ------------------------- |
| **Data Storage**  | Browser localStorage only |
| **Cloud Sync**    | None (by design)          |
| **User Accounts** | None required             |
| **Analytics**     | Zero tracking             |
| **External APIs** | None for core features    |
| **Data Export**   | Full JSON export/import   |

**Your financial data stays on YOUR device. Always.**

---

## 📋 Development Phases

### ✅ Phase 1: Foundation (Completed)

- [x] Core expense tracking with AI categorization
- [x] Income tracking with recurring patterns
- [x] Goal setting with feasibility analysis
- [x] Bill splitting with export/import
- [x] PWA offline support
- [x] Multi-currency support (30+ currencies)
- [x] Mobile-responsive UI

### ✅ Phase 2: AI Recurring Detection (Completed)

- [x] Automatic recurring expense detection
- [x] Smart pattern recognition algorithm
- [x] Recurring suggestions panel
- [x] Upcoming recurring expenses widget
- [x] Daily budget calculator

### 🚧 Phase 3: Enhanced Insights (In Progress)

- [x] **Live Exchange Rates** - Real-time currency conversion using open API (frankfurter.app)
- [x] **Historical Rate Reports** - Convert expenses using rate on transaction date
- [x] **Customizable Report Currency** - Generate reports in any currency (AED, INR, USD, etc.) with accurate conversion
- [x] Advanced spending analytics with charts
- [x] Monthly budget alerts (80%, 100% thresholds)
- [ ] Spending pattern detection ("You spend more on weekends")
- [ ] Unusual expense alerts
- [ ] Category trend analysis

### 📋 Phase 4: Financial Planning

- [ ] AI-powered goal forecasting
- [ ] Debt payoff calculator (snowball/avalanche methods)
- [ ] Emergency fund planner
- [ ] Cashflow forecasting
- [ ] Savings opportunity finder

### 📋 Phase 5: Advanced Privacy

- [ ] Optional encrypted local backup
- [ ] Biometric authentication (fingerprint/face)
- [ ] Scheduled auto-exports
- [ ] Privacy transparency dashboard

### 📋 Phase 6: Reporting

- [ ] Monthly/yearly expense reports
- [ ] PDF/Excel export
- [ ] Tax preparation exports
- [ ] Custom report builder
- [ ] Year-over-year comparison

---

## 🎯 Roadmap

| Version | Target   | Focus                         | Status      |
| ------- | -------- | ----------------------------- | ----------- |
| v1.0    | Nov 2025 | Core Features + AI Recurring  | ✅ Complete |
| v1.1    | Dec 2025 | Enhanced Insights & Analytics | 🚧 Next     |
| v1.2    | Jan 2026 | Financial Planning Tools      | 📋 Planned  |
| v1.3    | Feb 2026 | Advanced Privacy Features     | 📋 Planned  |
| v1.4    | Mar 2026 | Collaboration Enhancements    | 📋 Planned  |
| v1.5    | Apr 2026 | Advanced Reporting            | 📋 Planned  |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## ❌ What We DON'T Do

- ❌ Cloud sync without user control
- ❌ User accounts or authentication servers
- ❌ Advertising or monetization of data
- ❌ External AI APIs (all AI is local)
- ❌ Analytics or user tracking
- ❌ Bank account integration (privacy risk)
- ❌ Premium tiers or paywalls

---

## 📄 License

MIT License - Free to use, modify, and distribute.

---

## 🌐 Part of Life-Sync 2.0 Ecosystem

| App                       | URL                                    | Status     |
| ------------------------- | -------------------------------------- | ---------- |
| 🚀 **Gateway**            | https://balaji-dev.in/life-sync        | ✅ Live    |
| 💰 **Wealth Pulse**       | https://balaji-dev.in/life-sync/wealth | ✅ Live    |
| 📝 **Life Notes**         | https://balaji-dev.in/life-sync/notes  | ✅ Live    |
| 🤖 **Personal Assistant** | Coming Month 4                         | 🔮 Planned |

---

<div align="center">

## 💰 WealthPulse

**Your money. Your data. Your control.**

Built with Privacy 🔒 | Powered by Local AI 🤖 | Free Forever 💚

⭐ **Star this repo if you value privacy-first software!** ⭐

</div>
