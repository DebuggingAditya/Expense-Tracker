import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/Navbar.css'

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    setIsOpen(false)
    setDropdownOpen(false)
  }, [location])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleMenu = () => setIsOpen(prev => !prev)
  const toggleDropdown = () => setDropdownOpen(prev => !prev)

  const handleLogout = () => {
    setDropdownOpen(false)
    setIsOpen(false)
    if (typeof onLogout === 'function') onLogout()
  }

  return (
    <nav className="navbar custom-navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="brand">
          <img src="/src/assets/react.png" alt="Expense Tracker Logo" className="brand-logo" />
          <span className="brand-text">Expense Tracker</span>
        </Link>

        <button
          className={`nav-toggle ${isOpen ? 'active' : ''}`}
          aria-controls="primary-navigation"
          aria-expanded={isOpen}
          onClick={toggleMenu}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <span className="hamburger">
            <span className="bar bar1" />
            <span className="bar bar2" />
            <span className="bar bar3" />
          </span>
        </button>

        <div
          id="primary-navigation"
          className={`nav-links ${isOpen ? 'open' : ''}`}
          role="menu"
        >
          <ul className="left-links">
            <li role="none">
              <Link role="menuitem" to="/dashboard" className="nav-link">Dashboard</Link>
            </li>
            <li role="none">
              <Link role="menuitem" to="/add-expense" className="nav-link">Add Expense</Link>
            </li>
            <li role="none">
              <Link role="menuitem" to="/view-expenses" className="nav-link">View Expenses</Link>
            </li>
            <li role="none" className="hide-desktop">
              <Link role="menuitem" to="/profile" className="nav-link">Profile</Link>
            </li>
          </ul>

          <div className="right-actions" ref={dropdownRef}>
            <button
              className="profile-btn"
              onClick={toggleDropdown}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <span className="avatar">{(user?.name || user?.email || 'U')[0].toUpperCase()}</span>
              <span className="profile-name hide-mobile">{user?.name || user?.email || 'User'}</span>
              <span className={`chev ${dropdownOpen ? 'open' : ''}`} aria-hidden>▾</span>
            </button>

            <div className={`profile-menu ${dropdownOpen ? 'show' : ''}`} role="menu">
              <Link to="/profile" className="profile-item" role="menuitem" onClick={() => setDropdownOpen(false)}>Your Profile</Link>
              <div className="profile-divider" />
              <button className="profile-item logout" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar