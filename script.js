// Budget Calculator App
class BudgetCalculator {
    constructor() {
        this.budget = 0;
        this.expenses = [];
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.setTodayDate();
        this.updateUI();
    }

    setupEventListeners() {
        // Set Budget
        document.getElementById('set-budget-btn').addEventListener('click', () => {
            this.setBudget();
        });

        // Add Expense
        document.getElementById('expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        // Filter
        document.getElementById('filter-category').addEventListener('change', () => {
            this.filterExpenses();
        });

        // Export
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });

        // Reset
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetAll();
        });

        // Edit Modal
        document.getElementById('cancel-edit-btn').addEventListener('click', () => {
            this.closeEditModal();
        });

        document.getElementById('edit-expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEdit();
        });

        // Close modal on outside click
        document.getElementById('edit-modal').addEventListener('click', (e) => {
            if (e.target.id === 'edit-modal') {
                this.closeEditModal();
            }
        });
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expense-date').value = today;
    }

    setBudget() {
        const budgetInput = document.getElementById('budget-amount');
        const amount = parseFloat(budgetInput.value);

        if (isNaN(amount) || amount <= 0) {
            this.showNotification('Please enter a valid budget amount', 'error');
            return;
        }

        this.budget = amount;
        this.saveToLocalStorage();
        this.updateUI();
        this.showNotification('Budget set successfully!', 'success');
        budgetInput.value = '';
    }

    addExpense() {
        const label = document.getElementById('expense-label').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        const date = document.getElementById('expense-date').value;

        if (!label || isNaN(amount) || amount <= 0 || !category || !date) {
            this.showNotification('Please fill in all fields correctly', 'error');
            return;
        }

        const expense = {
            id: Date.now(),
            label,
            amount,
            category,
            date
        };

        this.expenses.push(expense);
        this.saveToLocalStorage();
        this.updateUI();
        this.showNotification('Expense added successfully!', 'success');
        
        // Reset form
        document.getElementById('expense-form').reset();
        this.setTodayDate();
    }

    deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.expenses = this.expenses.filter(exp => exp.id !== id);
            this.saveToLocalStorage();
            this.updateUI();
            this.showNotification('Expense deleted', 'success');
        }
    }

    editExpense(id) {
        const expense = this.expenses.find(exp => exp.id === id);
        if (!expense) return;

        this.currentEditId = id;
        document.getElementById('edit-expense-label').value = expense.label;
        document.getElementById('edit-expense-amount').value = expense.amount;
        document.getElementById('edit-expense-category').value = expense.category;
        document.getElementById('edit-expense-date').value = expense.date;

        document.getElementById('edit-modal').classList.add('active');
    }

    saveEdit() {
        const label = document.getElementById('edit-expense-label').value;
        const amount = parseFloat(document.getElementById('edit-expense-amount').value);
        const category = document.getElementById('edit-expense-category').value;
        const date = document.getElementById('edit-expense-date').value;

        const expense = this.expenses.find(exp => exp.id === this.currentEditId);
        if (expense) {
            expense.label = label;
            expense.amount = amount;
            expense.category = category;
            expense.date = date;

            this.saveToLocalStorage();
            this.updateUI();
            this.closeEditModal();
            this.showNotification('Expense updated successfully!', 'success');
        }
    }

    closeEditModal() {
        document.getElementById('edit-modal').classList.remove('active');
        this.currentEditId = null;
    }

    filterExpenses() {
        const filterValue = document.getElementById('filter-category').value;
        this.updateExpensesList(filterValue);
    }

    calculateTotalSpent(expenses = this.expenses) {
        return expenses.reduce((total, exp) => total + exp.amount, 0);
    }

    updateUI() {
        this.updateBudgetOverview();
        this.updateExpensesList();
        this.updateStatistics();
        this.updateCategoryBreakdown();
    }

    updateBudgetOverview() {
        const totalSpent = this.calculateTotalSpent();
        const remaining = this.budget - totalSpent;
        const percentageUsed = this.budget > 0 ? (totalSpent / this.budget) * 100 : 0;

        document.getElementById('total-budget').textContent = this.formatCurrency(this.budget);
        document.getElementById('total-spent').textContent = this.formatCurrency(totalSpent);
        document.getElementById('remaining-budget').textContent = this.formatCurrency(remaining);

        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = Math.min(percentageUsed, 100) + '%';

        // Update progress text with color
        const progressText = document.getElementById('progress-text');
        progressText.textContent = `${percentageUsed.toFixed(1)}% of budget used`;

        // Color code remaining budget
        const remainingElement = document.querySelector('.overview-item.remaining .amount');
        if (remaining < 0) {
            remainingElement.style.color = '#FF6200';
            document.querySelector('.overview-item.remaining').style.borderTopColor = '#FF6200';
        } else {
            remainingElement.style.color = '#03AC0E';
            document.querySelector('.overview-item.remaining').style.borderTopColor = '#03AC0E';
        }
    }

    updateExpensesList(filter = 'all') {
        const container = document.getElementById('expenses-container');
        let expenses = [...this.expenses];

        // Apply filter
        if (filter !== 'all') {
            expenses = expenses.filter(exp => exp.category === filter);
        }

        // Sort by date (newest first)
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (expenses.length === 0) {
            container.innerHTML = '<p class="no-expenses">No expenses to display.</p>';
            return;
        }

        container.innerHTML = expenses.map(expense => `
            <div class="expense-item category-${expense.category}">
                <div class="expense-info">
                    <div class="expense-name">${this.escapeHtml(expense.label)}</div>
                    <div class="expense-meta">
                        <span class="expense-category">${this.getCategoryIcon(expense.category)} ${this.getCategoryName(expense.category)}</span>
                        <span>📅 ${this.formatDate(expense.date)}</span>
                    </div>
                </div>
                <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
                <div class="expense-actions">
                    <button class="btn-edit" onclick="budgetApp.editExpense(${expense.id})">✏️ Edit</button>
                    <button class="btn-delete" onclick="budgetApp.deleteExpense(${expense.id})">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }

    updateStatistics() {
        const totalExpenses = this.expenses.length;
        const totalSpent = this.calculateTotalSpent();
        const avgExpense = totalExpenses > 0 ? totalSpent / totalExpenses : 0;
        const largestExpense = totalExpenses > 0 
            ? Math.max(...this.expenses.map(exp => exp.amount)) 
            : 0;

        // Calculate daily average for current month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthExpenses = this.expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
        });
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const dailyAvg = this.calculateTotalSpent(monthExpenses) / daysInMonth;

        document.getElementById('total-expenses-count').textContent = totalExpenses;
        document.getElementById('avg-expense').textContent = this.formatCurrency(avgExpense);
        document.getElementById('largest-expense').textContent = this.formatCurrency(largestExpense);
        document.getElementById('daily-avg').textContent = this.formatCurrency(dailyAvg);
    }

    updateCategoryBreakdown() {
        const categoryTotals = {};
        const categoryColors = {
            food: '#FF6200',
            housing: '#1976D2',
            transportation: '#00ACC1',
            education: '#5E35B1',
            healthcare: '#E91E63',
            entertainment: '#F57C00',
            utilities: '#00897B',
            shopping: '#8E24AA',
            savings: '#03AC0E',
            other: '#757575'
        };

        // Calculate totals per category
        this.expenses.forEach(exp => {
            categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
        });

        const totalSpent = this.calculateTotalSpent();
        const container = document.getElementById('category-chart');

        if (Object.keys(categoryTotals).length === 0) {
            container.innerHTML = '<p class="no-expenses">No category data available yet.</p>';
            return;
        }

        // Sort categories by amount (highest first)
        const sortedCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]);

        container.innerHTML = sortedCategories.map(([category, amount]) => {
            const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
            return `
                <div class="category-item">
                    <div class="category-label">
                        ${this.getCategoryIcon(category)} ${this.getCategoryName(category)}
                    </div>
                    <div class="category-bar-container">
                        <div class="category-bar" style="width: ${percentage}%; background: ${categoryColors[category]}">
                            ${percentage.toFixed(1)}%
                        </div>
                    </div>
                    <div class="category-amount">$${amount.toFixed(2)}</div>
                </div>
            `;
        }).join('');
    }

    getCategoryName(category) {
        const names = {
            food: 'Food & Dining',
            housing: 'Housing & Rent',
            transportation: 'Transportation',
            education: 'Education',
            healthcare: 'Healthcare',
            entertainment: 'Entertainment',
            utilities: 'Utilities',
            shopping: 'Shopping',
            savings: 'Savings',
            other: 'Other'
        };
        return names[category] || category;
    }

    getCategoryIcon(category) {
        const icons = {
            food: '🍔',
            housing: '🏠',
            transportation: '🚗',
            education: '📚',
            healthcare: '⚕️',
            entertainment: '🎬',
            utilities: '💡',
            shopping: '🛍️',
            savings: '💵',
            other: '📌'
        };
        return icons[category] || '📌';
    }

    exportData() {
        const data = {
            budget: this.budget,
            expenses: this.expenses,
            totalSpent: this.calculateTotalSpent(),
            remaining: this.budget - this.calculateTotalSpent(),
            exportDate: new Date().toISOString()
        };

        // Create CSV format
        let csv = 'Budget Calculator Export\n\n';
        csv += `Total Budget,$${this.budget.toFixed(2)}\n`;
        csv += `Total Spent,$${this.calculateTotalSpent().toFixed(2)}\n`;
        csv += `Remaining,$${(this.budget - this.calculateTotalSpent()).toFixed(2)}\n\n`;
        csv += 'Date,Category,Description,Amount\n';
        
        this.expenses
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .forEach(exp => {
                csv += `${exp.date},${this.getCategoryName(exp.category)},"${exp.label}",$${exp.amount.toFixed(2)}\n`;
            });

        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully!', 'success');
    }

    resetAll() {
        if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            this.budget = 0;
            this.expenses = [];
            this.saveToLocalStorage();
            this.updateUI();
            document.getElementById('budget-amount').value = '';
            this.showNotification('All data has been reset', 'success');
        }
    }

    saveToLocalStorage() {
        const data = {
            budget: this.budget,
            expenses: this.expenses
        };
        localStorage.setItem('budgetCalculatorData', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('budgetCalculatorData');
        if (data) {
            const parsed = JSON.parse(data);
            this.budget = parsed.budget || 0;
            this.expenses = parsed.expenses || [];
        }
    }

    formatCurrency(amount) {
        return '$' + amount.toFixed(2);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background4px 20px;
            background: ${type === 'success' ? '#03AC0E' : type === 'error' ? '#FF6200' : '#31353B'};
            color: white;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            z-index: 2000;
            animation: slideInRight 0.3s ease-out;
            font-weight: 600;
            font-size: 0.9rem

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Add notification animations to the page
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app
const budgetApp = new BudgetCalculator();
