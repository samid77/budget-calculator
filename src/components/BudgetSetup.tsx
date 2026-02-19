'use client'

import { useState } from 'react'
import { Wallet } from 'lucide-react'
import { Currency, CURRENCIES } from '@/types'

interface BudgetSetupProps {
  onSetBudget: (amount: number) => void
  currency: Currency
  onCurrencyChange: (currency: Currency) => void
}

export default function BudgetSetup({ onSetBudget, currency, onCurrencyChange }: BudgetSetupProps) {
  const [amount, setAmount] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const budget = parseFloat(amount)
    if (budget > 0) {
      onSetBudget(budget)
      setAmount('')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary-500" />
            Monthly Budget
          </label>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-semibold">
                {currency.symbol}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                step={currency.code === 'IDR' || currency.code === 'JPY' ? '1' : '0.01'}
                min="0"
                className="block w-full pl-12 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-md hover:bg-primary-600 transition-colors whitespace-nowrap"
            >
              Set Budget
            </button>
          </form>
        </div>
        
        <div className="md:w-48">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
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
      </div>
    </div>
  )
}
