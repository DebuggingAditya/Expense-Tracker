import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ExpenseService } from '../services/ExpenseService'
import '../styles/Dashboard.css'

const Dashboard = ({ user }) => {
  const [expenses, setExpenses] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    count: 0,
    average: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        setStats({ total: 0, count: 0, average: 0 })
        return
      }

      const data = await ExpenseService.getExpenses(token)

      if (!data || !Array.isArray(data)) {
        if (data && data.error) {
          setError(data.error)
        } else if (data && data.message) {
          setError(data.message)
        } else {
          setError('Failed to load expenses.')
        }
        setExpenses([])
        setStats({ total: 0, count: 0, average: 0 })
        return
      }

      setExpenses(data)

      const total = data.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
      const count = data.length
      const average = count > 0 ? total / count : 0

      setStats({
        total,
        count,
        average: Math.round(average * 100) / 100
      })
    } catch (err) {
      console.error('Error fetching expenses:', err)
      setError(err.message || 'Error fetching expenses')
      setExpenses([])
      setStats({ total: 0, count: 0, average: 0 })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loader-wrap">
          <div className="spinner" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-top-grid">
        <div className="welcome-card">
          <h2>Welcome back, {user?.name || 'User'}!</h2>
          <p>Here's your financial overview</p>
          <div className="welcome-actions">
            <Link to="/add-expense" className="btn btn-primary">Add Expense</Link>
            <Link to="/view-expenses" className="btn btn-outline">View All</Link>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card card-primary">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <div className="card-meta">Total Spent</div>
              <div className="card-value">${stats.total.toFixed(2)}</div>
              <div className="card-sub">{stats.count} expenses</div>
            </div>
          </div>

          <div className="summary-card card-secondary">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <div className="card-meta">Average</div>
              <div className="card-value">${stats.average.toFixed(2)}</div>
              <div className="card-sub">per expense</div>
            </div>
          </div>

          <div className="summary-card card-tertiary">
            <div className="card-icon">📝</div>
            <div className="card-content">
              <div className="card-meta">Recent</div>
              <div className="card-value">{stats.count > 0 ? expenses[0]?.description || `${stats.count} items` : '0'}</div>
              <div className="card-sub">{stats.count} total</div>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-expenses-header">
        <h3>Recent Expenses</h3>
        <Link to="/view-expenses" className="btn btn-outline-primary">View All Expenses</Link>
      </div>

      {error && (
        <div className="alert alert-warning">
          {error}
        </div>
      )}

      {expenses.length > 0 ? (
        <div className="expense-list">
          {expenses.slice(0, 6).map(expense => (
            <div key={expense.id} className="expense-item">
              <div className="expense-left">
                <div className="expense-avatar">{expense.category ? expense.category.charAt(0).toUpperCase() : 'E'}</div>
                <div className="expense-details">
                  <div className="expense-description">{expense.description}</div>
                  <div className="expense-meta">
                    <span className="expense-category">{expense.category}</span>
                    <span className="expense-date">{new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="expense-amount">
                <div className="amount">${Number(expense.amount).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-expenses">
          <div className="no-expenses-content">
            <div className="no-expenses-icon">📊</div>
            <h3>No expenses yet</h3>
            <p>Start tracking your expenses to see them here</p>
            <Link to="/add-expense" className="btn btn-primary">Add First Expense</Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard