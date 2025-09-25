// src/pages/Profile.jsx
import '../styles/Profile.css'

const Profile = ({ user }) => {
  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <h2 className="profile-name">{user?.name || 'User Name'}</h2>
        <p className="profile-email">{user?.email || 'user@example.com'}</p>

        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">Full Name:</span>
            <span className="detail-value">{user?.name || '-'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{user?.email || '-'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Member Since:</span>
            <span className="detail-value">Jan 2025</span>
          </div>
        </div>

        <button className="edit-btn">Edit Profile</button>
      </div>
    </div>
  )
}

export default Profile
