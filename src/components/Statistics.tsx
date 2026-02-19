'use client'

import { Expense, Currency, formatCurrency } from '@/types'
import { BarChart3 } from 'lucide-react'

interface StatisticsProps {
  expenses: Expense[]
  budget: number
  currency: Currency
}

export default function Statistics({ expenses, budget, currency }: StatisticsProps) {
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
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
  )
}
