'use client'

import { useState, useEffect } from 'react'
import BudgetControl from '@/components/BudgetControl'
import AddExpenseModal from '@/components/AddExpenseModal'
import ExpenseList from '@/components/ExpenseList'
import AnalyticsPanel from '@/components/AnalyticsPanel'
import { Expense, Currency, CURRENCIES, CATEGORIES, formatCurrency } from '@/types'
import jsPDF from 'jspdf'

export default function Home() {
  const [budgetName, setBudgetName] = useState<string>('')
  const [budget, setBudget] = useState<number>(0)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]) // Default to IDR
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false)

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('budgetCalculatorData')
    if (savedData) {
      const parsed = JSON.parse(savedData)
      setBudgetName(parsed.budgetName || '')
      setBudget(parsed.budget || 0)
      setExpenses(parsed.expenses || [])
      if (parsed.currency) {
        const savedCurrency = CURRENCIES.find(c => c.code === parsed.currency)
        if (savedCurrency) setCurrency(savedCurrency)
      }
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('budgetCalculatorData', JSON.stringify({ 
      budgetName,
      budget, 
      expenses,
      currency: currency.code 
    }))
  }, [budgetName, budget, expenses, currency])

  const handleSetBudget = (name: string, amount: number) => {
    setBudgetName(name)
    setBudget(amount)
  }

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
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
      setBudgetName('')
      setBudget(0)
      setExpenses([])
      setCurrency(CURRENCIES[0])
    }
  }

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency)
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
    
    // Expenses Table
    if (expenses.length > 0) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Expenses', 20, 95)
      
      // Table Header
      doc.setFontSize(10)
      doc.setFillColor(240, 240, 240)
      doc.rect(20, 100, 170, 8, 'F')
      doc.setFont('helvetica', 'bold')
      doc.text('Date', 25, 105)
      doc.text('Description', 55, 105)
      doc.text('Category', 110, 105)
      doc.text('Amount', 160, 105, { align: 'right' })
      
      // Table Rows
      doc.setFont('helvetica', 'normal')
      let yPosition = 113
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
      doc.text('No expenses recorded yet.', 105, 110, { align: 'center' })
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

  const filteredExpenses = filterCategory === 'all' 
    ? expenses 
    : expenses.filter(exp => exp.category === filterCategory)

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
        />

        {/* Expenses List */}
        <ExpenseList
          expenses={filteredExpenses}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
          currency={currency}
          onAddExpense={() => setIsAddExpenseModalOpen(true)}
          onExport={handleExport}
          onReset={handleReset}
        />

        {/* Analytics Panel (Statistics + Category Breakdown) */}
        <AnalyticsPanel
          expenses={expenses}
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

        {/* Footer */}
        <footer className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8 text-center">
          <p className="text-sm text-gray-600">© 2026 Budget Calculator - Manage your finances wisely 💡</p>
        </footer>
      </div>
    </main>
  )
}
