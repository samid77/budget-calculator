'use client'

import { DollarSign, Edit2, Trash2, Plus } from 'lucide-react'
import { IncomeSource, Currency, formatCurrency } from '@/types'

interface IncomeBreakdownProps {
  incomeSources: IncomeSource[]
  currency: Currency
  onAddIncome: () => void
  onEditIncome: (source: IncomeSource) => void
  onDeleteIncome: (sourceId: string) => void
}

export default function IncomeBreakdown({ 
  incomeSources, 
  currency, 
  onAddIncome,
  onEditIncome,
  onDeleteIncome
}: IncomeBreakdownProps) {
  const totalIncome = incomeSources.reduce((sum, source) => sum + source.amount, 0)

  const sortedSources = [...incomeSources].sort((a, b) => b.amount - a.amount)
  
  const sourcesWithPercentage = sortedSources.map(source => ({
    ...source,
    percentage: totalIncome > 0 ? (source.amount / totalIncome) * 100 : 0
  }))

  if (incomeSources.length === 0) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Income Breakdown
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Total Income: <span className="font-semibold text-gray-900">{formatCurrency(totalIncome, currency)}</span>
          </p>
        </div>
        <button
          onClick={onAddIncome}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Income
        </button>
      </div>

      <div className="space-y-4">
        {sourcesWithPercentage.map((source) => (
          <div key={source.id} className="flex items-center gap-3">
            <div className="min-w-[160px] font-semibold text-sm text-gray-700">
              {source.name}
            </div>
            <div className="flex-1 relative h-8 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <div
                className="absolute inset-0 transition-all duration-500 rounded-full flex items-center justify-center bg-gradient-to-r from-green-400 to-green-500"
                style={{
                  width: `${source.percentage}%`,
                }}
              >
                {source.percentage > 15 && (
                  <span className="text-xs font-bold text-white px-2">
                    {source.percentage.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="min-w-[140px] text-right flex items-center justify-end gap-2">
              <span className="font-bold text-gray-900">{formatCurrency(source.amount, currency)}</span>
              {source.percentage <= 15 && (
                <span className="text-xs text-gray-500">({source.percentage.toFixed(1)}%)</span>
              )}
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => onEditIncome(source)}
                  className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Edit"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete income source "${source.name}"?`)) {
                      onDeleteIncome(source.id)
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
