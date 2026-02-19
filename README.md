# 💰 Budget Calculator - Next.js & Tailwind CSS

A modern, feature-rich budget calculator built with Next.js 14, TypeScript, and Tailwind CSS. Perfect for couples, students, and individuals managing monthly finances.

## ✨ Features

- **Modern Tech Stack**: Built with Next.js 14, React 18, TypeScript, and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Tracking**: Instant budget updates and progress visualization
- **Category Management**: 10 pre-defined expense categories with color coding
- **Smart Statistics**: Track spending patterns with detailed analytics
- **Data Persistence**: Auto-save to localStorage
- **Export Functionality**: Download budget data as CSV
-  🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone or navigate to the project directory:
```bash
cd personal-budget-app
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

## 📦 Build for Production

```b� Features Overview

### Budget Management
- Set monthly budget
- Real-time remaining balance
- Visual progress bar
- Percentage tracking

### Expense Tracking
- Add expenses with name, amount, category, and date
- Edit existing expenses
- Delete expenses with confirmation
- Filter by category
- Sort by date (newest first)

### Analytics
- Total expenses count
- Average expense amount
- Largest single expense
- Daily spending average
- Category breakdown with percentages

###🎨 Color Scheme

- **Primary Green**: #03AC0E (Tokopedia-inspired)
- **Secondary Orange**: #FF6200
- **Background**: #F5F5F5
- **Cards**: White with subtle shadows
- **Text**: Gray scale for hierarchy

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Customization

### Adding New Categories

Edit `src/types/index.ts`:

```typescript
export const CATEGORIES = [
  { value: 'custom', label: '🎯 Custom Category', color: '#Your-Color' },
  // ... existing categories
]
```

### Changing Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#YourColor',
      },
    },
  },
}
```

## 📄 License

This project is free to use for personal and commercial purposes.

## 🤝 Contributing

Feel free to submit issues and enhancement requests
- **Largest Expense**: Your biggest single expense
- **Daily Average**: Average spending per day this month

### Category Breakdown
- Visual bars showing percentage of spending per category
- Sorted by highest spending first
- Color-coded for easy identification

## 🔧 Technical Details

- **Pure HTML/CSS/JavaScript** - No frameworks required
- **Modern ES6+** - Clean, maintainable code
- **Local Storage API** - Data persistence
- **Responsive CSS Grid & Flexbox** - Modern layouts
- **Cross-browser Compatible** - Works on all modern browsers

## 📱 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## 💡 Tips for Best Use

1. **Set Realistic Budgets** - Base your budget on actual income
2. **Record Expenses Daily** - Don't wait to log expenses
3. **Use Categories Consistently** - Helps with analysis
4. **Review Weekly** - Check your spending patterns regularly
5. **Export Monthly** - Keep records of past months
6. **Plan Ahead** - Use the data to plan next month's budget

## 🆘 Troubleshooting

**Q: My data disappeared!**
- A: Check if you cleared browser data. Use Export to backup regularly.

**Q: Can I use this for multiple months?**
- A: Export your current month's data, then reset for a new month. Save the exports to track over time.

**Q: Can I add custom categories?**
- A: Currently, the app uses 10 predefined categories that cover most needs.

**Q: Is my data secure?**
- A: Data is stored locally in your browser. It never leaves your device.

## 🎉 Enjoy Managing Your Budget!

Start taking control of your finances today with this easy-to-use budget calculator!

---

Built with ❤️ for smart budgeting | © 2026
using Next.js and Tailwind CSS