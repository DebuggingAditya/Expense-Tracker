import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExpenseService } from '../services/ExpenseService'
import "../styles/AddExpense.css"

const AddExpense = ({ user }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [serverDebug, setServerDebug] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
    setSuccess('')
    setServerDebug(null)
  }

  const formatServerDebug = (dbg) => {
    if (!dbg) return null
    if (dbg.data && typeof dbg.data === 'object') {
      if (dbg.data.errors) {
        const parts = []
        for (const [k, v] of Object.entries(dbg.data.errors)) {
          parts.push(`${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        }
        return parts.join(' • ')
      }
      if (dbg.data.detail) return `${dbg.data.title ? dbg.data.title + ' — ' : ''}${dbg.data.detail}`
      if (dbg.data.message) return dbg.data.message
      if (dbg.data.error) return dbg.data.error
    }
    if (dbg.raw) return dbg.raw
    return `Status ${dbg.status}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    setServerDebug(null)

    if (!formData.description.trim()) {
      setError('Description is required.')
      setLoading(false)
      return
    }
    const amountNum = Number(formData.amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount greater than 0.')
      setLoading(false)
      return
    }
    if (!formData.category) {
      setError('Please select a category.')
      setLoading(false)
      return
    }
    if (!formData.date) {
      setError('Please select a date.')
      setLoading(false)
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setError('You are not authenticated. Please login again.')
      setLoading(false)
      return
    }

    const payload = {
      description: formData.description.trim(),
      amount: amountNum,
      category: formData.category,
      date: formData.date,
      userId: user?.id || user?.userId || 0
    }

    try {
      const res = await ExpenseService.createExpenseRaw(payload, token)
      setServerDebug(res)

      if (res.ok || (res.data && (res.data.id || res.data.success || res.data.created))) {
        setSuccess('Expense added successfully.')
        setTimeout(() => navigate('/dashboard'), 700)
        return
      }

      const friendly = formatServerDebug(res)
      setError(friendly || `Server returned ${res.status}`)
      console.error('AddExpense server response (debug):', res)
    } catch (err) {
      console.error('AddExpense unexpected error:', err)
      const msg = (err && err.message) || 'An unexpected error occurred.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-expense-page">
      <div className="add-expense-wrapper container">
        <div className="card add-expense-card">
          <div className="card-left">
            <div className="brand">
              <div className="brand-icon">💰</div>
              <h2>Add Expense</h2>
              <p className="muted">Track your spending and manage your budget</p>
            </div>
            <div className="illustration" aria-hidden />
          </div>

          <div className="card-body">
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {success && <div className="alert alert-success" role="status">{success}</div>}

            <form onSubmit={handleSubmit} className="expense-form" noValidate>
              <div className="form-row">
                <label htmlFor="description">Description</label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  className="form-control"
                  placeholder="e.g., Grocery at SuperMart"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-row split">
                <div>
                  <label htmlFor="amount">Amount ($)</label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    className="form-control"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    className="form-control"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Food">Food</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn primary-btn"
                  disabled={loading}
                >
                  {loading ? <>
                    <span className="spinner" aria-hidden></span> Adding...
                  </> : 'Add Expense'}
                </button>

                <button
                  type="button"
                  className="btn outline-btn"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="helper-text">
              Tip: Add expenses regularly to keep your budget accurate
            </div>

            {serverDebug && (
              <div className="debug-panel">
                <details open>
                  <summary>Server debug (click to expand)</summary>
                  <div className="debug-content">
                    <div className="debug-friendly">
                      <strong>Friendly:</strong> {formatServerDebug(serverDebug)}
                    </div>
                    <div className="debug-raw">
                      <strong>Parsed object:</strong>
                      <pre>
                        {JSON.stringify(serverDebug, null, 2)}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddExpense