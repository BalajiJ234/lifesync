# LifeSync - Personal Life Management App

> **Complete monolithic implementation** - A comprehensive personal management application built with Next.js 15, featuring expense tracking, todo management, notes, and bill splitting.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)](https://tailwindcss.com/)

## 🌟 Live Demo

🔗 **[Visit LifeSync](https://your-vercel-url.vercel.app)** *(Deploy to get live URL)*

## 📱 Screenshots

| Dashboard | Notes | Expenses | Todos | Splits |
|-----------|-------|-----------|-------|---------|
| ![Dashboard](./screenshots/dashboard.png) | ![Notes](./screenshots/notes.png) | ![Expenses](./screenshots/expenses.png) | ![Todos](./screenshots/todos.png) | ![Splits](./screenshots/splits.png) |

## 🚀 Features

### ✅ **Complete Feature Set**
- **📝 Smart Notes**: Color-coded sticky notes with inline editing and search
- **💰 Expense Tracker**: Full expense management with categories, analytics, and filtering
- **✅ Todo Manager**: Task management with priorities, due dates, and smart filtering
- **👥 Bill Splitter**: Split expenses with friends, track balances, and settlements
- **🏠 Intelligent Dashboard**: Real-time stats, recent activity, and quick actions
- **� PWA Ready**: Progressive Web App capabilities for mobile installation

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PWA**: Next-PWA for mobile app experience
- **TypeScript**: Type-safe development

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd lifesync
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🗂️ Project Structure

```
lifesync/
├── src/
│   ├── app/
│   │   ├── dashboard/        # Dashboard page
│   │   ├── notes/           # Notes functionality
│   │   ├── expenses/        # Expense tracking (coming soon)
│   │   ├── todos/           # Todo management (coming soon)
│   │   ├── splits/          # Bill splitting (coming soon)
│   │   ├── api/             # API routes
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/
│   │   └── Navigation.tsx   # Main navigation component
│   └── lib/
│       └── utils.ts         # Utility functions
├── public/
│   └── manifest.json        # PWA manifest
└── package.json
```

## 🎯 Usage

### Notes Feature
- **Add Notes**: Type your note and press "Add Note" or use Ctrl+Enter
- **Edit Notes**: Click the edit icon on any note
- **Delete Notes**: Click the X icon to remove a note
- **Color Coding**: Notes are automatically assigned different colors

### Dashboard
- View quick stats for all your data
- Access all features through quick action cards
- See recent activity (coming soon)

## 📱 PWA Features

LifeSync is designed as a Progressive Web App (PWA) which means:
- **Install on Mobile**: Add to home screen for native app experience
- **Offline Support**: Core features work without internet (coming soon)
- **Push Notifications**: Get reminders and alerts (coming soon)

## 🚀 Deployment

The app can be deployed on various platforms:

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Build for Production
```bash
npm run build
npm start
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for consistent styling

### 🎯 **Detailed Features**

#### � **Smart Notes System**
- **Rich Text Support**: Multiline notes with preserved formatting
- **Color Coding**: Auto-assigned colors for visual organization
- **Inline Editing**: Edit notes directly without modals
- **Keyboard Shortcuts**: Ctrl+Enter for quick saves, Escape to cancel
- **Timestamps**: Creation and modification tracking

#### 💰 **Advanced Expense Tracker**
- **10 Categories**: Food, Transport, Shopping, Entertainment, Bills, Healthcare, Education, Travel, Personal Care, Other
- **Smart Analytics**: Monthly/weekly totals, daily averages, top categories
- **Advanced Filtering**: Search by description, filter by category/date
- **Detailed Entries**: Amount, description, category, date, optional notes
- **Visual Indicators**: Category-specific icons and colors

#### ✅ **Comprehensive Todo Manager**
- **Priority System**: High, Medium, Low with color-coded indicators
- **Due Date Management**: Overdue detection, "due today" highlighting
- **Categories**: Personal, Work, Shopping, Health, Finance, Other
- **Smart Filtering**: Status, category, search, and date-based filters
- **Progress Tracking**: Completion stats and progress indicators

#### 👥 **Intelligent Bill Splitter**
- **Friend Management**: Add friends with avatars and contact info
- **Flexible Splitting**: Equal split or custom amounts per person
- **Balance Calculation**: Automatic "who owes what" calculation
- **Settlement Tracking**: Mark bills as settled/unsettled
- **Smart Settlements**: Optimized balance resolution suggestions

#### 🏠 **Dynamic Dashboard**
- **Real-time Stats**: Live data from all modules
- **Recent Activity**: Timeline of recent actions across all features
- **Quick Actions**: One-click access to add new items
- **Smart Tips**: Contextual help and feature guidance

## 🛠️ Architecture

### **Monolithic Design Benefits**
- **Fast Development**: Single codebase, unified deployment
- **Simple Testing**: No microservice complexity
- **Easy Maintenance**: All features in one place
- **Perfect for MVPs**: Quick iterations and feature additions

### **Tech Stack Highlights**
- **Next.js 15**: Latest features with Turbopack for fast builds
- **React 19**: Server components and latest React features
- **TypeScript**: Full type safety across the application
- **Tailwind CSS 4**: Latest utility-first CSS framework
- **PWA Support**: Service workers for offline capabilities
- **Responsive Design**: Mobile-first approach with perfect desktop experience

## 🗺️ Roadmap & Future

### **✅ Completed (v1.0)**
- [x] Complete Notes system with editing
- [x] Full Expense tracking with analytics
- [x] Comprehensive Todo management
- [x] Advanced Bill splitting with friends
- [x] Dynamic dashboard with real data
- [x] PWA configuration
- [x] Mobile-responsive design

### **🔮 Future Enhancements (v2.0)**
- [ ] **Data Persistence**: Local storage / database integration
- [ ] **User Authentication**: Multi-user support
- [ ] **Cloud Sync**: Cross-device synchronization
- [ ] **AI Assistant**: Natural language expense/todo entry
- [ ] **Advanced Analytics**: Charts, trends, budget goals
- [ ] **Export Features**: PDF reports, CSV exports
- [ ] **Notifications**: Reminders and alerts

### **🏗️ Microservices Version**
> **Coming Soon**: `lifesync-microservices` - Enterprise-scale architecture with:
> - Separate services for each feature
> - API Gateway and service discovery
> - Container orchestration (Docker/K8s)
> - Advanced monitoring and logging
> - Team-based development workflow

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Modern web browser

### **Installation**
```bash
# Clone the repository
git clone https://github.com/yourusername/lifesync.git
cd lifesync

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### **Build for Production**
```bash
# Build the application
npm run build

# Start production server
npm start
```

### **Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 📊 Project Stats

- **Lines of Code**: ~2,000+ (TypeScript/TSX)
- **Components**: 15+ React components
- **Features**: 5 major feature modules
- **Mobile Responsive**: 100% mobile-friendly
- **Type Safety**: Full TypeScript coverage
- **Performance**: Optimized with Next.js 15 and Turbopack

## 🤝 Contributing

### **For Beginners**
1. Star ⭐ the repository
2. Fork the project
3. Create your feature branch: `git checkout -b feature/amazing-feature`
4. Commit your changes: `git commit -m 'Add some amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain mobile-first responsive design
- Write clean, readable code with proper comments
- Test features across different screen sizes

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For hosting and deployment platform
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide React** - For beautiful, consistent icons
- **TypeScript Team** - For type safety and developer experience

## 📞 Contact & Support

- **Author**: [Your Name](https://github.com/yourusername)
- **Email**: your.email@example.com
- **Portfolio**: [your-portfolio.com](https://your-portfolio.com)
- **LinkedIn**: [your-linkedin](https://linkedin.com/in/your-profile)

---

## 🌟 **Star History**

If you found this project helpful, please consider giving it a star ⭐!

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/lifesync&type=Date)](https://star-history.com/#yourusername/lifesync&Date)

---

<div align="center">

**Built with ❤️ using Next.js, React, and TypeScript**

**Happy Life Syncing! 🚀**

*Making personal management simple, beautiful, and effective.*

</div>
