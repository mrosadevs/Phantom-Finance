// ============================================
// PHANTOM FINANCE - DEMO DATA (Fictional Sample)
// This is entirely fictional data for demonstration.
// ============================================

export const demoData = {
  version: 1,
  profile: {
    name: "Demo User",
    currency: "USD"
  },
  income: [
    { id: "inc1", name: "Software Engineer Salary", amount: 6200, frequency: "monthly" },
    { id: "inc2", name: "Freelance Design Work", amount: 1800, frequency: "monthly" }
  ],
  monthlyExpenses: [
    { id: "exp1", name: "Groceries & Meal Prep", amount: 650, category: "Food", dueDay: 1, autoPay: false },
    { id: "exp2", name: "Rent", amount: 1850, category: "Housing", dueDay: 1, autoPay: true },
    { id: "exp3", name: "Electric & Gas", amount: 145, category: "Utilities", dueDay: 12, autoPay: true },
    { id: "exp4", name: "Water & Sewer", amount: 55, category: "Utilities", dueDay: 18, autoPay: true },
    { id: "exp5", name: "Cell Phone Plan", amount: 95, category: "Phone", dueDay: 22, autoPay: true },
    { id: "exp6", name: "Internet", amount: 70, category: "Internet", dueDay: 5, autoPay: true },
    { id: "exp7", name: "Car Insurance", amount: 185, category: "Insurance", dueDay: 15, autoPay: true },
    { id: "exp8", name: "Gas / Transit", amount: 200, category: "Transportation", dueDay: 1, autoPay: false },
    { id: "exp9", name: "Gym Membership", amount: 45, category: "Health", dueDay: 3, autoPay: true },
    { id: "exp10", name: "Spotify + Streaming", amount: 32, category: "Entertainment", dueDay: 10, autoPay: true },
    { id: "exp11", name: "Pet Supplies", amount: 75, category: "Personal", dueDay: 1, autoPay: false },
    { id: "exp12", name: "Renter's Insurance", amount: 28, category: "Insurance", dueDay: 7, autoPay: true }
  ],
  debts: [
    { id: "d1", name: "Student Loan (Federal)", monthlyPayment: 320, totalDebt: 28500, originalDebt: 42000, dueDay: 15, interestRate: "5.5%", notes: "Income-driven repayment plan", category: "student" },
    { id: "d2", name: "Car Loan (2022 Civic)", monthlyPayment: 385, totalDebt: 12400, originalDebt: 22000, dueDay: 5, interestRate: "4.9%", notes: "Ends March 2028", category: "auto" },
    { id: "d3", name: "Visa Platinum", monthlyPayment: 150, totalDebt: 3200, originalDebt: 5800, dueDay: 20, interestRate: "18.9%", notes: "Paying down aggressively", category: "credit-card" },
    { id: "d4", name: "Discover Card", monthlyPayment: 75, totalDebt: 1450, originalDebt: 2100, dueDay: 12, interestRate: "16.5%", notes: "", category: "credit-card" },
    { id: "d5", name: "Best Buy Financing", monthlyPayment: 55, totalDebt: 890, originalDebt: 1400, dueDay: 8, interestRate: "0%", notes: "0% promo ends August 2026", category: "credit-card" },
    { id: "d6", name: "Medical Bill (ER Visit)", monthlyPayment: 100, totalDebt: 2800, originalDebt: 4200, dueDay: 1, interestRate: "0%", notes: "Payment plan with hospital", category: "medical" },
    { id: "d7", name: "Personal Loan (Credit Union)", monthlyPayment: 210, totalDebt: 5600, originalDebt: 8000, dueDay: 25, interestRate: "7.2%", notes: "Used for moving expenses", category: "general" },
    { id: "d8", name: "IKEA Financing", monthlyPayment: 45, totalDebt: 680, originalDebt: 1200, dueDay: 16, interestRate: "0%", notes: "Living room furniture", category: "credit-card" },
    { id: "d9", name: "Dental Work (CareCredit)", monthlyPayment: 85, totalDebt: 1700, originalDebt: 3400, dueDay: 22, interestRate: "0%", notes: "Promo rate ends Dec 2026", category: "medical" },
    { id: "d10", name: "Amazon Store Card", monthlyPayment: 40, totalDebt: 520, originalDebt: 750, dueDay: 3, interestRate: "24.9%", notes: "Pay off ASAP", category: "credit-card" },
    { id: "d11", name: "Laptop Financing (Dell)", monthlyPayment: 65, totalDebt: 780, originalDebt: 1500, dueDay: 10, interestRate: "0%", notes: "Work laptop", category: "general" },
    { id: "d12", name: "State Tax Balance 2024", monthlyPayment: 125, totalDebt: 1500, originalDebt: 1500, dueDay: 15, interestRate: "3%", notes: "Installment agreement", category: "irs" }
  ],
  propertyExpenses: [
    { id: "p1", name: "New Kitchen Faucet", cost: 350, completed: true },
    { id: "p2", name: "Bathroom Vanity Replacement", cost: 1200, completed: true },
    { id: "p3", name: "Living Room Paint", cost: 400, completed: true },
    { id: "p4", name: "Bedroom Carpet Replacement", cost: 2800, completed: false },
    { id: "p5", name: "Smart Thermostat Install", cost: 280, completed: true },
    { id: "p6", name: "Patio Furniture Set", cost: 1500, completed: false },
    { id: "p7", name: "Kitchen Backsplash Tile", cost: 900, completed: false },
    { id: "p8", name: "Garage Shelving & Organization", cost: 600, completed: true },
    { id: "p9", name: "Window Blinds (All Rooms)", cost: 1100, completed: false },
    { id: "p10", name: "Front Door Replacement", cost: 2200, completed: false },
    { id: "p11", name: "Deck Power Wash & Stain", cost: 450, completed: true },
    { id: "p12", name: "Ceiling Fan Installation (x3)", cost: 750, completed: false },
    { id: "p13", name: "Garden Bed & Landscaping", cost: 800, completed: false },
    { id: "p14", name: "Washer & Dryer Upgrade", cost: 1800, completed: false },
    { id: "p15", name: "Security Camera System", cost: 650, completed: true }
  ],
  annualBudget: [
    { id: "a1", name: "Salary Income", amount: 74400, isIncome: true },
    { id: "a2", name: "Freelance Income", amount: 21600, isIncome: true },
    { id: "a3", name: "Housing (Rent + Utils)", amount: 24600, isIncome: false },
    { id: "a4", name: "Food & Dining", amount: 9600, isIncome: false },
    { id: "a5", name: "Transportation", amount: 7000, isIncome: false },
    { id: "a6", name: "Debt Payments", amount: 19500, isIncome: false },
    { id: "a7", name: "Insurance (All)", amount: 3800, isIncome: false },
    { id: "a8", name: "Entertainment & Personal", amount: 4200, isIncome: false },
    { id: "a9", name: "Emergency Fund Savings", amount: 6000, isIncome: false },
    { id: "a10", name: "Retirement (401k + Roth)", amount: 12000, isIncome: false }
  ],
  businessExpenses: [
    { id: "b1", name: "Adobe Creative Suite", monthlyCost: 55, annualCost: 660, category: "Software" },
    { id: "b2", name: "Figma Pro", monthlyCost: 15, annualCost: 180, category: "Software" },
    { id: "b3", name: "Domain & Hosting", monthlyCost: 12, annualCost: 144, category: "Hosting" },
    { id: "b4", name: "Notion Workspace", monthlyCost: 10, annualCost: 120, category: "Productivity" },
    { id: "b5", name: "Google Workspace", monthlyCost: 14, annualCost: 168, category: "Productivity" },
    { id: "b6", name: "Liability Insurance", monthlyCost: 35, annualCost: 420, category: "Insurance" },
    { id: "b7", name: "Accounting (TurboTax Self-Employed)", monthlyCost: 10, annualCost: 120, category: "Accounting" },
    { id: "b8", name: "Stock Photos (Shutterstock)", monthlyCost: 29, annualCost: 348, category: "Resources" }
  ],
  settings: {
    theme: "dark",
    language: "en",
    notificationsEnabled: false,
    reminderDaysBefore: 3
  }
};
