// src/pages/ViewExpenses.jsx
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ExpenseService } from '../services/ExpenseService'
import "../styles/ViewExpenses.css"

const ViewExpenses = ({ user }) => {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchExpenses()
    // eslint-disable-next-line
  }, [])

  const fetchExpenses = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated. Please login.')
        setExpenses([])
        return
      }

      const data = await ExpenseService.getExpenses(token)

      if (!data) {
        setError('Failed to load expenses.')
        setExpenses([])
        return
      }

      // If API returns object shape, try common arrays
      const list = Array.isArray(data) ? data : (data.result && Array.isArray(data.result) ? data.result : [])
      setExpenses(list)
    } catch (err) {
      console.error('Error fetching expenses:', err)
      setError(err.message || 'An error occurred while fetching expenses.')
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  // derived filteredExpenses using useMemo for perf
  const filteredExpenses = useMemo(() => {
    let filtered = expenses

    if (filter && filter !== 'all') {
      filtered = filtered.filter(expense => expense.category === filter)
    }

    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(expense =>
        (expense.description || '').toLowerCase().includes(term) ||
        (expense.category || '').toLowerCase().includes(term)
      )
    }

    // sort by date desc (recent first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

    return filtered
  }, [expenses, filter, searchTerm])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Not authenticated. Please login.')
        return
      }

      // optimistic update: remove locally first
      const previous = expenses
      setExpenses(prev => prev.filter(exp => String(exp.id) !== String(id)))

      const ok = await ExpenseService.deleteExpense(id, token)

      if (!ok) {
        // rollback
        setExpenses(previous)
        alert('Failed to delete expense on server.')
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
      alert('An error occurred while deleting the expense.')
      // optionally refetch
      fetchExpenses()
    }
  }

  const categories = ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Shopping', 'Healthcare', 'Other']

  if (loading) {
    return (
      <div className="view-expenses-container">
        <div className="loading-container">
          <div className="spinner">
            <div className="spinner-inner"></div>
          </div>
          <p>Loading your expenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="view-expenses-container">
      <div className="page-header">
        <h2>Your Expenses</h2>
        <Link to="/add-expense" className="add-expense-btn">
          <span>Add New Expense</span>
          <div className="hover-effect"></div>
        </Link>
      </div>

      {error && <div className="alert-message">{error}</div>}

      <div className="filters-container">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="categoryFilter">Filter by Category</label>
            <select
              id="categoryFilter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search by description or category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredExpenses.length > 0 ? (
        <div className="expenses-table-container">
          <div className="table-header">
            <div className="table-cell">Date</div>
            <div className="table-cell">Description</div>
            <div className="table-cell">Category</div>
            <div className="table-cell">Amount</div>
            <div className="table-cell">Actions</div>
          </div>
          <div className="table-body">
            {filteredExpenses.map(expense => (
              <div className="table-row" key={expense.id}>
                <div className="table-cell" data-label="Date">
                  {expense.date ? new Date(expense.date).toLocaleDateString() : '-'}
                </div>
                <div className="table-cell" data-label="Description">
                  {expense.description}
                </div>
                <div className="table-cell" data-label="Category">
                  <span className="category-badge">{expense.category}</span>
                </div>
                <div className="table-cell" data-label="Amount">
                  ${Number(expense.amount || 0).toFixed(2)}
                </div>
                <div className="table-cell" data-label="Actions">
                  <div className="action-buttons">
                    <Link to={`/modify-expense/${expense.id}`} className="edit-btn">
                      Edit
                    </Link>
                    <button className="delete-btn" onClick={() => handleDelete(expense.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-expenses-message">
          {expenses.length === 0
            ? "You don't have any expenses yet."
            : "No expenses match your filters."}
          {expenses.length === 0 && (
            <Link to="/add-expense"> Add your first expense</Link>
          )}
        </div>
      )}
    </div>
  )
}

export default ViewExpenses