"use client"

import { useEffect, useState } from "react"
import PredictiveMaintenance from "../../predictivemaintenance"
import axios from "axios"

// Mock fetch function
const mockFetch = (url, options = {}) => {
  console.log("Mock fetch called:", url)
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: [] }),
    text: () => Promise.resolve(""),
  })
}

// API configuration
const API_CONFIG = {
  url: "http://localhost:5000/get-sensor",
  timeout: 5000,
}

export default function PredictiveMaintenancePage() {
  const [sensorData, setSensorData] = useState({})
  const [alerts, setAlerts] = useState([])
  const [history, setHistory] = useState([])
  const [operatingHours, setOperatingHours] = useState(0)
  const [lastUpdated, setLastUpdated] = useState("")
  const [trendAlerts, setTrendAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("craneMonitorUser")
        if (!storedUser) {
          // Redirect to login if not authenticated
          window.location.href = "/login"
          return false
        }
        setIsAuthenticated(true)
        return true
      } catch (error) {
        console.error("Authentication check error:", error)
        window.location.href = "/login"
        return false
      }
    }

    const isAuth = checkAuth()
    if (!isAuth) return // Stop further execution if not authenticated

    // Setup mock fetch if needed
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      if (!window.fetchMocked) {
        window.fetch = (url, options) => mockFetch(url, options)
        window.fetchMocked = true
      }
    }

    const fetchData = async () => {
      try {
        // Fetch from API or use mock data
        const response = await axios.get(API_CONFIG.url, { timeout: API_CONFIG.timeout }).catch((error) => {
          console.error("API fetch error:", error)
          // Generate mock data if API fails
          return {
            data: {
              sensorData: {
                temperature: Math.random() * 40 + 10,
                weight: Math.random() * 10,
                distance: Math.random() * 30 + 5,
                voltage: Math.random() * 15 + 5,
                soundLevel: Math.random() * 60 + 10,
                vibration: Math.random() * 800 + 100,
                fuel: Math.random() * 100,
                totalOperatingHours: operatingHours + 0.01,
                lastUpdated: new Date().toISOString(),
              },
              alerts: [],
            },
          }
        })

        if (!response.data || !response.data.sensorData) {
          throw new Error("Invalid data format received from API")
        }

        const sensorDataResponse = response.data.sensorData
        const alertsData = response.data.alerts || []

        // Process sensor data
        const safeSensorData = {
          temperature: sensorDataResponse.temperature || 0,
          weight: sensorDataResponse.weight || 0,
          distance: sensorDataResponse.distance || 0,
          voltage: sensorDataResponse.voltage || 0,
          soundLevel: sensorDataResponse.soundLevel || 0,
          vibration: sensorDataResponse.vibration || 0,
          fuel: sensorDataResponse.fuel || 0,
          totalOperatingHours: sensorDataResponse.totalOperatingHours || operatingHours + 0.01,
        }

        setSensorData(safeSensorData)
        setAlerts(alertsData)
        setOperatingHours(safeSensorData.totalOperatingHours)

        const currentTimestamp = sensorDataResponse.lastUpdated || new Date().toISOString()
        setLastUpdated(currentTimestamp)

        // Update history
        const timestamp = new Date().toLocaleTimeString()
        setHistory((prev) => [...prev.slice(-19), { ...safeSensorData, timestamp }])

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching sensor data:", error)
        // Generate mock data on error
        const mockData = {
          temperature: Math.random() * 40 + 10,
          weight: Math.random() * 10,
          distance: Math.random() * 30 + 5,
          voltage: Math.random() * 15 + 5,
          soundLevel: Math.random() * 60 + 10,
          vibration: Math.random() * 800 + 100,
          fuel: Math.random() * 100,
          totalOperatingHours: operatingHours + 0.01,
        }

        setSensorData(mockData)
        setOperatingHours((prev) => prev + 0.01)
        setLastUpdated(new Date().toISOString())

        // Update history
        const timestamp = new Date().toLocaleTimeString()
        setHistory((prev) => [...prev.slice(-19), { ...mockData, timestamp }])

        setIsLoading(false)
      }
    }

    fetchData() // Initial fetch
    const interval = setInterval(fetchData, 5000) // Fetch every 5 seconds

    return () => clearInterval(interval) // Cleanup
  }, [operatingHours])

  // If not authenticated, don't render anything (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return (
      <div className="main-content">
        <div className="dashboard-loading">
          <div className="spinner">
            <i className="bi bi-arrow-repeat"></i>
          </div>
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="main-content">
        <div className="dashboard-loading">
          <div className="spinner">
            <i className="bi bi-arrow-repeat"></i>
          </div>
          <p>Loading predictive maintenance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div className="dashboard-container">
        <PredictiveMaintenance
          sensorData={sensorData}
          history={history}
          alerts={alerts.concat(trendAlerts)}
          operatingHours={operatingHours}
          lastUpdated={lastUpdated}
          selectedCrane={null}
          cranesData={[]}
        />
      </div>
    </div>
  )
}

