export interface Expense {
  id: string
  budgetId?: string  // Optional for backward compatibility
  label: string
  amount: number
  category: string
  date: string
}

export interface IncomeSource {
  id: string
  budgetId: string
  name: string
  amount: number
}

export interface BudgetData {
  id: string
  name: string
  amount: number
  currency: string
  createdAt: string
  incomeSources?: IncomeSource[]  // Optional for backward compatibility
}

export interface AppData {
  budgets: BudgetData[]
  expenses: Expense[]
  activeBudgetId: string | null
}

export type DateRange = 'all' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'custom'

export interface CustomDateRange {
  startDate: string
  endDate: string
}

export interface Currency {
  code: string
  symbol: string
  name: string
  locale: string
}

export const CURRENCIES: Currency[] = [
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
]

export const CATEGORIES = [
  { value: 'food', label: '🍔 Food & Dining', color: '#FF6200' },
  { value: 'housing', label: '🏠 Housing & Rent', color: '#1976D2' },
  { value: 'transportation', label: '🚗 Transportation', color: '#00ACC1' },
  { value: 'education', label: '📚 Education', color: '#5E35B1' },
  { value: 'healthcare', label: '⚕️ Healthcare', color: '#E91E63' },
  { value: 'entertainment', label: '🎬 Entertainment', color: '#F57C00' },
  { value: 'utilities', label: '💡 Utilities', color: '#00897B' },
  { value: 'shopping', label: '🛍️ Shopping', color: '#8E24AA' },
  { value: 'savings', label: '💵 Savings', color: '#03AC0E' },
  { value: 'other', label: '📌 Other', color: '#757575' },
] as const

export const formatCurrency = (amount: number, currency: Currency): string => {
  const formatted = new Intl.NumberFormat(currency.locale, {
    minimumFractionDigits: currency.code === 'IDR' || currency.code === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency.code === 'IDR' || currency.code === 'JPY' ? 0 : 2,
  }).format(amount)
  
  return `${currency.symbol} ${formatted}`
}
