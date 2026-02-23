'use client'

import { useState } from 'react'
import { Wallet, TrendingDown, TrendingUp, ChevronDown, Plus, DollarSign, Edit2, Trash2 } from 'lucide-react'
import { Currency, CURRENCIES, Expense, formatCurrency, BudgetData, IncomeSource } from '@/types'
import IncomeSourceModal from './IncomeSourceModal'

interface BudgetControlProps {
  budgetName: string
  budgetAmount: number
  expenses: Expense[]
  currency: Currency
  onSetBudget: (name: string, amount: number) => void
  onCurrencyChange: (currency: Currency) => void
  budgets?: BudgetData[]
  activeBudgetId?: string | null
  onSwitchBudget?: (budgetId: string) => void
  onCreateBudget?: (name: string, amount: number, currency: string) => void
  onDeleteBudget?: (budgetId: string) => void
  onAddIncomeSource?: (budgetId: string, name: string, amount: number) => void
  onEditIncomeSource?: (budgetId: string, sourceId: string, name: string, amount: number) => void
  onDeleteIncomeSource?: (budgetId: string, sourceId: string) => void
}

export default function BudgetControl({ 
  budgetName,
  budgetAmount, 
  expenses, 
  currency, 
  onSetBudget, 
  onCurrencyChange,
  budgets = [],
  activeBudgetId = null,
  onSwitchBudget,
  onCreateBudget,
  onDeleteBudget,
  onAddIncomeSource,
  onEditIncomeSource,
  onDeleteIncomeSource
}: BudgetControlProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false)
  const [editingIncomeSource, setEditingIncomeSource] = useState<IncomeSource | null>(null)
  const [showIncomeSources, setShowIncomeSources] = useState(false)

  const activeBudget = budgets.find(b => b.id === activeBudgetId)
  const incomeSources = activeBudget?.incomeSources || []
  const hasIncomeSources = incomeSources.length > 0

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
      if (isCreatingNew && onCreateBudget) {
        onCreateBudget(name.trim(), budget, currency.code)
        setIsCreatingNew(false)
      } else {
        onSetBudget(name.trim(), budget)
      }
      setName('')
      setAmount('')
    }
  }

  const handleIncomeSourceSave = (incomeSourceName: string, incomeAmount: number) => {
    if (!activeBudgetId) return
    
    if (editingIncomeSource) {
      onEditIncomeSource?.(activeBudgetId, editingIncomeSource.id, incomeSourceName, incomeAmount)
    } else {
      onAddIncomeSource?.(activeBudgetId, incomeSourceName, incomeAmount)
    }
    
    setIsIncomeModalOpen(false)
    setEditingIncomeSource(null)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Budget Switcher and Name Display */}
      {budgets.length > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Wallet className="h-6 w-6 text-primary-500 flex-shrink-0" />
              {budgets.length > 1 && onSwitchBudget ? (
                <div className="relative flex-1 max-w-xs">
                  <select
                    value={activeBudgetId || ''}
                    onChange={(e) => onSwitchBudget(e.target.value)}
                    className="w-full text-2xl font-bold text-gray-900 bg-transparent border-2 border-gray-200 rounded-lg px-3 py-2 pr-10 appearance-none cursor-pointer hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 outline-none transition"
                  >
                    {budgets.map((budget) => (
                      <option key={budget.id} value={budget.id}>
                        {budget.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">{budgetName}</h2>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeBudgetId && onAddIncomeSource && (
                <button
                  onClick={() => setIsIncomeModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  <DollarSign className="h-4 w-4" />
                  Manage Income
                </button>
              )}
              {onCreateBudget && (
                <button
                  onClick={() => setIsCreatingNew(!isCreatingNew)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  New Budget
                </button>
              )}
            </div>
          </div>
          
          {/* Income Sources Summary */}
          {hasIncomeSources && (
            <div className="mt-3">
              <button
                onClick={() => setShowIncomeSources(!showIncomeSources)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                <DollarSign className="h-4 w-4" />
                <span>
                  Total Income: {formatCurrency(budgetAmount, currency)}
                  <span className="ml-1 text-gray-500">({incomeSources.length} source{incomeSources.length !== 1 ? 's' : ''})</span>
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showIncomeSources ? 'rotate-180' : ''}`} />
              </button>
              
              {showIncomeSources && (
                <div className="mt-3 space-y-2 pl-6">
                  {incomeSources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-gray-700">{source.name}</span>
                        <span className="text-sm text-gray-900 font-semibold">{formatCurrency(source.amount, currency)}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingIncomeSource(source)
                            setIsIncomeModalOpen(true)
                          }}
                          className="p-1 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete income source "${source.name}"?`)) {
                              onDeleteIncomeSource?.(activeBudgetId!, source.id)
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Budget Setup Form */}
      {(budgets.length === 0 || isCreatingNew) && (
        <div className="mb-6">
          {isCreatingNew && (
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Create New Budget</h3>
              <p className="text-sm text-gray-600">Set up a new budget to track separately</p>
            </div>
          )}
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
              {isCreatingNew ? 'Create Budget' : 'Set Budget'}
            </button>
          </div>
        </form>
        {isCreatingNew && (
          <div className="mt-3">
            <button
              onClick={() => {
                setIsCreatingNew(false)
                setName('')
                setAmount('')
              }}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      )}

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

      {/* Income Source Modal */}
      <IncomeSourceModal
        isOpen={isIncomeModalOpen}
        onClose={() => {
          setIsIncomeModalOpen(false)
          setEditingIncomeSource(null)
        }}
        onSave={handleIncomeSourceSave}
        currency={currency}
        existingSource={editingIncomeSource}
      />
    </div>
  )
}
