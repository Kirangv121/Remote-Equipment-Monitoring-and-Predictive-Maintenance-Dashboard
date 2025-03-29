"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem("craneMonitorUser")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserData(user)
      setIsLoading(false)
    } else {
      // Redirect to login if no user data found
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("craneMonitorUser")
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner">
          <i className="bi bi-arrow-repeat"></i>
        </div>
        <p>Loading profile data...</p>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <i className="bi bi-person-circle"></i>
        <h1>User Profile</h1>
      </div>

      <div className="profile-content">
        {/* Profile Information Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h2>Profile Information</h2>
            <button className="edit-button">
              <i className="bi bi-pencil"></i> Edit
            </button>
          </div>
          <div className="profile-card-body">
            <div className="avatar-section">
              <div className="avatar-container">
                <div className="avatar-image">
                  <i className="bi bi-person"></i>
                </div>
              </div>
              <a href="#" className="change-photo-link">
                Change Photo
              </a>
            </div>

            <div className="profile-details">
              <div className="profile-field">
                <div className="profile-field-label">Username</div>
                <div className="profile-field-value">{userData?.username}</div>
              </div>

              <div className="profile-field">
                <div className="profile-field-label">Full Name</div>
                <div className="profile-field-value">{userData?.fullName}</div>
              </div>

              <div className="profile-field">
                <div className="profile-field-label">Email</div>
                <div className="profile-field-value">{userData?.email}</div>
              </div>

              <div className="profile-field">
                <div className="profile-field-label">Role</div>
                <div className="profile-field-value">{userData?.role === "admin" ? "Admin" : "Operator"}</div>
              </div>

              <div className="profile-field">
                <div className="profile-field-label">Joined</div>
                <div className="profile-field-value">{userData?.joinedDate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <h2>Security</h2>
          </div>
          <div className="profile-card-body">
            <div className="security-item">
              <div className="security-item-info">
                <h3>Password</h3>
                <p>Last changed: 45 days ago</p>
              </div>
              <div className="security-item-action">
                <button>Change Password</button>
              </div>
            </div>

            <div className="security-item">
              <div className="security-item-info">
                <h3>Two-Factor Authentication</h3>
                <p>Protect your account with an extra layer of security</p>
              </div>
              <div className="security-item-action">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span style={{ marginLeft: "10px" }}>{twoFactorEnabled ? "Enabled" : "Disabled"}</span>
              </div>
            </div>

            <div className="security-item">
              <div className="security-item-info">
                <h3>Login Sessions</h3>
                <p>You are currently logged in from 1 device</p>
              </div>
              <div className="security-item-action">
                <button>Manage Sessions</button>
              </div>
            </div>

            <div className="security-item">
              <div className="security-item-info">
                <h3>Activity Log</h3>
                <p>View your account activity history</p>
              </div>
              <div className="security-item-action">
                <button>View Activity</button>
              </div>
            </div>

            <div className="security-item">
              <div className="security-item-info">
                <h3>Logout</h3>
                <p>Sign out from your account</p>
              </div>
              <div className="security-item-action">
                <button onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

