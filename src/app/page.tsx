'use client'

import { useState } from 'react'
import BudgetControl from '@/components/BudgetControl'
import AddExpenseModal from '@/components/AddExpenseModal'
import ExpenseList from '@/components/ExpenseList'
import AnalyticsPanel from '@/components/AnalyticsPanel'
import IncomeBreakdown from '@/components/IncomeBreakdown'
import IncomeSourceModal from '@/components/IncomeSourceModal'
import { Expense, Currency, CURRENCIES, CATEGORIES, formatCurrency, DateRange, CustomDateRange, BudgetData, IncomeSource } from '@/types'
import jsPDF from 'jspdf'

export default function Home() {
  // Multiple budgets state
  const [budgets, setBudgets] = useState<BudgetData[]>([])
  const [activeBudgetId, setActiveBudgetId] = useState<string | null>(null)
  
  // Legacy state for backward compatibility during migration
  const [budgetName, setBudgetName] = useState<string>('')
  const [budget, setBudget] = useState<number>(0)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [customRange, setCustomRange] = useState<CustomDateRange | null>(null)
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]) // Default to IDR
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false)
  const [isIncomeBreakdownModalOpen, setIsIncomeBreakdownModalOpen] = useState(false)
  const [editingIncomeSource, setEditingIncomeSource] = useState<IncomeSource | null>(null)

  // Budget management functions
  const handleCreateBudget = (name: string, amount: number, currencyCode: string) => {
    const newBudget: BudgetData = {
      id: 'budget-' + Date.now(),
      name,
      amount,
      currency: currencyCode,
      createdAt: new Date().toISOString(),
    }
    setBudgets([...budgets, newBudget])
    setActiveBudgetId(newBudget.id)
    
    // Update legacy state
    setBudgetName(name)
    setBudget(amount)
    const newCurrency = CURRENCIES.find(c => c.code === currencyCode)
    if (newCurrency) setCurrency(newCurrency)
  }

  const handleSwitchBudget = (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId)
    if (budget) {
      setActiveBudgetId(budgetId)
      
      // Update legacy state
      setBudgetName(budget.name)
      setBudget(budget.amount)
      const budgetCurrency = CURRENCIES.find(c => c.code === budget.currency)
      if (budgetCurrency) setCurrency(budgetCurrency)
      
      // Reset date filter when switching budgets
      setDateRange('all')
      setCustomRange(null)
    }
  }

  const handleUpdateBudget = (budgetId: string, name: string, amount: number) => {
    setBudgets(budgets.map(b => 
      b.id === budgetId ? { ...b, name, amount } : b
    ))
    
    // Update legacy state if updating active budget
    if (budgetId === activeBudgetId) {
      setBudgetName(name)
      setBudget(amount)
    }
  }

  const handleDeleteBudget = (budgetId: string) => {
    if (budgets.length === 1) {
      alert('Cannot delete the last budget. Create a new one first.')
      return
    }
    
    if (confirm('Are you sure you want to delete this budget and all its expenses?')) {
      // Remove budget and its expenses
      setBudgets(budgets.filter(b => b.id !== budgetId))
      setExpenses(expenses.filter(exp => exp.budgetId !== budgetId))
      
      // Switch to another budget if deleting active one
      if (budgetId === activeBudgetId) {
        const remainingBudgets = budgets.filter(b => b.id !== budgetId)
        if (remainingBudgets.length > 0) {
          handleSwitchBudget(remainingBudgets[0].id)
        }
      }
    }
  }

  const handleSetBudget = (name: string, amount: number) => {
    if (activeBudgetId) {
      handleUpdateBudget(activeBudgetId, name, amount)
    } else {
      // No budgets exist yet, create first one
      handleCreateBudget(name, amount, currency.code)
    }
  }

  // Income source management functions
  const handleAddIncomeSource = (budgetId: string, name: string, amount: number) => {
    const newIncomeSource: IncomeSource = {
      id: 'income-' + Date.now(),
      budgetId,
      name,
      amount,
    }
    
    setBudgets(budgets.map(b => {
      if (b.id === budgetId) {
        const updatedSources = [...(b.incomeSources || []), newIncomeSource]
        const totalIncome = updatedSources.reduce((sum, s) => sum + s.amount, 0)
        return { ...b, incomeSources: updatedSources, amount: totalIncome }
      }
      return b
    }))
    
    // Update legacy state if active budget
    if (budgetId === activeBudgetId) {
      const updatedBudget = budgets.find(b => b.id === budgetId)
      if (updatedBudget) {
        const updatedSources = [...(updatedBudget.incomeSources || []), newIncomeSource]
        const totalIncome = updatedSources.reduce((sum, s) => sum + s.amount, 0)
        setBudget(totalIncome)
      }
    }
  }

  const handleEditIncomeSource = (budgetId: string, sourceId: string, name: string, amount: number) => {
    setBudgets(budgets.map(b => {
      if (b.id === budgetId) {
        const updatedSources = (b.incomeSources || []).map(s =>
          s.id === sourceId ? { ...s, name, amount } : s
        )
        const totalIncome = updatedSources.reduce((sum, s) => sum + s.amount, 0)
        return { ...b, incomeSources: updatedSources, amount: totalIncome }
      }
      return b
    }))
    
    // Update legacy state if active budget
    if (budgetId === activeBudgetId) {
      const updatedBudget = budgets.find(b => b.id === budgetId)
      if (updatedBudget) {
        const updatedSources = (updatedBudget.incomeSources || []).map(s =>
          s.id === sourceId ? { ...s, name, amount } : s
        )
        const totalIncome = updatedSources.reduce((sum, s) => sum + s.amount, 0)
        setBudget(totalIncome)
      }
    }
  }

  const handleDeleteIncomeSource = (budgetId: string, sourceId: string) => {
    setBudgets(budgets.map(b => {
      if (b.id === budgetId) {
        const updatedSources = (b.incomeSources || []).filter(s => s.id !== sourceId)
        const totalIncome = updatedSources.reduce((sum, s) => sum + s.amount, 0)
        return { ...b, incomeSources: updatedSources, amount: totalIncome }
      }
      return b
    }))
    
    // Update legacy state if active budget
    if (budgetId === activeBudgetId) {
      const updatedBudget = budgets.find(b => b.id === budgetId)
      if (updatedBudget) {
        const updatedSources = (updatedBudget.incomeSources || []).filter(s => s.id !== sourceId)
        const totalIncome = updatedSources.reduce((sum, s) => sum + s.amount, 0)
        setBudget(totalIncome)
      }
    }
  }

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    if (!activeBudgetId) {
      alert('Please create a budget first before adding expenses.')
      return
    }
    
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      budgetId: activeBudgetId,
    }
    setExpenses([...expenses, newExpense])
    setIsAddExpenseModalOpen(false)
  }

  const handleEditExpense = (id: string, updatedExpense: Omit<Expense, 'id'>) => {
    setExpenses(expenses.map(exp => 
      exp.id === id ? { ...updatedExpense, id } : exp
    ))
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id))
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      setBudgets([])
      setActiveBudgetId(null)
      setBudgetName('')
      setBudget(0)
      setExpenses([])
      setCurrency(CURRENCIES[0])
    }
  }

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency)
  }

  const getFilteredExpenses = () => {
    let filtered = expenses

    // Filter by active budget
    if (activeBudgetId) {
      filtered = filtered.filter(exp => exp.budgetId === activeBudgetId)
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(exp => exp.category === filterCategory)
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      let startDate: Date
      let endDate: Date = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) // End of today

      switch (dateRange) {
        case 'thisWeek':
          // Get start of week (Sunday)
          const dayOfWeek = today.getDay()
          startDate = new Date(today)
          startDate.setDate(today.getDate() - dayOfWeek)
          break
          
        case 'thisMonth':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1)
          break
          
        case 'lastMonth':
          const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
          startDate = lastMonth
          endDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59) // Last day of last month
          break
          
        case 'custom':
          if (customRange?.startDate && customRange?.endDate) {
            startDate = new Date(customRange.startDate)
            endDate = new Date(customRange.endDate)
            endDate.setHours(23, 59, 59, 999) // End of day
          } else {
            return filtered // No custom range set, return unfiltered by date
          }
          break
          
        default:
          return filtered
      }

      filtered = filtered.filter(exp => {
        const expDate = new Date(exp.date)
        return expDate >= startDate && expDate <= endDate
      })
    }

    return filtered
  }

  const handleExport = () => {
    const doc = new jsPDF()
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const remaining = budget - totalSpent
    
    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Budget Report', 105, 20, { align: 'center' })
    
    // Budget Name
    doc.setFontSize(16)
    doc.setFont('helvetica', 'normal')
    doc.text(budgetName || 'Unnamed Budget', 105, 30, { align: 'center' })
    
    // Date
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 105, 37, { align: 'center' })
    
    // Summary Section
    doc.setTextColor(0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary', 20, 50)
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    const summaryY = 58
    const lineHeight = 7
    
    doc.text('Total Budget:', 25, summaryY)
    doc.text(formatCurrency(budget, currency), 80, summaryY)
    
    doc.text('Total Spent:', 25, summaryY + lineHeight)
    doc.text(formatCurrency(totalSpent, currency), 80, summaryY + lineHeight)
    
    doc.text('Remaining:', 25, summaryY + lineHeight * 2)
    doc.setTextColor(remaining >= 0 ? 0 : 255, remaining >= 0 ? 150 : 0, 0)
    doc.text(formatCurrency(Math.abs(remaining), currency), 80, summaryY + lineHeight * 2)
    doc.setTextColor(0)
    
    // Percentage
    const percentage = budget > 0 ? (totalSpent / budget) * 100 : 0
    doc.text('Budget Used:', 25, summaryY + lineHeight * 3)
    doc.text(`${percentage.toFixed(1)}%`, 80, summaryY + lineHeight * 3)
    
    // Income Breakdown Section (if income sources exist)
    const activeBudgetData = budgets.find(b => b.id === activeBudgetId)
    const incomeSources = activeBudgetData?.incomeSources || []
    let incomeYPosition = summaryY + lineHeight * 4 + 5
    
    if (incomeSources.length > 0) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Income Breakdown', 20, incomeYPosition)
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      incomeYPosition += 8
      
      incomeSources.forEach((source) => {
        doc.text(source.name + ':', 25, incomeYPosition)
        doc.text(formatCurrency(source.amount, currency), 80, incomeYPosition)
        incomeYPosition += lineHeight
      })
      
      incomeYPosition += 5
    }
    
    // Expenses Table
    const expensesStartY = incomeSources.length > 0 ? incomeYPosition : 95
    if (expenses.length > 0) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Expenses', 20, expensesStartY)
      
      // Table Header
      doc.setFontSize(10)
      doc.setFillColor(240, 240, 240)
      doc.rect(20, expensesStartY + 5, 170, 8, 'F')
      doc.setFont('helvetica', 'bold')
      doc.text('Date', 25, expensesStartY + 10)
      doc.text('Description', 55, expensesStartY + 10)
      doc.text('Category', 110, expensesStartY + 10)
      doc.text('Amount', 160, expensesStartY + 10, { align: 'right' })
      
      // Table Rows
      doc.setFont('helvetica', 'normal')
      let yPosition = expensesStartY + 18
      const sortedExpenses = [...expenses].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      
      sortedExpenses.forEach((expense, index) => {
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }
        
        // Alternate row background
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250)
          doc.rect(20, yPosition - 5, 170, 7, 'F')
        }
        
        // Format date
        const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
        
        // Get category name
        const categoryInfo = CATEGORIES.find(cat => cat.value === expense.category)
        const categoryLabel = categoryInfo ? categoryInfo.label : expense.category
        
        doc.text(formattedDate, 25, yPosition)
        
        // Truncate description if too long
        const description = expense.label.length > 25 
          ? expense.label.substring(0, 22) + '...' 
          : expense.label
        doc.text(description, 55, yPosition)
        
        // Remove emoji from category for PDF - simple approach
        const cleanCategory = categoryLabel.replace(/[^\x00-\x7F]/g, '').trim()
        doc.text(cleanCategory, 110, yPosition)
        
        doc.text(formatCurrency(expense.amount, currency), 185, yPosition, { align: 'right' })
        
        yPosition += 7
      })
    } else {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(150)
      doc.text('No expenses recorded yet.', 105, expensesStartY + 15, { align: 'center' })
      doc.setTextColor(0)
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        285,
        { align: 'center' }
      )
      doc.text(
        'Budget Calculator - Manage your finances wisely',
        105,
        290,
        { align: 'center' }
      )
    }
    
    // Save the PDF
    const fileName = `budget-${budgetName.replace(/\s+/g, '-').toLowerCase() || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  const filteredExpenses = getFilteredExpenses()

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 Budget Calculator</h1>
          <p className="text-gray-600">Track your expenses and manage your budget wisely</p>
        </header>

        {/* Budget Control with Overview */}
        <BudgetControl 
          budgetName={budgetName}
          budgetAmount={budget}
          expenses={expenses}
          currency={currency}
          onSetBudget={handleSetBudget}
          onCurrencyChange={handleCurrencyChange}
          budgets={budgets}
          activeBudgetId={activeBudgetId}
          onSwitchBudget={handleSwitchBudget}
          onCreateBudget={handleCreateBudget}
          onDeleteBudget={handleDeleteBudget}
          onAddIncomeSource={handleAddIncomeSource}
          onEditIncomeSource={handleEditIncomeSource}
          onDeleteIncomeSource={handleDeleteIncomeSource}
        />

        {/* Income Breakdown Section */}
        {activeBudgetId && budgets.find(b => b.id === activeBudgetId)?.incomeSources && budgets.find(b => b.id === activeBudgetId)!.incomeSources!.length > 0 && (
          <IncomeBreakdown
            incomeSources={budgets.find(b => b.id === activeBudgetId)!.incomeSources!}
            currency={currency}
            onAddIncome={() => setIsIncomeBreakdownModalOpen(true)}
            onEditIncome={(source) => {
              setEditingIncomeSource(source)
              setIsIncomeBreakdownModalOpen(true)
            }}
            onDeleteIncome={(sourceId) => handleDeleteIncomeSource(activeBudgetId, sourceId)}
          />
        )}

        {/* Expenses List */}
        <ExpenseList
          expenses={filteredExpenses}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
          currency={currency}
          onAddExpense={() => setIsAddExpenseModalOpen(true)}
          onExport={handleExport}
          onReset={handleReset}
          dateRange={dateRange}
          customRange={customRange}
          onDateRangeChange={setDateRange}
          onCustomRangeChange={setCustomRange}
        />

        {/* Analytics Panel (Statistics + Category Breakdown) */}
        <AnalyticsPanel
          expenses={filteredExpenses}
          budget={budget}
          currency={currency}
          filterCategory={filterCategory}
          onFilterChange={setFilterCategory}
        />

        {/* Add Expense Modal */}
        <AddExpenseModal
          isOpen={isAddExpenseModalOpen}
          onClose={() => setIsAddExpenseModalOpen(false)}
          onAddExpense={handleAddExpense}
          currency={currency}
        />

        {/* Income Source Modal (for IncomeBreakdown) */}
        <IncomeSourceModal
          isOpen={isIncomeBreakdownModalOpen}
          onClose={() => {
            setIsIncomeBreakdownModalOpen(false)
            setEditingIncomeSource(null)
          }}
          onSave={(name, amount) => {
            if (!activeBudgetId) return
            
            if (editingIncomeSource) {
              handleEditIncomeSource(activeBudgetId, editingIncomeSource.id, name, amount)
            } else {
              handleAddIncomeSource(activeBudgetId, name, amount)
            }
            
            setIsIncomeBreakdownModalOpen(false)
            setEditingIncomeSource(null)
          }}
          currency={currency}
          existingSource={editingIncomeSource}
        />

        {/* Footer */}
        <footer className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8 text-center">
          <p className="text-sm text-gray-600">© 2026 Budget Calculator - Manage your finances wisely 💡</p>
        </footer>
      </div>
    </main>
  )
}
