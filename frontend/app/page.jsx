"use client"

import { useEffect } from "react"
import Dashboard from "../dashboard"

export default function Home() {
  // Check authentication on component mount
  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("craneMonitorUser")
      if (!storedUser) {
        // Redirect to landing if not authenticated
        window.location.href = "/landing"
      }
    }
  }, [])

  return <Dashboard />
}

