'use client'

import { Expense, CATEGORIES, Currency, formatCurrency } from '@/types'
import { BarChart3, PieChart, Filter } from 'lucide-react'

interface AnalyticsPanelProps {
  expenses: Expense[]
  budget: number
  currency: Currency
  filterCategory?: string
  onFilterChange?: (category: string) => void
}

export default function AnalyticsPanel({ expenses, budget, currency, filterCategory, onFilterChange }: AnalyticsPanelProps) {
  // Statistics calculations
  const totalExpenses = expenses.length
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const avgExpense = totalExpenses > 0 ? totalSpent / totalExpenses : 0
  const largestExpense = totalExpenses > 0 
    ? Math.max(...expenses.map(exp => exp.amount)) 
    : 0

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date)
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear
  })
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const monthTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const dailyAvg = monthTotal / daysInMonth

  const stats = [
    { label: 'Total Expenses', value: totalExpenses.toString() },
    { label: 'Average per Expense', value: formatCurrency(avgExpense, currency) },
    { label: 'Largest Expense', value: formatCurrency(largestExpense, currency) },
    { label: 'Daily Average', value: formatCurrency(dailyAvg, currency) },
  ]

  // Category breakdown calculations
  const categoryTotals: Record<string, number> = {}
  
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount
  })
  
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => {
      const categoryInfo = CATEGORIES.find(cat => cat.value === category)
      return {
        category,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
        info: categoryInfo || CATEGORIES[CATEGORIES.length - 1]
      }
    })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Statistics Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary-500" />
          Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
              <p className="text-xs font-medium text-gray-600 mb-2">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* Category Breakdown Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary-500" />
            Spending by Category
          </h2>
          {onFilterChange && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterCategory || 'all'}
                onChange={(e) => onFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-sm"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {sortedCategories.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No category data available yet.
          </p>
        ) : (
          <div className="space-y-4">
            {sortedCategories.map(({ category, amount, percentage, info }) => (
              <div key={category} className="flex items-center gap-3">
                <div className="min-w-[160px] font-semibold text-sm text-gray-700">
                  {info.label}
                </div>
                <div className="flex-1 relative h-8 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className="absolute inset-0 transition-all duration-500 rounded-full flex items-center justify-center"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: info.color,
                    }}
                  >
                    {percentage > 15 && (
                      <span className="text-xs font-bold text-white px-2">
                        {percentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="min-w-[140px] text-right">
                  <span className="font-bold text-gray-900">{formatCurrency(amount, currency)}</span>
                  {percentage <= 15 && (
                    <span className="ml-2 text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
