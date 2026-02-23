'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { IncomeSource, Currency } from '@/types'

interface IncomeSourceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, amount: number) => void
  currency: Currency
  existingSource?: IncomeSource | null
}

export default function IncomeSourceModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currency,
  existingSource = null 
}: IncomeSourceModalProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (existingSource) {
      setName(existingSource.name)
      setAmount(formatNumberWithCommas(existingSource.amount.toString()))
    } else {
      setName('')
      setAmount('')
    }
  }, [existingSource, isOpen])

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
    
    if (name.trim() && amount) {
      onSave(name.trim(), parseFloat(amount.replace(/,/g, '')))
      
      // Reset form
      setName('')
      setAmount('')
      onClose()
    }
  }

  const handleClose = () => {
    setName('')
    setAmount('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {existingSource ? 'Edit Income Source' : 'Add Income Source'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Income Source Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Husband Salary, Wife Freelance"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-semibold">
                {currency.symbol}
              </span>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                inputMode="decimal"
                required
                className="w-full pl-12 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white font-semibold rounded-md hover:bg-primary-600 transition-colors"
            >
              {existingSource ? 'Save Changes' : 'Add Income'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
