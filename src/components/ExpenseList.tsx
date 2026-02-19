'use client'

import { useState } from 'react'
import { Expense, CATEGORIES, Currency, formatCurrency } from '@/types'
import { Edit2, Trash2, Receipt, PlusCircle, Download, RotateCcw } from 'lucide-react'
import EditExpenseModal from './EditExpenseModal'

interface ExpenseListProps {
  expenses: Expense[]
  onEdit: (id: string, expense: Omit<Expense, 'id'>) => void
  onDelete: (id: string) => void
  currency: Currency
  onAddExpense?: () => void
  onExport?: () => void
  onReset?: () => void
}

export default function ExpenseList({ expenses, onEdit, onDelete, currency, onAddExpense, onExport, onReset }: ExpenseListProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const getCategoryInfo = (categoryValue: string) => {
    return CATEGORIES.find(cat => cat.value === categoryValue) || CATEGORIES[CATEGORIES.length - 1]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      onDelete(id)
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary-500" />
            Your Expenses
          </h2>
          <div className="flex items-center gap-2">
            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            )}
            {onReset && (
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            )}
            {onAddExpense && (
              <button
                onClick={onAddExpense}
                className="bg-primary-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                <PlusCircle className="h-4 w-4" />
                Add Expense
              </button>
            )}
          </div>
        </div>
        
        {sortedExpenses.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            No expenses added yet. Start by adding your first expense!
          </p>
        ) : (
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-[auto_2fr_1.5fr_1fr_1fr_auto] gap-4 px-4 py-3 bg-gray-50 border-y border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div></div>
              <div>Description</div>
              <div>Category</div>
              <div>Date</div>
              <div className="text-right">Amount</div>
              <div className="w-20">Actions</div>
            </div>
            
            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {sortedExpenses.map((expense) => {
                const categoryInfo = getCategoryInfo(expense.category)
                return (
                  <div
                    key={expense.id}
                    className="grid grid-cols-[auto_2fr_1.5fr_1fr_1fr_auto] gap-4 px-4 py-3 hover:bg-gray-50 transition-colors group items-center"
                  >
                    {/* Color indicator */}
                    <div 
                      className="w-1 h-8 rounded-full"
                      style={{ backgroundColor: categoryInfo.color }}
                    />
                    
                    {/* Description */}
                    <div className="font-medium text-gray-900 text-sm truncate">
                      {expense.label}
                    </div>
                    
                    {/* Category */}
                    <div>
                      <span 
                        className="inline-flex text-xs font-medium px-2.5 py-1 rounded-md"
                        style={{ 
                          backgroundColor: categoryInfo.color + '20',
                          color: categoryInfo.color
                        }}
                      >
                        {categoryInfo.label}
                      </span>
                    </div>
                    
                    {/* Date */}
                    <div className="text-sm text-gray-600">
                      {formatDate(expense.date)}
                    </div>
                    
                    {/* Amount */}
                    <div className="text-right font-semibold text-gray-900">
                      {formatCurrency(expense.amount, currency)}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingExpense(expense)}
                        className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onSave={(updated) => {
            onEdit(editingExpense.id, updated)
            setEditingExpense(null)
          }}
          onClose={() => setEditingExpense(null)}
          currency={currency}
        />
      )}
    </>
  )
}
