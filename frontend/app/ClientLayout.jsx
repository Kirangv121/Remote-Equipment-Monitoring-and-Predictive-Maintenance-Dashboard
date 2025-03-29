"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import "bootstrap/dist/css/bootstrap.min.css"

export default function ClientLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const [permissions] = useState({
    operator: ["/", "/predictive", "/alerts", "/profile", "/map"],
    admin: [
      "/",
      "/predictive",
      "/alerts",
      "/maintenance",
      "/incidents",
      "/analytics",
      "/profile",
      "/operators",
      "/map",
    ],
  })

  const checkAuth = useCallback(() => {
    try {
      // Only run on client side
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("craneMonitorUser")
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setUserData(user)
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          // Redirect to login if not authenticated and not already on login page or landing page
          if (pathname !== "/login" && pathname !== "/forgot-password" && pathname !== "/landing" && !isInitialLoad) {
            window.location.href = "/landing"
          }
        }
      }
    } catch (error) {
      console.error("Authentication check error:", error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
      if (isInitialLoad) {
        setIsInitialLoad(false)
      }
    }
  }, [pathname, isInitialLoad])

  // Check authentication status on component mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Check for mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true)
      }
    }

    // Initial check
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const handleLogout = () => {
    localStorage.removeItem("craneMonitorUser")
    setIsAuthenticated(false)
    window.location.href = "/landing"
  }

  // Check if user has permission to access the current page
  const checkPermission = useCallback(() => {
    if (!userData) return false

    // Admin has access to everything
    if (userData.role === "admin") return true

    // Role-based permissions
    return permissions[userData.role]?.includes(pathname) || false
  }, [userData, pathname, permissions])

  // If user doesn't have permission, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading && !checkPermission() && !isInitialLoad) {
      window.location.href = "/"
    }
  }, [isAuthenticated, isLoading, checkPermission, isInitialLoad])

  // Handle navigation
  const handleNavigation = (path) => {
    window.location.href = path
  }

  // If on login page, landing page, or not authenticated, just render children
  if (pathname === "/login" || pathname === "/forgot-password" || pathname === "/landing" || !isAuthenticated) {
    return <>{children}</>
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner">
          <i className="bi bi-arrow-repeat spinning"></i>
        </div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <i className="bi bi-gear"></i>
            {!isSidebarCollapsed && <span>Crane Monitor</span>}
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <i className={`bi bi-chevron-${isSidebarCollapsed ? "right" : "left"}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className={pathname === "/" ? "active" : ""}>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavigation("/")
                }}
              >
                <i className="bi bi-speedometer2"></i>
                {!isSidebarCollapsed && <span>Dashboard</span>}
              </a>
            </li>
            <li className={pathname === "/predictive" ? "active" : ""}>
              <a
                href="/predictive"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavigation("/predictive")
                }}
              >
                <i className="bi bi-graph-up"></i>
                {!isSidebarCollapsed && <span>Predictive Maintenance</span>}
              </a>
            </li>
            <li className={pathname === "/alerts" ? "active" : ""}>
              <a
                href="/alerts"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavigation("/alerts")
                }}
              >
                <i className="bi bi-bell"></i>
                {!isSidebarCollapsed && <span>Alerts</span>}
              </a>
            </li>
            <li className={pathname === "/map" ? "active" : ""}>
              <a
                href="/map"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavigation("/map")
                }}
              >
                <i className="bi bi-geo-alt"></i>
                {!isSidebarCollapsed && <span>Map View</span>}
              </a>
            </li>

            {/* Conditional rendering based on role */}
            {userData?.role === "admin" && (
              <>
                <li className={pathname === "/maintenance" ? "active" : ""}>
                  <a
                    href="/maintenance"
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavigation("/maintenance")
                    }}
                  >
                    <i className="bi bi-tools"></i>
                    {!isSidebarCollapsed && <span>Maintenance</span>}
                  </a>
                </li>
                <li className={pathname === "/incidents" ? "active" : ""}>
                  <a
                    href="/incidents"
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavigation("/incidents")
                    }}
                  >
                    <i className="bi bi-exclamation-triangle"></i>
                    {!isSidebarCollapsed && <span>Incidents</span>}
                  </a>
                </li>
              </>
            )}

            {/* Admin-only sections */}
            {userData?.role === "admin" && (
              <>
                <li className={pathname === "/analytics" ? "active" : ""}>
                  <a
                    href="/analytics"
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavigation("/analytics")
                    }}
                  >
                    <i className="bi bi-bar-chart"></i>
                    {!isSidebarCollapsed && <span>Analytics</span>}
                  </a>
                </li>
                <li className={pathname === "/operators" ? "active" : ""}>
                  <a
                    href="/operators"
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavigation("/operators")
                    }}
                  >
                    <i className="bi bi-people"></i>
                    {!isSidebarCollapsed && <span>Operators</span>}
                  </a>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <a
              href="/profile"
              onClick={(e) => {
                e.preventDefault()
                handleNavigation("/profile")
              }}
              className={pathname === "/profile" ? "active" : ""}
            >
              <i className="bi bi-person-circle"></i>
              {!isSidebarCollapsed && <span className="username">{userData?.username || "User"}</span>}
            </a>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={`main-content ${isSidebarCollapsed ? "expanded" : ""}`}>
        <div className="top-bar">
          <div className="mobile-menu">
            {isMobile && (
              <button onClick={toggleSidebar}>
                <i className="bi bi-list"></i>
              </button>
            )}
          </div>
          <div className="user-dropdown">
            <span>{userData?.fullName || userData?.username}</span>
            <i className="bi bi-person-circle"></i>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

