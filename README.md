# 💰 WealthPulse - AI-Powered Personal Finance

> **Your private, AI-powered finance companion** - Track expenses, manage income, set goals, and make smarter financial decisions while keeping YOUR data on YOUR device!

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Privacy](https://img.shields.io/badge/Privacy-First-green)](https://github.com/BalajiJ234/wealthpulse)

## 🎯 What is This?

**WealthPulse** is your AI-powered personal finance companion that respects your privacy:
- 🔒 **100% Privacy** - Your data NEVER leaves your device
- 🤖 **Local AI Insights** - Smart categorization and forecasting
- 📱 **Offline-First** - Works without internet (PWA)
- � **No Cloud, No Login** - No authentication, no data sharing concerns
- 🎯 **Goal-Focused** - AI helps you set and achieve realistic financial goals

## ✨ Live Demo

🌐 **Run locally**: `npm run dev` → `http://localhost:3000`

## ✨ Core Features

### 🔒 **Privacy-First Architecture**
- **Local Storage Only** - All data stored in your browser's localStorage
- **No Backend** - No databases, no servers, no cloud sync
- **Offline PWA** - Install as app, works without internet
- **Export/Import** - Full control over your data
- **No Tracking** - Zero analytics, zero data collection

### 💰 **Smart Expense Tracking**
- **AI Categorization** - Automatically sorts expenses (groceries, dining, etc.)
- **Recurring vs One-Time** - Track subscriptions and one-off purchases
- **Monthly Insights** - "You spend ~AED 500/month on food"
- **Pattern Recognition** - AI learns your spending habits
- **Budget Tracking** - Set limits per category

### 🎯 **Goal Setting & Forecasting**
- **Savings Goals** - Vacation, emergency fund, big purchases
- **AI Predictions** - "You'll hit your AED 5,000 goal in 8 months"
- **Feasibility Analysis** - AI suggests realistic goals based on spending
- **Progress Tracking** - Visual feedback on goal achievement
- **Smart Suggestions** - "Consider reducing subscriptions by AED 50/month"

### 👥 **Simple Bill Splitting**
- **Generate Shareable Summaries** - No live collaboration needed
- **Export/Import Bills** - Share with friends easily
- **Everyone Tracks Locally** - Each person manages on their device
- **Settlement Calculator** - Who owes whom

### 📊 **AI Insights & Analytics**
- **Spending Patterns** - Identify trends and habits
- **Forecasting** - Predict future expenses based on history
- **Smart Alerts** - "Unusual spending this month"
- **Category Breakdown** - Visual charts and insights
- **Recurring Expense Detection** - Never miss a subscription

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Full type safety
- **Tailwind CSS 4** - Modern styling
- **Redux Toolkit** - State management
- **Redux Persist** - localStorage integration

### AI & Intelligence
- **Local Pattern Matching** - No external AI APIs
- **Smart Categorization** - Learning algorithm
- **Forecasting Engine** - Predict spending trends
- **Goal Feasibility** - Calculate realistic targets

### Privacy Features
- **No Database** - Pure localStorage
- **PWA Support** - Offline-first architecture
- **Service Worker** - Cache for instant loading
- **Export/Import** - JSON data portability

## 🚀 Quick Start (Beginners Welcome!)

1. **Clone** (copy) this code to your computer:
   ```bash
   git clone https://github.com/BalajiJ234/wealthpulse.git
   cd wealthpulse
   ```

2. **Install** the required packages:
   ```bash
   npm install
   ```

3. **Run** the app:
   ```bash
   npm run dev
   ```

4. **Open** in your browser: [http://localhost:3000](http://localhost:3000)

That's it! 🎉

## 📂 What's Inside?

```
wealthpulse/
├── src/app/                 # Different pages (dashboard, expenses, income, goals, etc.)
├── src/components/          # Reusable UI pieces  
├── src/store/               # Redux state management
├── public/                  # PWA assets and icons
└── package.json             # Dependencies list
```
**Simple structure, easy to understand!** 📚

## 🎮 How to Use

### � **Track Your Expenses**
1. Add an expense with description and amount
2. AI automatically suggests category
3. Mark as recurring or one-time
4. View monthly/weekly insights

### 🎯 **Set Financial Goals**
1. Create a goal (e.g., "Vacation - AED 5,000")
2. Set target date
3. AI analyzes feasibility based on your spending
4. Get monthly savings targets
5. Track progress with visual indicators

### 👥 **Split Bills**
1. Add friends (stored locally)
2. Create bill with description and amount
3. Select who participated
4. Choose split method (equal/custom/percentage)
5. Export summary to share with friends

### 📊 **View AI Insights**
- Dashboard shows spending trends
- Category breakdowns
- Recurring expense alerts
- Budget recommendations
- Goal progress forecasts

### 🔒 **Privacy & Data Control**
- **Export**: Settings → Data Management → Export
- **Import**: Settings → Data Management → Import
- **Clear**: Settings → Data Management → Clear All Data
- Your data never leaves your device!

## 🚀 Want to Deploy?

```bash
npm run build      # Make production version
npm start          # Run production server
```

## 🤖 How AI Works (Locally!)

### Privacy-First AI
All AI processing happens **on your device** - no data sent to external APIs:

1. **Expense Categorization**
   - Pattern matching against common keywords
   - Learns from your manual corrections
   - Improves accuracy over time
   - 100% local processing

2. **Goal Feasibility Analysis**
   - Analyzes your spending history
   - Calculates monthly savings capacity
   - Suggests realistic timelines
   - Provides actionable recommendations

3. **Spending Forecasts**
   - Identifies recurring patterns
   - Predicts future expenses
   - Detects anomalies
   - All calculations in-browser

4. **Smart Suggestions**
   - "You spend 30% on dining - consider cooking more"
   - "You can save AED 200/month by reducing subscriptions"
   - "At current rate, goal achievable in X months"

**No API Keys, No Cloud, No Data Sharing** - Pure client-side intelligence!

## 🌟 Current Status

### ✅ **Implemented**
- [x] Privacy-first localStorage architecture
- [x] AI expense categorization
- [x] Goal setting with AI feasibility analysis
- [x] Bill splitting with export/import
- [x] PWA offline support
- [x] Redux Persist for data persistence
- [x] Mobile-responsive UI
- [x] Complete data export/import

### 🚀 **Planned Enhancements**
- [ ] Enhanced AI forecasting (3-6 month predictions)
- [ ] Recurring expense auto-detection
- [ ] Budget alerts and notifications
- [ ] Advanced spending insights dashboard
- [ ] Category-based budget limits
- [ ] Multi-currency support improvements
- [ ] Data visualization charts (spending trends)
- [ ] Goal milestone celebrations

## 🎯 Philosophy & Design Decisions

### Why Privacy-First?
1. **Your Money, Your Data** - Financial data is extremely sensitive
2. **No Trust Required** - You don't need to trust us or any cloud provider
3. **Works Offline** - No internet? No problem!
4. **No Subscriptions** - Free forever, no premium tiers
5. **Future-Proof** - Your data won't disappear if service shuts down

### Why Local AI?
1. **Instant Processing** - No API latency
2. **Zero Cost** - No API fees ever
3. **Privacy Protected** - Data never leaves device
4. **Always Available** - Works offline
5. **Customizable** - Easy to add your own patterns

### Target Users
- **Privacy-Conscious Individuals** - Who don't trust cloud services
- **Budget Trackers** - Want simple expense management
- **Goal Setters** - Need help planning financial goals
- **Offline Users** - Limited or no internet access
- **Students & Learners** - Want to study modern web + AI

## 🤝 Contributing

This project is **open for contributions**:

### Ideas to Implement
- [ ] More AI categorization patterns
- [ ] Budget limit notifications
- [ ] Spending trend visualizations
- [ ] Recurring expense detection improvements
- [ ] Multi-language support
- [ ] Dark mode enhancements
- [ ] Advanced goal tracking features

### How to Contribute
1. **Fork** this repository
2. **Create** a feature branch
3. **Implement** your enhancement
4. **Test** locally
5. **Submit** a pull request

## 📞 Get Help

- **GitHub Issues**: Report bugs or ask questions
- **Discussions**: Share ideas and learn from others
- **Code**: Browse the source - it's designed to be readable!

---

## 🎯 Key Takeaways

### For Privacy Advocates
- ✅ **Zero-knowledge architecture** - We literally can't see your data
- ✅ **No analytics or tracking** - Not even anonymized
- ✅ **Open source** - Audit the code yourself
- ✅ **Self-hostable** - Run your own instance

### For Developers
- 📚 **Modern stack** - Next.js 15, React 19, TypeScript
- 🔒 **Privacy patterns** - localStorage, PWA, offline-first
- 🤖 **Local AI** - Client-side intelligence
- 🎨 **Clean architecture** - Redux Toolkit, modular design

### For Users
- 💰 **Free forever** - No subscriptions, no paywalls
- 📱 **Works offline** - Install as PWA
- 🔐 **Private by design** - Your data stays yours
- 🎯 **Actually useful** - Real financial insights

---

<div align="center">

## 🚀 Mission Statement

**"Your private, AI-powered spending companion that helps you understand your money habits, set realistic goals, and make smarter financial decisions - all while keeping your data 100% on your device."**

### Built with Privacy 🔒 | Powered by Local AI 🤖 | Free Forever 💚

**Star ⭐ if you value privacy-first software!**

</div>

---

## 📄 License

MIT License - Free to use, modify, and distribute

## 💬 Questions?

- **Issues**: Report bugs or request features
- **Discussions**: Share ideas and feedback
- **Code**: Browse and learn from the source

**Remember**: Your data is YOURS. We can't see it, don't want to see it, and will never ask for it! �