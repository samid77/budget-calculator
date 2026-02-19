'use client'

import { Expense, CATEGORIES, Currency, formatCurrency } from '@/types'
import { PieChart, Filter } from 'lucide-react'

interface CategoryBreakdownProps {
  expenses: Expense[]
  currency: Currency
  filterCategory?: string
  onFilterChange?: (category: string) => void
}

export default function CategoryBreakdown({ expenses, currency, filterCategory, onFilterChange }: CategoryBreakdownProps) {
  const categoryTotals: Record<string, number> = {}
  
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount
  })

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  
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
                  className="h-full flex items-center px-3 text-white text-xs font-bold rounded-full transition-all duration-500"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: info.color,
                    minWidth: percentage > 0 ? '40px' : '0'
                  }}
                >
                  {percentage > 8 && `${percentage.toFixed(1)}%`}
                </div>
              </div>
              <div className="min-w-[100px] text-right font-bold text-gray-900">
                {formatCurrency(amount, currency)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
