# 🤝 Contributing to WealthPulse

Thank you for your interest in contributing to WealthPulse! This guide will help you get started.

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

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📋 Project Structure

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
│   │   ├── slices/             # Redux slices
│   │   └── api/                # RTK Query API
│   └── utils/                  # Utility functions
├── public/                     # PWA assets, icons, manifest
└── archive/                    # Archived features for reference
```

---

## 🔧 Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes
- Write code following TypeScript best practices
- Ensure no TypeScript errors (`npm run build`)
- Test on mobile and desktop

### 3. Commit Your Changes
```bash
git add .
git commit -m "feat: add your feature description"
```

**Commit message format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Formatting changes
- `refactor:` - Code restructuring

### 4. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## 🎯 Feature EPICs

### EPIC 1: Core Financial Management 🎯
- Monthly budget limits with alerts
- Custom expense categories
- Advanced spending analytics
- Receipt photo attachment

### EPIC 2: Enhanced Privacy & PWA 🔒
- Optional encrypted cloud backup
- Biometric authentication
- Scheduled auto-exports
- Privacy transparency dashboard

### EPIC 3: Goals & Financial Planning 💰
- AI-powered goal forecasting
- Multiple concurrent goals
- Debt payoff calculator
- Emergency fund planner

### EPIC 4: Smart Insights & AI 🤖
- Spending pattern detection
- Unusual expense alerts
- Predictive monthly budgets
- Cashflow forecasting

### EPIC 5: Collaboration & Sharing 👥
- Household shared budget
- Family member permissions
- Group trip expense manager
- Settlement payment tracking

### EPIC 6: Advanced Reporting 📊
- Monthly/yearly expense reports
- PDF/Excel export
- Tax preparation exports
- Year-over-year comparison

---

## 🏷️ GitHub Labels

### Priority Labels
| Label | Color | Description |
|-------|-------|-------------|
| `priority: critical` | Red | Blocking issues |
| `priority: high` | Orange | Important |
| `priority: medium` | Yellow | Should have |
| `priority: low` | Green | Nice to have |

### Type Labels
| Label | Description |
|-------|-------------|
| `user-story` | User stories |
| `bug` | Bug fixes |
| `enhancement` | Improvements |
| `feature` | New features |

### EPIC Labels
- `epic: core-financial`
- `epic: privacy-pwa`
- `epic: goals-planning`
- `epic: ai-insights`
- `epic: collaboration`
- `epic: reporting`

---

## ✅ Contribution Guidelines

### What We Welcome
- ✅ Privacy enhancements
- ✅ Local AI improvements
- ✅ Better UX/UI
- ✅ Performance optimization
- ✅ Accessibility features
- ✅ Documentation improvements
- ✅ Bug fixes

### What We DON'T Accept
- ❌ Backend databases (privacy philosophy)
- ❌ User authentication systems
- ❌ Cloud sync without E2E encryption
- ❌ Tracking/analytics code
- ❌ Premium/paid features
- ❌ External AI APIs (unless opt-in)

---

## 🔒 Privacy Principles

All contributions must follow our privacy-first philosophy:

1. **Data stays local** - Use localStorage, never external databases
2. **Zero tracking** - No analytics, no telemetry
3. **Offline-first** - Core features must work without internet
4. **User control** - Users own and control their data

---

## 📞 Getting Help

- **Issues**: [GitHub Issues](https://github.com/BalajiJ234/wealthpulse/issues)
- **Discussions**: [GitHub Discussions](https://github.com/BalajiJ234/wealthpulse/discussions)

---

<div align="center">

**Thank you for contributing to privacy-first finance!** 🚀🔒

</div>
