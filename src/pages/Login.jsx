// src/pages/Login.jsx
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Login.css'
import { AuthService } from '../services/AuthService'

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const animationRef = useRef(null)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!formData.email.trim() || !formData.password) {
      setError('Please provide both email and password.')
      return
    }

    setLoading(true)
    setShowAnimation(true)
    
    try {
      const { ok, status, data } = await AuthService.login({
        email: formData.email.trim(),
        password: formData.password
      })

      if (ok && data && data.token) {
        // call parent handler (App) which will persist token/user to localStorage
        onLogin(data.token, data.user || { email: formData.email })
      } else {
        // handle common error shapes
        const msg = (data && (data.message || data.error)) || `Login failed (${status})`
        setError(msg)
        setShowAnimation(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
      setShowAnimation(false)
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(p => !p)
  }

  return (
    <div className="login-container" role="main">
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <div className="logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" focusable="false" aria-hidden="true">
                  <path fill="#e50914" d="M50 5C25.1 5 5 25.1 5 50s20.1 45 45 45 45-20.1 45-45S74.9 5 50 5zm0 80c-19.3 0-35-15.7-35-35S30.7 15 50 15s35 15.7 35 35-15.7 35-35 35z"/>
                  <path fill="#e50914" d="M65 45H35c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h30c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zM50 35c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5z"/>
                </svg>
              </div>
            </div>
            <h2>Welcome Back</h2>
            <p className="subtitle">Sign in to continue your journey</p>
          </div>

          <div className="login-body">
            {error && <div className="alert-error" role="alert">{error}</div>}
            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <span className="input-icon" aria-hidden>✉️</span>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <span className="input-icon" aria-hidden>🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span className="checkmark" aria-hidden></span>
                  Remember me
                </label>
                <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={loading}
                aria-disabled={loading}
              >
                {loading ? <><span className="spinner" aria-hidden></span> Logging in...</> : 'Sign In'}
              </button>
            </form>

            <div className="divider"><span>Or continue with</span></div>

            <div className="social-login">
              <button className="social-btn google-btn" type="button" aria-label="Sign in with Google">
                <span className="social-icon">G</span> Google
              </button>
              <button className="social-btn github-btn" type="button" aria-label="Sign in with GitHub">
                <span className="social-icon">G</span> GitHub
              </button>
            </div>

            <div className="login-footer">
              <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
            </div>
          </div>
        </div>

        {/* Database Animation Container */}
        <div className={`database-animation ${showAnimation ? 'active' : ''}`} ref={animationRef}>
          <div className="database-container">
            <div className="database">
              <div className="db-header">
                <div className="db-circle"></div>
                <div className="db-circle"></div>
                <div className="db-circle"></div>
              </div>
              <div className="db-body">
                <div className="data-row"></div>
                <div className="data-row"></div>
                <div className="data-row"></div>
                <div className="data-stream">
                  <div className="data-packet" style={{ '--delay': '0s' }}></div>
                  <div className="data-packet" style={{ '--delay': '0.2s' }}></div>
                  <div className="data-packet" style={{ '--delay': '0.4s' }}></div>
                  <div className="data-packet" style={{ '--delay': '0.6s' }}></div>
                  <div className="data-packet" style={{ '--delay': '0.8s' }}></div>
                </div>
              </div>
            </div>
            <div className="animation-text">
              <p>Storing your data securely</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login