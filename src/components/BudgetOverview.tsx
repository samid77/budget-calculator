'use client'

import { Expense, Currency, formatCurrency } from '@/types'
import { Wallet, TrendingDown, TrendingUp } from 'lucide-react'

interface BudgetOverviewProps {
  budget: number
  expenses: Expense[]
  currency: Currency
}

export default function BudgetOverview({ budget, expenses, currency }: BudgetOverviewProps) {
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const remaining = budget - totalSpent
  const percentage = budget > 0 ? (totalSpent / budget) * 100 : 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border-2 border-gray-100 rounded-lg p-5 border-t-4 border-t-primary-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Budget</span>
            <Wallet className="h-5 w-5 text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(budget, currency)}</p>
        </div>

        <div className="bg-white border-2 border-gray-100 rounded-lg p-5 border-t-4 border-t-secondary-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Spent</span>
            <TrendingDown className="h-5 w-5 text-secondary-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent, currency)}</p>
        </div>

        <div className={`bg-white border-2 border-gray-100 rounded-lg p-5 border-t-4 ${remaining >= 0 ? 'border-t-primary-500' : 'border-t-red-500'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Remaining</span>
            <TrendingUp className={`h-5 w-5 ${remaining >= 0 ? 'text-primary-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-primary-500' : 'text-red-500'}`}>
            {formatCurrency(Math.abs(remaining), currency)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-2 bg-green-50 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 text-center font-medium">
          {percentage.toFixed(1)}% of budget used
        </p>
      </div>
    </div>
  )
}
