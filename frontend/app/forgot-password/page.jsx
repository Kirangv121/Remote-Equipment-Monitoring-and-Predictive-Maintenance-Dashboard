"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validate email
      if (!email.trim()) {
        throw new Error("Please enter your email address")
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success message
      setIsSubmitted(true)
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
          <h1>Reset Password</h1>
          <p>Enter your email to receive a password reset link</p>
        </div>

        {error && (
          <div className="error-message">
            <i className="bi bi-exclamation-triangle"></i> {error}
          </div>
        )}

        {isSubmitted ? (
          <div className="success-message">
            <i className="bi bi-check-circle"></i>
            <p>Password reset instructions have been sent to your email.</p>
            <div className="login-footer" style={{ marginTop: "20px" }}>
              <Link href="/login">Return to Login</Link>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">
                  <i className="bi bi-envelope"></i> Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <i className="bi bi-arrow-repeat spinning"></i> Sending...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send"></i> Send Reset Link
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <Link href="/login">Back to Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

