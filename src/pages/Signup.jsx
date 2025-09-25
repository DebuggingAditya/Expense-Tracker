// src/pages/Signup.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import "../styles/Signup.css"
import { AuthService } from '../services/AuthService'

const Signup = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  useEffect(() => {
    // Calculate password strength
    const calculateStrength = () => {
      let strength = 0
      if (formData.password.length > 0) strength++ // Not empty
      if (formData.password.length >= 8) strength++ // At least 8 chars
      if (/[A-Z]/.test(formData.password)) strength++ // Contains uppercase
      if (/[0-9]/.test(formData.password)) strength++ // Contains number
      if (/[^A-Za-z0-9]/.test(formData.password)) strength++ // Contains special char
      
      // Cap at 4 for our strength meter (0-4)
      setPasswordStrength(Math.min(strength, 4))
    }
    
    calculateStrength()
  }, [formData.password])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your full name.')
      setLoading(false)
      return
    }
    if (!formData.email.trim()) {
      setError('Please enter your email.')
      setLoading(false)
      return
    }
    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters long.')
      setLoading(false)
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }
    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.')
      setLoading(false)
      return
    }

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      }

      const { ok, status, data } = await AuthService.register(payload)

      if (ok && data && data.token) {
        // If API returns token + user, use that
        onLogin(data.token, data.user || { name: data.name || formData.name, email: data.email || formData.email })
      } else if (ok && data && data.message && !data.token) {
        // Some APIs return success message but no auto-login
        // In that case, you might redirect to login — but we'll attempt to login automatically if possible.
        // Fallback: show message and redirect to login after small delay
        setError(data.message || 'Registered successfully. Redirecting to login...')
        setTimeout(() => {
          window.location.href = '/login'
        }, 1200)
      } else {
        // show error from API or generic message
        const msg = (data && (data.message || data.error)) || `Registration failed (${status})`
        setError(msg)
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <div className="logo-container" aria-hidden>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="logo" focusable="false" aria-hidden="true">
              <path fill="#fff" d="M50 5C25.1 5 5 25.1 5 50s20.1 45 45 45 45-20.1 45-45S74.9 5 50 5zm0 80c-19.3 0-35-15.7-35-35S30.7 15 50 15s35 15.7 35 35-15.7 35-35 35z"/>
              <path fill="#fff" d="M65 45H35c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h30c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zM50 35c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5z"/>
            </svg>
          </div>
          <h3>Create Your Account</h3>
          <p>Join our community and start your journey</p>
        </div>

        <div className="signup-body">
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <span className="input-icon" aria-hidden>👤</span>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon" aria-hidden>📧</span>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
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
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="password-toggle" onClick={togglePasswordVisibility} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {formData.password && (
                <div className="password-strength-container">
                  <div className="password-strength">
                    <div className={`strength-bar strength-${passwordStrength}`}></div>
                  </div>
                  <div className="password-strength-text">
                    {passwordStrength === 0 && 'Very Weak'}
                    {passwordStrength === 1 && 'Weak'}
                    {passwordStrength === 2 && 'Fair'}
                    {passwordStrength === 3 && 'Good'}
                    {passwordStrength === 4 && 'Strong'}
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <span className="input-icon" aria-hidden>🔒</span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="password-toggle" onClick={toggleConfirmPasswordVisibility} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            
            <div className="form-group terms-checkbox">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={agreedToTerms} 
                  onChange={() => setAgreedToTerms(!agreedToTerms)} 
                />
                <span className="checkmark" aria-hidden></span>
                I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
              </label>
            </div>
            
            <button
              type="submit"
              className="signup-btn"
              disabled={loading || !agreedToTerms}
              aria-disabled={loading || !agreedToTerms}
            >
              {loading ? (
                <>
                  <span className="spinner" aria-hidden></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          <div className="divider"><span>Or continue with</span></div>
          
          <div className="social-login">
            <button className="social-btn google-btn" type="button" aria-label="Sign up with Google">Google</button>
            <button className="social-btn github-btn" type="button" aria-label="Sign up with GitHub">GitHub</button>
          </div>
          
          <div className="signup-footer">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
