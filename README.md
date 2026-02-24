<div align="center">

# 👻 Phantom Finance

### ✨ Your Personal Budget Command Center ✨

**A sleek, cyberpunk-themed personal finance tracker built for people who want full control of their money — without the bloat.**

[![Built with Vite](https://img.shields.io/badge/Built%20with-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-C8FF00?style=for-the-badge)](LICENSE)

---

🔮 **Track Income** · 💸 **Manage Expenses** · 🏦 **Crush Debt** · 🏠 **Property Costs** · 📊 **Annual Budgets** · 💼 **Business Expenses**

---

</div>

## 🎬 What is Phantom Finance?

Phantom Finance is a **fully offline, privacy-first** personal finance dashboard that runs entirely in your browser. No accounts. No servers. No subscriptions. Just you and your money.

Built with **vanilla JavaScript** and a stunning dark cyberpunk aesthetic, it gives you a bird's-eye view of your entire financial picture — from monthly bills to long-term debt payoff progress.

---

## 🚀 Features

### 📱 7 Powerful Pages

| Page | Description |
|------|-------------|
| 🏠 **Dashboard** | At-a-glance financial overview with charts, alerts, and smart tips |
| 💰 **Monthly Budget** | Track income sources and recurring monthly expenses |
| 🏦 **Debt Tracker** | Monitor all debts with progress bars and payoff tracking |
| 🏡 **Property** | Home renovation and improvement cost tracker |
| 📅 **Annual Budget** | Yearly income vs. expense projections |
| 💼 **Business** | Freelance and business expense management |
| ⚙️ **Settings** | Theme, notifications, data management, and more |

### 🧠 Smart Financial Tips
- **245+ curated tips** across 15 categories
- 🎯 **Contextual tips** that adapt to YOUR financial situation
- 📆 **Daily rotating tip** — fresh advice every day
- 🔄 One-click refresh for new tips on the dashboard

### 🔔 Payment Reminders
- Browser push notifications for upcoming bills
- ⏰ Configurable reminder window (1–7 days before due)
- 📋 Groups multiple upcoming payments into one alert
- 🧪 Test notification to make sure it's working

### 💾 Data Import & Export
- 📥 **Import JSON** — Load a Phantom Finance backup
- 📥 **Import Excel** — Parse data from `.xlsx` spreadsheets
- 📤 **Export JSON** — Full backup you can re-import anytime
- 📤 **Export Excel** — Multi-sheet workbook with all your data
- ⭐ **Demo Mode** — Try the app with sample data (nothing saved!)

### 🎨 Design & UX
- 🌙 **Dark Mode** (default) + ☀️ **Light Mode**
- ✨ Animated particle background
- 🖱️ Custom cursor effects
- 📱 Fully responsive — **mobile to 8K ultrawide**
- 🎭 Smooth animations and transitions throughout
- 🍩 Donut charts, progress bars, and visual breakdowns

### 🔒 Privacy First
- 💻 **100% client-side** — your data never leaves your browser
- 🗄️ Stored in `localStorage` — no databases, no cloud
- 🚫 No tracking, no analytics, no cookies
- 🗑️ One-click "Delete All Data" with safety confirmation

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| ⚡ **Vite** | Lightning-fast dev server & build tool |
| 🟨 **Vanilla JS** | Zero framework overhead — pure ES6 modules |
| 🎨 **CSS Custom Properties** | Full design system with theme support |
| 📊 **SheetJS (xlsx)** | Excel import/export engine |
| 🔤 **Google Fonts** | Bebas Neue, Barlow Condensed, JetBrains Mono, Syne |

---

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repo
git clone https://github.com/mrosadevs/Phantom-Finance.git

# Navigate to the project
cd Phantom-Finance

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will open at **`http://localhost:5174`** 🎉

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🗂️ Project Structure

```
👻 Phantom-Finance/
├── 📄 index.html              # Main HTML shell
├── ⚙️ vite.config.js          # Vite configuration
├── 📦 package.json             # Dependencies & scripts
│
├── 🎨 src/
│   ├── 🚀 main.js             # App entry point & routing
│   │
│   ├── 📄 pages/
│   │   ├── landing.js          # Welcome / onboarding page
│   │   ├── dashboard.js        # Main dashboard
│   │   ├── monthly.js          # Monthly budget tracker
│   │   ├── debts.js            # Debt management
│   │   ├── property.js         # Property expenses
│   │   ├── annual.js           # Annual budget view
│   │   ├── business.js         # Business expenses
│   │   └── settings.js         # App settings
│   │
│   ├── ⚡ services/
│   │   ├── store.js            # State management & persistence
│   │   ├── exporter.js         # JSON & Excel import/export
│   │   ├── notifications.js    # Push notification system
│   │   ├── tips.js             # 245+ financial tips engine
│   │   └── demo-data.js        # Fictional sample data
│   │
│   ├── 🧩 components/
│   │   ├── modal.js            # Modal dialog system
│   │   ├── toast.js            # Toast notifications
│   │   ├── particles.js        # Animated background
│   │   └── cursor.js           # Custom cursor effects
│   │
│   ├── 🎨 styles/
│   │   ├── base.css            # Reset & responsive scaling
│   │   ├── theme.css           # Design system & colors
│   │   ├── components.css      # UI component styles
│   │   ├── landing.css         # Landing page styles
│   │   ├── dashboard.css       # Dashboard-specific styles
│   │   └── app.css             # Layout & page styles
│   │
│   └── 🔧 utils/
│       └── helpers.js          # Utility functions
│
└── 📁 public/                  # Static assets
```

---

## 🎮 Quick Start Guide

1. **🌐 Open the app** — You'll land on the welcome page
2. **⭐ Try Demo Mode** — Click the ★ Demo button in the nav to explore with sample data
3. **📥 Import Your Data** — Use the Import button to load a JSON backup or Excel file
4. **📊 Explore Pages** — Navigate through Dashboard, Budget, Debts, Property, Annual, and Business
5. **🔔 Enable Notifications** — Go to Settings to turn on payment reminders
6. **📤 Export Anytime** — Back up your data as JSON or Excel whenever you want

---

## 🌈 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| 🟢 **Lime** | `#C8FF00` | Primary accent, income, success |
| 🟣 **Violet** | `#7000FF` | Secondary accent, debts |
| 🩷 **Pink** | `#FF2D6B` | Tertiary accent, warnings |
| 🔵 **Cyan** | `#00D4FF` | Info accent, business |
| 🟠 **Orange** | `#FF8800` | Alert accent, reminders |

---

## 📱 Responsive Breakpoints

| Viewport | Max Width | Target |
|----------|-----------|--------|
| 📱 Mobile | `90vw` | Phones & small tablets |
| 💻 HD | `1200px` | Standard laptops |
| 🖥️ FHD | `1400px` | 1080p monitors |
| 🖥️ QHD | `1600px` | 1440p monitors |
| 🖥️ 4K | `2100px` | 2560p monitors |
| 🖥️ 5K | `3200px` | Ultra-wide displays |
| 🖥️ 8K | `6400px` | 8K displays |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

---

## 📄 License

This project is [MIT](LICENSE) licensed.

---

<div align="center">

**Built with 💚 by [@mrosadevs](https://github.com/mrosadevs)**

*Your finances, your rules. No cloud. No fees. Just clarity.* 👻

</div>
