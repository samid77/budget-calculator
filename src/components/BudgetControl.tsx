'use client'

import { useState } from 'react'
import { Wallet, TrendingDown, TrendingUp } from 'lucide-react'
import { Currency, CURRENCIES, Expense, formatCurrency } from '@/types'

interface BudgetControlProps {
  budgetName: string
  budgetAmount: number
  expenses: Expense[]
  currency: Currency
  onSetBudget: (name: string, amount: number) => void
  onCurrencyChange: (currency: Currency) => void
}

export default function BudgetControl({ 
  budgetName,
  budgetAmount, 
  expenses, 
  currency, 
  onSetBudget, 
  onCurrencyChange 
}: BudgetControlProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const remaining = budgetAmount - totalSpent
  const percentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0

  const formatNumberWithCommas = (value: string): string => {
    // Remove all non-digit characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '')
    if (!cleanValue) return ''
    
    // Split by decimal point
    const parts = cleanValue.split('.')
    // Format the integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    // Return formatted value (max 2 decimal places)
    return parts.length > 1 ? parts[0] + '.' + parts[1].slice(0, 2) : parts[0]
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatNumberWithCommas(inputValue)
    setAmount(formatted)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const budget = parseFloat(amount.replace(/,/g, ''))
    if (budget > 0 && name.trim()) {
      onSetBudget(name.trim(), budget)
      setName('')
      setAmount('')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Budget Name Display */}
      {budgetName && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary-500" />
            {budgetName}
          </h2>
        </div>
      )}

      {/* Budget Setup Form */}
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-3">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Budget Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Budget"
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Amount
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-semibold">
                {currency.symbol}
              </span>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                inputMode="decimal"
                className="block w-full pl-12 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Currency
            </label>
            <select
              value={currency.code}
              onChange={(e) => {
                const newCurrency = CURRENCIES.find(c => c.code === e.target.value)
                if (newCurrency) onCurrencyChange(newCurrency)
              }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              className="w-full px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-md hover:bg-primary-600 transition-colors"
            >
              Set Budget
            </button>
          </div>
        </form>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border-2 border-gray-100 rounded-lg p-5 border-t-4 border-t-primary-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Budget</span>
            <Wallet className="h-5 w-5 text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(budgetAmount, currency)}</p>
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

      {/* Progress Bar */}
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
