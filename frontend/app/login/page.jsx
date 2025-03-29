"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "operator",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("craneMonitorUser")
      if (storedUser) {
        // User is already logged in, redirect to dashboard
        window.location.href = "/"
      }
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // In a real application, this would be an API call to authenticate
      // For demo purposes, we'll simulate authentication
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simple validation
      if (formData.username.trim() === "" || formData.password.trim() === "") {
        throw new Error("Please enter both username and password")
      }

      // Mock authentication logic
      if (formData.username === "admin" && formData.password === "admin123") {
        // Store user data in localStorage or sessionStorage
        const userData = {
          id: "1",
          username: formData.username,
          role: "admin", // Always use admin role for admin user
          fullName: "Admin User",
          email: "admin@cranemonitor.com",
          joinedDate: "January 15, 2023",
          lastLogin: new Date().toISOString(),
        }

        // Store in localStorage (in a real app, you might use secure cookies or tokens)
        localStorage.setItem("craneMonitorUser", JSON.stringify(userData))

        // Force a hard navigation to dashboard
        window.location.href = "/"
      } else if (formData.username === "operator" && formData.password === "operator123") {
        // Store operator data
        const userData = {
          id: "2",
          username: formData.username,
          role: "operator", // Always use operator role for operator user
          fullName: "Operator User",
          email: "operator@cranemonitor.com",
          joinedDate: "March 10, 2023",
          lastLogin: new Date().toISOString(),
        }

        localStorage.setItem("craneMonitorUser", JSON.stringify(userData))

        // Force a hard navigation to dashboard
        window.location.href = "/"
      } else {
        throw new Error("Invalid username or password")
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <i className="bi bi-gear"></i>
          </div>
          <h1>Crane Monitor</h1>
          <p>Industrial Crane Monitoring System</p>
        </div>

        {error && (
          <div className="error-message">
            <i className="bi bi-exclamation-triangle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">
              <i className="bi bi-person"></i> Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <i className="bi bi-lock"></i> Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">
              <i className="bi bi-person-badge"></i> Role
            </label>
            <select id="role" name="role" value={formData.role} onChange={handleChange}>
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="bi bi-arrow-repeat spinning"></i> Logging in...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i> Login
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <Link href="/forgot-password">Forgot Password?</Link>
        </div>
      </div>
    </div>
  )
}

