import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ExpenseService } from '../services/ExpenseService'
import "../styles/ModifyExpense.css"

const ModifyExpense = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchExpense()
    // eslint-disable-next-line
  }, [id])

  const fetchExpense = async () => {
    setFetching(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated. Please login again.')
        setFetching(false)
        return
      }

      const data = await ExpenseService.getExpenses(token)

      if (!data) {
        setError('Failed to load expense data.')
        setFetching(false)
        return
      }

      let expense = null
      if (Array.isArray(data)) {
        expense = data.find(item => String(item.id) === String(id))
      } else if (data && typeof data === 'object') {
        if (data.id && String(data.id) === String(id)) expense = data
        else if (data.result && String(data.result.id) === String(id)) expense = data.result
      }

      if (!expense) {
        setError('Expense not found.')
        setFetching(false)
        return
      }

      const dateOnly = expense.date ? expense.date.split('T')[0] : ''

      setFormData({
        description: expense.description || '',
        amount: expense.amount != null ? String(expense.amount) : '',
        category: expense.category || '',
        date: dateOnly
      })
    } catch (err) {
      console.error('fetchExpense error:', err)
      setError('An error occurred while fetching the expense. Please try again.')
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.description.trim()) {
      setError('Description is required.')
      setLoading(false)
      return
    }
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) < 0) {
      setError('Please enter a valid amount.')
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

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated. Please login again.')
        setLoading(false)
        return
      }

      const payload = {
        description: formData.description.trim(),
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date
      }

      const updated = await ExpenseService.updateExpense(id, payload, token)

      if (!updated) {
        setError('No response from server.')
        setLoading(false)
        return
      }

      if (updated.id || updated.success || (updated && !updated.error)) {
        navigate('/view-expenses')
      } else if (updated.error) {
        setError(updated.error || 'Failed to update expense')
      } else if (updated.message) {
        setError(updated.message)
      } else {
        navigate('/view-expenses')
      }
    } catch (err) {
      console.error('Update expense error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="modify-expense-container">
        <div className="loader-wrap">
          <div className="spinner" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="modify-expense-container error-container">
        <div className="alert alert-danger">{error}</div>
        <div className="error-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/view-expenses')}>
            Back to Expenses
          </button>
          <button className="btn btn-primary" onClick={fetchExpense}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="modify-expense-container">
      <div className="modify-expense-card">
        <div className="modify-expense-header">
          <div className="header-icon">✏️</div>
          <h2>Edit Expense</h2>
          <p>Update your expense details</p>
        </div>
        
        <div className="modify-expense-body">
          <form className="expense-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter expense description"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="amount">Amount ($)</label>
              <input
                type="number"
                className="form-control"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                className="form-select"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
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
            
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                className="form-control"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-actions">
              <button
                type="submit"
                className="update-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" aria-hidden></span>
                    Updating...
                  </>
                ) : 'Update Expense'}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/view-expenses')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ModifyExpense