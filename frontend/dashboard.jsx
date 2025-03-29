"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Line } from "react-chartjs-2"
import "bootstrap/dist/css/bootstrap.min.css"
import PredictiveMaintenance from "./predictivemaintenance"
import Alerts from "./alerts"

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend)

// Remove MSW imports and replace with a simple mock function if needed
const mockFetch = (url, options = {}) => {
  console.log("Mock fetch called:", url)
  // Return mock data based on the URL
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
  useMockData: false, // Set to false to use the real API by default
}

// Crane data structure with equipment parts and sensors
const cranesData = [
  {
    id: 1,
    name: "XCMG Truck Crane (Mobile Crane)",
    description: "High-performance mobile crane with telescopic boom and advanced hydraulic system",
    capacity: "25 tons",
    year: "2021",
    image: "https://cdnus.globalso.com/imachinemall/138.jpg",
    equipment: [
      {
        id: 1,
        name: "Telescopic Boom",
        sensors: ["Load Sensor", "Vibration Sensor"],
      },
      {
        id: 2,
        name: "Hydraulic System",
        sensors: ["Power Sensor", "Temperature Sensor"],
      },
      {
        id: 3,
        name: "Outriggers",
        sensors: ["Load Sensor", "Ultrasonic Sensor"],
      },
      {
        id: 4,
        name: "Chassis & Carrier",
        sensors: ["Fuel Sensor", "Ultrasonic Sensor"],
      },
    ],
  },
  {
    id: 2,
    name: "POTAIN MDT 219 (Tower Crane)",
    description: "Versatile tower crane with excellent lifting capacity and reach",
    capacity: "10 tons",
    year: "2020",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Potain_MDT_219_J10_%2851285881737%29.jpg/800px-Potain_MDT_219_J10_%2851285881737%29.jpg",
    equipment: [
      {
        id: 1,
        name: "Mast (Tower)",
        sensors: ["Vibration Sensor"],
      },
      {
        id: 2,
        name: "Slewing Unit",
        sensors: ["Sound Sensor"],
      },
      {
        id: 3,
        name: "Trolley",
        sensors: ["Load Sensor", "Ultrasonic Sensor"],
      },
      {
        id: 4,
        name: "Operator Cabin",
        sensors: ["Temperature Sensor"],
      },
      {
        id: 5,
        name: "Counter Jib",
        sensors: ["Load Sensor", "Vibration Sensor"],
      },
    ],
  },
  {
    id: 3,
    name: "GROVE GRT880 (Rough Terrain Crane)",
    description: "Rugged all-terrain crane designed for challenging work environments",
    capacity: "80 tons",
    year: "2022",
    image:
      "https://media.sandhills.com/img.axd?id=9042894756&wid=4326168077&rwl=False&p=&ext=&w=350&h=220&t=&lp=&c=True&wt=False&sz=Max&rt=0&checksum=VvAUvCuE1bFrhh2GL0u2a3dwLJF3YDFecaTTVgCz24w%3D",
    equipment: [
      {
        id: 1,
        name: "Boom",
        sensors: ["Load Sensor", "Vibration Sensor"],
      },
      {
        id: 2,
        name: "Hydraulic System",
        sensors: ["Power Sensor", "Temperature Sensor"],
      },
      {
        id: 3,
        name: "Chassis & Suspension",
        sensors: ["Vibration Sensor", "Ultrasonic Sensor"],
      },
      {
        id: 4,
        name: "Wheels & Tires",
        sensors: ["Load Sensor"],
      },
      {
        id: 5,
        name: "Fuel System",
        sensors: ["Fuel Sensor"],
      },
    ],
  },
  {
    id: 4,
    name: "Liebherr Crawler Crane",
    description: "Heavy-duty crawler crane with exceptional stability and lifting power",
    capacity: "100 tons",
    year: "2019",
    image:
      "https://www.heavyliftnews.com/wp-content/uploads/2019/11/1114-liebherr-eseasa-lr13000-tampico-motiv03-300dpi.jpg",
    equipment: [
      {
        id: 1,
        name: "Boom",
        sensors: ["Load Sensor", "Vibration Sensor"],
      },
      {
        id: 2,
        name: "Crawler Tracks",
        sensors: ["Ultrasonic Sensor"],
      },
      {
        id: 3,
        name: "Hydraulic System",
        sensors: ["Temperature Sensor", "Power Sensor"],
      },
      {
        id: 4,
        name: "Counterweight System",
        sensors: ["Load Sensor", "Vibration Sensor"],
      },
      {
        id: 5,
        name: "Operator Cabin",
        sensors: ["Sound Sensor", "Temperature Sensor"],
      },
    ],
  },
]

// Map sensor names to data keys
const sensorToDataKey = {
  "Load Sensor": "weight",
  "Vibration Sensor": "vibration",
  "Temperature Sensor": "temperature",
  "Power Sensor": "voltage",
  "Ultrasonic Sensor": "distance",
  "Sound Sensor": "soundLevel",
  "Fuel Sensor": "fuel",
}

// Map sensor names to colors for charts
const sensorColors = {
  "Load Sensor": "#3498db",
  "Vibration Sensor": "#8e44ad",
  "Temperature Sensor": "#e74c3c",
  "Power Sensor": "#f39c12",
  "Ultrasonic Sensor": "#2ecc71",
  "Sound Sensor": "#1abc9c",
  "Fuel Sensor": "#34495e",
}

// Map sensor names to units
const sensorUnits = {
  "Load Sensor": "kg",
  "Vibration Sensor": "Hz",
  "Temperature Sensor": "°C",
  "Power Sensor": "V",
  "Ultrasonic Sensor": "cm",
  "Sound Sensor": "dB",
  "Fuel Sensor": "L",
}

// Map sensor names to icons
const sensorIcons = {
  "Load Sensor": "⚖️",
  "Vibration Sensor": "📳",
  "Temperature Sensor": "🌡️",
  "Power Sensor": "⚡",
  "Ultrasonic Sensor": "📏",
  "Sound Sensor": "🔊",
  "Fuel Sensor": "⛽",
}

// Alert thresholds for sensors - aligned with backend
const alertThresholds = {
  "Load Sensor": { warning: 6, fault: 8 },
  "Vibration Sensor": { warning: 500, fault: 700 },
  "Temperature Sensor": { warning: 35, fault: 40 },
  "Power Sensor": { warning: 12, fault: 15 },
  "Ultrasonic Sensor": { warning: 15, fault: 10 },
  "Sound Sensor": { warning: 40, fault: 50 },
  "Fuel Sensor": { warning: 20, fault: 10 },
}

// Check alert status for a sensor
const checkAlertStatus = (sensor, value) => {
  const threshold = alertThresholds[sensor]
  if (!threshold) return "normal"

  // Special case for Ultrasonic Sensor (lower values are more dangerous)
  if (sensor === "Ultrasonic Sensor") {
    if (value <= threshold.fault) return "fault"
    if (value <= threshold.warning) return "warning"
    return "normal"
  }

  // For all other sensors (higher values are more dangerous)
  if (value >= threshold.fault) return "fault"
  if (value >= threshold.warning) return "warning"
  return "normal"
}

const Dashboard = () => {
  // At the beginning of the Dashboard component, add a state for the sidebar navigation
  const [activeView, setActiveView] = useState("dashboard") // "dashboard" or "predictive"
  const [sensorData, setSensorData] = useState({})
  const [alerts, setAlerts] = useState([])
  const [history, setHistory] = useState([])
  const [operatingHours, setOperatingHours] = useState(0)
  const [lastUpdated, setLastUpdated] = useState("")
  const [craneAlertStatus, setCraneAlertStatus] = useState({})
  const [trendAlerts, setTrendAlerts] = useState([])

  // Add these state variables after the other useState declarations
  const [fuelLevel, setFuelLevel] = useState(12 + Math.random() * 0.5) // Initial value between 12-12.5%
  const [fuelUpdateTimer, setFuelUpdateTimer] = useState(0)

  // Navigation state
  const [selectedCrane, setSelectedCrane] = useState(null)
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [selectedSensor, setSelectedSensor] = useState(null)
  const [view, setView] = useState("cranes") // "cranes", "equipment", "sensors", "details", "predictive"

  // Fetch sensor data every 5 seconds
  useEffect(() => {
    // Simple mock implementation instead of MSW
    // Only add this if it's not already in alerts.jsx
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      const originalFetch = window.fetch
      if (!window.fetchMocked) {
        window.fetch = (url, options) => mockFetch(url, options)
        window.fetchMocked = true
      }
    }

    const fetchData = async () => {
      try {
        let sensorDataResponse
        let alertsData = []

        // Try to fetch from real API first
        try {
          console.log("Attempting to connect to backend API...")
          const response = await axios.get(API_CONFIG.url, {
            timeout: API_CONFIG.timeout,
          })

          if (response.data && response.data.sensorData) {
            // Use the backend data format
            sensorDataResponse = response.data.sensorData
            alertsData = response.data.alerts || []

            // Inside the fetchData function, replace the line:
            // sensorDataResponse.fuel = Math.random() * 100; // 0-100L

            // With this code:
            // Keep the existing fuel level, it will be updated separately on an 8-second interval
            sensorDataResponse.fuel = fuelLevel

            console.log("Successfully connected to backend API")
          } else {
            throw new Error("Invalid data format received from API")
          }
        } catch (apiError) {
          console.log("API fetch error, falling back to mock data:", apiError.message)
          // Fall back to mock data on API error
          sensorDataResponse = {
            temperature: Math.random() * 40 + 10, // 10-50°C
            weight: Math.random() * 10, // 0-10kg
            distance: Math.random() * 30 + 5, // 5-35cm
            voltage: Math.random() * 15 + 5, // 5-20V
            soundLevel: Math.random() * 60 + 10, // 10-70dB
            vibration: Math.random() * 800 + 100, // 100-900Hz
            fuel: Math.random() * 100, // 0-100L
            totalOperatingHours: operatingHours + 0.01, // Increment slightly
            lastUpdated: new Date().toISOString(),
          }
        }

        // Ensure all expected sensor keys exist
        const safeSensorData = {
          temperature: sensorDataResponse.temperature || 0,
          weight: sensorDataResponse.weight || 0,
          distance: sensorDataResponse.distance || 0,
          voltage: sensorDataResponse.voltage || 0,
          soundLevel: sensorDataResponse.soundLevel || 0,
          vibration: sensorDataResponse.vibration || 0,
          // Replace this line:
          // fuel: sensorDataResponse.fuel || 0,

          // With this:
          fuel: fuelLevel, // Use the separately managed fuel level
          totalOperatingHours: sensorDataResponse.totalOperatingHours || operatingHours + 0.01,
        }

        setSensorData(safeSensorData)
        setAlerts(alertsData)

        // Directly use the totalOperatingHours from the backend
        setOperatingHours(safeSensorData.totalOperatingHours)

        // Ensure we have a valid timestamp
        const currentTimestamp = sensorDataResponse.lastUpdated || new Date().toISOString()
        setLastUpdated(currentTimestamp)

        // Append new reading while maintaining the last 20 values
        const timestamp = new Date().toLocaleTimeString()
        setHistory((prev) => [...prev.slice(-19), { ...safeSensorData, timestamp }])

        // Update crane alert status
        updateCraneAlertStatus(safeSensorData)

        // Detect trends for early fault prediction
        const newTrendAlerts = detectTrends(safeSensorData, history)
        setTrendAlerts(newTrendAlerts)
      } catch (error) {
        console.error("Error fetching sensor data:", error)
        // Generate mock data on error
        const mockData = {
          temperature: Math.random() * 40 + 10, // 10-50°C
          weight: Math.random() * 10, // 0-10kg
          distance: Math.random() * 30 + 5, // 5-35cm
          voltage: Math.random() * 15 + 5, // 5-20V
          soundLevel: Math.random() * 60 + 10, // 10-70dB
          vibration: Math.random() * 800 + 100, // 100-900Hz
          fuel: Math.random() * 100, // 0-100L
          totalOperatingHours: operatingHours + 0.01, // Increment slightly
        }

        setSensorData(mockData)
        setOperatingHours((prev) => prev + 0.01)
        setLastUpdated(new Date().toISOString())

        // Append new reading while maintaining the last 20 values
        const timestamp = new Date().toLocaleTimeString()
        setHistory((prev) => [...prev.slice(-19), { ...mockData, timestamp }])

        // Update crane alert status
        updateCraneAlertStatus(mockData)
      }
    }

    // Update crane alert status based on sensor data
    const updateCraneAlertStatus = (data) => {
      const newStatus = {}

      cranesData.forEach((crane) => {
        let craneStatus = "normal"

        crane.equipment.forEach((equipment) => {
          equipment.sensors.forEach((sensor) => {
            const dataKey = sensorToDataKey[sensor]
            const value = data[dataKey]
            const status = checkAlertStatus(sensor, value)

            if (status === "fault") {
              craneStatus = "fault"
            } else if (status === "warning" && craneStatus !== "fault") {
              craneStatus = "warning"
            }
          })
        })

        newStatus[crane.id] = craneStatus
      })

      setCraneAlertStatus(newStatus)
    }

    // Detect trends in sensor data to predict potential failures
    const detectTrends = (newData, history) => {
      if (history.length < 5) return [] // Need at least 5 data points for trend analysis

      const newTrendAlerts = []

      // Check for increasing trends (temperature, vibration, sound, load, power)
      const increasingParams = [
        { key: "temperature", name: "Temperature", threshold: 0.5, unit: "°C" },
        { key: "vibration", name: "Vibration", threshold: 20, unit: "Hz" },
        { key: "soundLevel", name: "Sound Level", threshold: 2, unit: "dB" },
        { key: "weight", name: "Load", threshold: 0.2, unit: "kg" },
        { key: "voltage", name: "Power", threshold: 0.3, unit: "V" },
      ]

      // Check for decreasing trends (fuel, distance)
      const decreasingParams = [
        { key: "fuel", name: "Fuel Level", threshold: -0.5, unit: "L" },
        { key: "distance", name: "Distance", threshold: -0.5, unit: "cm" },
      ]

      // Calculate trends for increasing parameters
      increasingParams.forEach((param) => {
        const recentValues = history.slice(-5).map((h) => h[param.key])
        const trend = calculateTrend(recentValues)

        if (trend > param.threshold) {
          newTrendAlerts.push({
            sensor: param.name,
            trend: trend.toFixed(2),
            direction: "increasing",
            message: `${param.name} is increasing at a rate of ${trend.toFixed(2)} ${param.unit} per reading`,
            suggestion: `Check ${param.name.toLowerCase()} system for potential issues`,
            severity: trend > param.threshold * 2 ? "high" : "medium",
          })
        }
      })

      // Calculate trends for decreasing parameters
      decreasingParams.forEach((param) => {
        const recentValues = history.slice(-5).map((h) => h[param.key])
        const trend = calculateTrend(recentValues)

        if (trend < param.threshold) {
          newTrendAlerts.push({
            sensor: param.name,
            trend: trend.toFixed(2),
            direction: "decreasing",
            message: `${param.name} is decreasing at a rate of ${Math.abs(trend).toFixed(2)} ${param.unit} per reading`,
            suggestion: `Check ${param.name.toLowerCase()} system for potential issues`,
            severity: trend < param.threshold * 2 ? "high" : "medium",
          })
        }
      })

      return newTrendAlerts
    }

    // Calculate linear trend from array of values
    const calculateTrend = (values) => {
      const n = values.length
      const indices = Array.from({ length: n }, (_, i) => i)

      // Calculate means
      const meanX = indices.reduce((sum, x) => sum + x, 0) / n
      const meanY = values.reduce((sum, y) => sum + y, 0) / n

      // Calculate slope
      const numerator = indices.reduce((sum, x, i) => sum + (x - meanX) * (values[i] - meanY), 0)
      const denominator = indices.reduce((sum, x) => sum + Math.pow(x - meanX, 2), 0)

      return denominator === 0 ? 0 : numerator / denominator
    }

    fetchData() // Initial fetch
    const interval = setInterval(fetchData, 5000) // Fetch every 5 seconds

    return () => clearInterval(interval) // Cleanup
  }, [])

  // Add this useEffect after the main data fetching useEffect
  useEffect(() => {
    // Update fuel level every 8 seconds
    const fuelInterval = setInterval(() => {
      // Generate a random value between 12% and 12.5%
      const newFuelLevel = 12 + Math.random() * 0.5
      setFuelLevel(newFuelLevel)
      console.log("Fuel level updated:", newFuelLevel.toFixed(2) + "%")
    }, 8000) // 8 seconds interval

    return () => clearInterval(fuelInterval) // Cleanup
  }, [])

  // Properly formatted Operating Hours
  const formatOperatingHours = (hours) => {
    if (!hours) return "0 hrs"

    const totalHours = Math.floor(hours)
    const days = Math.floor(totalHours / 24)
    const remainingHours = totalHours % 24

    if (days > 0) {
      return `${days}d ${remainingHours}h`
    } else {
      return `${totalHours}h ${Math.floor((hours - totalHours) * 60)}m`
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Generate Chart Data
  const generateChartData = (sensorName) => {
    const dataKey = sensorToDataKey[sensorName]
    const color = sensorColors[sensorName]

    return {
      labels: history.map((data) => data.timestamp),
      datasets: [
        {
          label: sensorName,
          data: history.map((data) => data[dataKey] || 0),
          borderColor: color,
          backgroundColor: `${color}33`,
          tension: 0.4,
          pointRadius: 2,
          fill: true,
        },
      ],
    }
  }

  // Handle crane selection
  const handleCraneSelect = (crane) => {
    setSelectedCrane(crane)
    setSelectedEquipment(null)
    setSelectedSensor(null)
    setView("equipment")
  }

  // Handle equipment selection
  const handleEquipmentSelect = (equipment) => {
    setSelectedEquipment(equipment)
    setSelectedSensor(null)
    setView("sensors")
  }

  // Handle sensor selection
  const handleSensorSelect = (sensor) => {
    setSelectedSensor(sensor)
    setView("details")
  }

  // Handle navigation back
  const handleBack = () => {
    if (view === "details") {
      setView("sensors")
      setSelectedSensor(null)
    } else if (view === "sensors") {
      setView("equipment")
      setSelectedEquipment(null)
    } else if (view === "equipment") {
      setView("cranes")
      setSelectedCrane(null)
    }
  }

  // Get background color based on alert status
  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case "fault":
        return "bg-danger-subtle"
      case "warning":
        return "bg-warning-subtle"
      default:
        return "bg-success-subtle"
    }
  }

  // Get text color based on alert status
  const getStatusTextColor = (status) => {
    switch (status) {
      case "fault":
        return "text-danger"
      case "warning":
        return "text-warning"
      default:
        return "text-success"
    }
  }

  // Get status icon based on alert status
  const getStatusIcon = (status) => {
    switch (status) {
      case "fault":
        return "❌"
      case "warning":
        return "⚠️"
      default:
        return "✅"
    }
  }

  // Count active alerts for a crane
  const countAlerts = (crane, status) => {
    let count = 0

    crane.equipment.forEach((equipment) => {
      equipment.sensors.forEach((sensor) => {
        const dataKey = sensorToDataKey[sensor]
        const value = sensorData[dataKey]
        const sensorStatus = checkAlertStatus(sensor, value)

        if (sensorStatus === status) {
          count++
        }
      })
    })

    return count
  }

  // Render cranes view
  const renderCranes = () => (
    <div className="row">
      <h3 className="text-center mb-4 dashboard-title">Select a Crane</h3>
      {cranesData.map((crane) => {
        const status = craneAlertStatus[crane.id] || "normal"
        const faultCount = countAlerts(crane, "fault")
        const warningCount = countAlerts(crane, "warning")

        return (
          <div key={crane.id} className="col-md-6 mb-4">
            <div className={`card crane-card shadow hover-card enhanced-card`} onClick={() => handleCraneSelect(crane)}>
              <div className={`status-badge ${getStatusTextColor(status)}`}>{status.toUpperCase()}</div>
              <div className="card-img-container">
                <img src={crane.image || "/placeholder.svg"} className="card-img" alt={crane.name} />
                <div className={`status-overlay ${status}`}></div>
              </div>
              <div className="card-body">
                <h5 className="card-title">{crane.name}</h5>
                <p className="card-description">{crane.description}</p>

                <div className="crane-specs">
                  <div className="spec-item">
                    <i className="bi bi-speedometer2 me-2"></i>
                    <span>Capacity: {crane.capacity}</span>
                  </div>
                  <div className="spec-item">
                    <i className="bi bi-calendar-event me-2"></i>
                    <span>Year: {crane.year}</span>
                  </div>
                </div>

                <div className="alert-summary mt-3">
                  {faultCount > 0 && (
                    <span className="alert-badge fault me-2">
                      <i className="bi bi-exclamation-triangle-fill me-1"></i>
                      {faultCount} {faultCount === 1 ? "Fault" : "Faults"}
                    </span>
                  )}
                  {warningCount > 0 && (
                    <span className="alert-badge warning me-2">
                      <i className="bi bi-exclamation-circle-fill me-1"></i>
                      {warningCount} {warningCount === 1 ? "Warning" : "Warnings"}
                    </span>
                  )}
                  {faultCount === 0 && warningCount === 0 && (
                    <span className="alert-badge normal">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      All Systems Normal
                    </span>
                  )}
                </div>

                <div className="d-flex justify-content-between mt-3">
                  <p className="card-text">
                    <i className="bi bi-tools me-2"></i>
                    {crane.equipment.length} equipment parts
                  </p>
                  <p className="card-text">
                    <i className="bi bi-clock-history me-2"></i>
                    {formatOperatingHours(operatingHours)}
                  </p>
                </div>

                <button className="btn btn-primary w-100 mt-3">
                  <i className="bi bi-eye me-2"></i>
                  View Details
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  // Render equipment view
  const renderEquipment = () => (
    <div className="row">
      <h3 className="text-center mb-4 dashboard-title">{selectedCrane.name}</h3>

      {/* Operating Hours Card */}
      <div className="col-12 mb-4">
        <div className="card operating-hours-card">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-3 text-center">
                <div className="hours-icon">
                  <i className="bi bi-clock-history"></i>
                </div>
              </div>
              <div className="col-md-9">
                <h5 className="card-title">Total Operating Hours</h5>
                <div className="hours-display">{formatOperatingHours(operatingHours)}</div>
                <div className="progress mt-2">
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: `${Math.min(100, (operatingHours / 1000) * 100)}%` }}
                    aria-valuenow={operatingHours}
                    aria-valuemin="0"
                    aria-valuemax="1000"
                  ></div>
                </div>
                <p className="text-muted mt-2">
                  <small>Last maintenance: {formatTimestamp(lastUpdated)}</small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Cards */}
      {selectedCrane.equipment.map((equipment) => {
        // Check if any sensors for this equipment have alerts
        let equipmentStatus = "normal"
        equipment.sensors.forEach((sensor) => {
          const dataKey = sensorToDataKey[sensor]
          const value = sensorData[dataKey]
          const status = checkAlertStatus(sensor, value)

          if (status === "fault") {
            equipmentStatus = "fault"
          } else if (status === "warning" && equipmentStatus !== "fault") {
            equipmentStatus = "warning"
          }
        })

        const statusTextClass = getStatusTextColor(equipmentStatus)

        return (
          <div key={equipment.id} className="col-md-4 mb-4">
            <div className={`card h-100 shadow hover-card`} onClick={() => handleEquipmentSelect(equipment)}>
              <div className={`status-indicator ${equipmentStatus}`}>{getStatusIcon(equipmentStatus)}</div>
              <div className="card-body">
                <h5 className="card-title">{equipment.name}</h5>
                <p className="card-text">
                  <i className="bi bi-cpu me-2"></i>
                  {equipment.sensors.length} sensors available
                </p>
                <div className={`equipment-status ${statusTextClass}`}>
                  Status: {equipmentStatus.charAt(0).toUpperCase() + equipmentStatus.slice(1)}
                </div>
                <ul className="list-group list-group-flush mt-3">
                  {equipment.sensors.map((sensor, idx) => {
                    const dataKey = sensorToDataKey[sensor]
                    const value = sensorData[dataKey]
                    const sensorStatus = checkAlertStatus(sensor, value)
                    const sensorStatusClass = getStatusTextColor(sensorStatus)

                    return (
                      <li key={idx} className="list-group-item bg-transparent border-0 ps-0 py-1">
                        <span className={sensorStatusClass}>
                          {sensorIcons[sensor]} {sensor}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  // Render sensors view
  const renderSensors = () => (
    <div className="row">
      <h3 className="text-center mb-4 dashboard-title">
        {selectedCrane.name} - {selectedEquipment.name}
      </h3>

      {selectedEquipment.sensors.map((sensor, idx) => {
        const dataKey = sensorToDataKey[sensor]
        const value = sensorData[dataKey] || 0
        const status = checkAlertStatus(sensor, value)
        const statusTextClass = getStatusTextColor(status)

        return (
          <div key={idx} className="col-md-6 mb-4">
            <div className={`card h-100 shadow hover-card`} onClick={() => handleSensorSelect(sensor)}>
              <div className={`status-indicator ${status}`}>{getStatusIcon(status)}</div>
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="sensor-icon me-3">{sensorIcons[sensor]}</div>
                  <h5 className="card-title mb-0">{sensor}</h5>
                </div>

                <div className="sensor-value">
                  {value.toFixed(1)} <span className="sensor-unit">{sensorUnits[sensor]}</span>
                </div>

                <div className={`sensor-status ${statusTextClass} mb-3`}>
                  Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>

                <div className="progress mt-3 custom-progress">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${Math.min(100, (value / (alertThresholds[sensor]?.fault || 100)) * 100)}%`,
                      backgroundColor: sensorColors[sensor],
                    }}
                    aria-valuenow={value}
                    aria-valuemin="0"
                    aria-valuemax={alertThresholds[sensor]?.fault || 100}
                  ></div>
                </div>

                <div className="threshold-markers">
                  <div
                    className="threshold warning"
                    style={{
                      left: `${(alertThresholds[sensor]?.warning / (alertThresholds[sensor]?.fault || 100)) * 100}%`,
                    }}
                  ></div>
                  <div
                    className="threshold fault"
                    style={{
                      left: "100%",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  // Render sensor details view with chart
  const renderSensorDetails = () => {
    const dataKey = sensorToDataKey[selectedSensor]
    const value = sensorData[dataKey] || 0
    const status = checkAlertStatus(selectedSensor, value)
    const statusTextClass = getStatusTextColor(status)

    return (
      <div className="row">
        <h3 className="text-center mb-4 dashboard-title">
          {selectedCrane.name} - {selectedEquipment.name} - {selectedSensor}
        </h3>

        <div className="col-md-8">
          <div className={`card shadow`}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                {sensorIcons[selectedSensor]} {selectedSensor} ({sensorUnits[selectedSensor]})
              </h5>
              <div className={`sensor-status-badge ${statusTextClass} ${status}`}>{status.toUpperCase()}</div>
            </div>
            <div className="card-body chart-container">
              <Line
                data={generateChartData(selectedSensor)}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: "rgba(0,0,0,0.7)",
                      titleFont: {
                        size: 14,
                      },
                      bodyFont: {
                        size: 14,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(200, 200, 200, 0.2)",
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="row">
            <div className="col-12 mb-4">
              <div className={`card shadow current-value-card`}>
                <div className={`card-header ${status}`}>
                  <h6 className="text-uppercase mb-0 text-white">Current Value</h6>
                </div>
                <div className="card-body text-center">
                  <div className="current-value">
                    {value.toFixed(1)}
                    <span className="unit">{sensorUnits[selectedSensor]}</span>
                  </div>
                  <div className={`status-text ${statusTextClass}`}>{status.toUpperCase()}</div>
                </div>
              </div>
            </div>

            <div className="col-12 mb-4">
              <div className="card shadow">
                <div className="card-header bg-dark text-white">
                  <h6 className="text-uppercase mb-0">Thresholds</h6>
                </div>
                <div className="card-body">
                  <div className="threshold-item d-flex justify-content-between align-items-center mb-2">
                    <span className="threshold-label">Warning</span>
                    <span className="threshold-value text-warning">
                      {alertThresholds[selectedSensor]?.warning || "N/A"} {sensorUnits[selectedSensor]}
                    </span>
                  </div>
                  <div className="threshold-item d-flex justify-content-between align-items-center">
                    <span className="threshold-label">Fault</span>
                    <span className="threshold-value text-danger">
                      {alertThresholds[selectedSensor]?.fault || "N/A"} {sensorUnits[selectedSensor]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card shadow">
                <div className="card-header bg-dark text-white">
                  <h6 className="text-uppercase mb-0">Operating Info</h6>
                </div>
                <div className="card-body">
                  <div className="info-item d-flex justify-content-between align-items-center mb-2">
                    <span className="info-label">Operating Hours</span>
                    <span className="info-value">{formatOperatingHours(operatingHours)}</span>
                  </div>
                  <div className="info-item d-flex justify-content-between align-items-center">
                    <span className="info-label">Last Updated</span>
                    <span className="info-value small">{formatTimestamp(lastUpdated)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="col-12 mt-4">
            <div className="card shadow">
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Alerts & Troubleshooting
                </h5>
              </div>
              <div className="card-body">
                {alerts.map((alert, index) => (
                  <div key={index} className="alert alert-danger">
                    <strong>{alert.alert}</strong> <br />
                    <i className="bi bi-lightbulb me-2"></i>
                    {alert.suggestion}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render navigation footer
  const renderNavigationFooter = () => {
    if (view === "cranes") return null

    return (
      <footer className="navigation-footer">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <button className="btn btn-nav" onClick={handleBack}>
                  <i className="bi bi-arrow-left me-2"></i>
                  {view === "equipment" && "Back to Cranes"}
                  {view === "sensors" && "Back to Equipment"}
                  {view === "details" && "Back to Sensors"}
                </button>

                <div className="breadcrumb-nav">
                  <span
                    className={view === "cranes" ? "active" : ""}
                    onClick={() => view !== "cranes" && setView("cranes")}
                  >
                    Cranes
                  </span>
                  {selectedCrane && (
                    <>
                      <i className="bi bi-chevron-right mx-2"></i>
                      <span
                        className={view === "equipment" ? "active" : ""}
                        onClick={() => view !== "equipment" && selectedCrane && setView("equipment")}
                      >
                        Equipment
                      </span>
                    </>
                  )}
                  {selectedEquipment && (
                    <>
                      <i className="bi bi-chevron-right mx-2"></i>
                      <span
                        className={view === "sensors" ? "active" : ""}
                        onClick={() => view !== "sensors" && selectedEquipment && setView("sensors")}
                      >
                        Sensors
                      </span>
                    </>
                  )}
                  {selectedSensor && (
                    <>
                      <i className="bi bi-chevron-right mx-2"></i>
                      <span className="active">{selectedSensor}</span>
                    </>
                  )}
                </div>

                <div className="nav-actions">
                  {/* Predictive maintenance button removed as it's now in the sidebar */}
                </div>

                <div className="timestamp">
                  <i className="bi bi-clock me-2"></i>
                  {formatTimestamp(lastUpdated)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  // Main render function
  // Replace the existing return statement with this updated version that includes a sidebar
  return (
    <div className="dashboard-container">
      <div className="dashboard-header mb-4">
        <h2 className="text-center dashboard-title">
          <i className="bi bi-graph-up me-2"></i>
          {activeView === "dashboard"
            ? "Industrial Crane Monitoring Dashboard"
            : activeView === "predictive"
              ? "Predictive Maintenance Dashboard"
              : "Alerts Dashboard"}
        </h2>
        <div className="dashboard-subtitle text-center">
          {activeView === "dashboard"
            ? "Real-time sensor data monitoring and analysis"
            : activeView === "predictive"
              ? "AI-powered anomaly detection and early fault prediction"
              : "Overview of system alerts and recommendations"}
        </div>
      </div>

      <div className="content-container">
        {activeView === "dashboard" ? (
          <>
            {view === "cranes" && renderCranes()}
            {view === "equipment" && selectedCrane && renderEquipment()}
            {view === "sensors" && selectedCrane && selectedEquipment && renderSensors()}
            {view === "details" && selectedCrane && selectedEquipment && selectedSensor && renderSensorDetails()}
          </>
        ) : activeView === "predictive" ? (
          <PredictiveMaintenance
            sensorData={sensorData}
            history={history}
            alerts={alerts.concat(trendAlerts)}
            operatingHours={operatingHours}
            lastUpdated={lastUpdated}
            selectedCrane={selectedCrane}
            cranesData={cranesData}
          />
        ) : (
          <Alerts
            sensorData={sensorData}
            alerts={alerts.concat(trendAlerts)}
            history={history}
            operatingHours={operatingHours}
            lastUpdated={lastUpdated}
            cranesData={cranesData}
            stats={{
              critical: alerts.filter(
                (a) => a && a.severity && a.severity.toLowerCase() === "critical" && a.status !== "Resolved",
              ).length,
              warning: alerts.filter(
                (a) => a && a.severity && a.severity.toLowerCase() === "warning" && a.status !== "Resolved",
              ).length,
              maintenance: alerts.filter(
                (a) => a && a.severity && a.severity.toLowerCase() === "maintenance" && a.status !== "Resolved",
              ).length,
              info: alerts.filter(
                (a) => a && a.severity && a.severity.toLowerCase() === "info" && a.status !== "Resolved",
              ).length,
            }}
          />
        )}
      </div>

      {activeView === "dashboard" && renderNavigationFooter()}

      {/* Add CSS for styling */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css');
        
        :root {
          --primary-color: #2c3e50;
          --secondary-color: #34495e;
          --accent-color: #3498db;
          --success-color: #2ecc71;
          --warning-color: #f39c12;
          --danger-color: #e74c3c;
          --light-color: #ecf0f1;
          --dark-color: #2c3e50;
          --bg-color: #f0f2f5;
        }
        
        body {
          background-color: var(--bg-color);
          font-family: 'Roboto', sans-serif;
          margin: 0;
          padding: 0;
        }
        
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          flex: 1;
        }
        
        .content-container {
          margin-bottom: 80px; /* Space for footer */
        }
        
        .dashboard-header {
          position: relative;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        
        .dashboard-title {
          font-weight: 700;
          color: var(--primary-color);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .dashboard-subtitle {
          color: var(--secondary-color);
          font-size: 1.1rem;
          margin-top: 5px;
        }
        
        /* Rest of your existing CSS */
        .hover-card {
          transition: all 0.3s ease;
          cursor: pointer;
          overflow: hidden;
          border-radius: 12px;
          position: relative;
          border: none;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important;
        }
        
        .crane-card {
          height: 100%;
        }
        
        /* Enhanced card styles */
        .enhanced-card {
          min-height: 550px;
        }
        
        .card-description {
          color: #666;
          margin-bottom: 15px;
          font-size: 0.9rem;
        }
        
        .crane-specs {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 15px;
        }
        
        .spec-item {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          color: #555;
        }
        
        .alert-summary {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        
        .alert-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .alert-badge.fault {
          background-color: rgba(231, 76, 60, 0.15);
          color: var(--danger-color);
        }
        
        .alert-badge.warning {
          background-color: rgba(243, 156, 18, 0.15);
          color: var(--warning-color);
        }
        
        .alert-badge.normal {
          background-color: rgba(46, 204, 113, 0.15);
          color: var(--success-color);
        }
        
        .card-img-container {
          height: 240px;
          overflow: hidden;
          position: relative;
          background-color: #f8f9fa;
        }
        
        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.5s ease;
        }
        
        .hover-card:hover .card-img {
          transform: scale(1.05);
        }
        
        .status-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.15;
          transition: opacity 0.3s ease;
        }
        
        .status-overlay.normal {
          background-color: var(--success-color);
        }
        
        .status-overlay.warning {
          background-color: var(--warning-color);
        }
        
        .status-overlay.fault {
          background-color: var(--danger-color);
        }
        
        .hover-card:hover .status-overlay {
          opacity: 0.25;
        }
        
        .status-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          background-color: white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          z-index: 10;
        }
        
        .card-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--dark-color);
        }
        
        .card-text {
          color: var(--secondary-color);
        }
        
        .status-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          z-index: 10;
          background-color: white;
        }
        
        .status-indicator.normal {
          border: 2px solid var(--success-color);
        }
        
        .status-indicator.warning {
          border: 2px solid var(--warning-color);
        }
        
        .status-indicator.fault {
          border: 2px solid var(--danger-color);
        }
        
        .operating-hours-card {
          background: linear-gradient(135deg, #3498db, #2c3e50);
          color: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .hours-icon {
          font-size: 3rem;
          background-color: rgba(255,255,255,0.2);
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        
        .hours-display {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 10px 0;
        }
        
        .progress {
          height: 10px;
          border-radius: 5px;
          background-color: rgba(255,255,255,0.2);
        }
        
        .progress-bar {
          border-radius: 5px;
        }
        
        .custom-progress {
          height: 15px;
          border-radius: 7.5px;
          background-color: rgba(0,0,0,0.05);
          position: relative;
        }
        
        .threshold-markers {
          position: relative;
          height: 20px;
        }
        
        .threshold {
          position: absolute;
          top: -8px;
          width: 2px;
          height: 20px;
        }
        
        .threshold.warning {
          background-color: var(--warning-color);
        }
        
        .threshold.fault {
          background-color: var(--danger-color);
        }
        
        .sensor-icon {
          font-size: 2rem;
          background-color: rgba(0,0,0,0.05);
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .sensor-value {
          font-size: 2rem;
          font-weight: 700;
          margin: 10px 0;
        }
        
        .sensor-unit {
          font-size: 1rem;
          font-weight: 400;
          color: #6c757d;
        }
        
        .sensor-status {
          font-weight: 600;
        }
        
        .chart-container {
          height: 400px;
          position: relative;
        }
        
        .current-value-card {
          border-radius: 10px;
          overflow: hidden;
        }
        
        .current-value-card .card-header {
          padding: 10px;
          text-align: center;
        }
        
        .current-value-card .card-header.normal {
          background-color: var(--success-color);
        }
        
        .current-value-card .card-header.warning {
          background-color: var(--warning-color);
        }
        
        .current-value-card .card-header.fault {
          background-color: var(--danger-color);
        }
        
        .current-value {
          font-size: 3rem;
          font-weight: 700;
          margin: 10px 0;
          position: relative;
        }
        
        .current-value .unit {
          font-size: 1rem;
          font-weight: 400;
          position: absolute;
          top: 5px;
          margin-left: 5px;
        }
        
        .status-text {
          font-weight: 700;
          font-size: 1.2rem;
          letter-spacing: 1px;
        }
        
        .sensor-status-badge {
          padding: 5px 10px;
          border-radius: 5px;
          font-weight: 600;
          letter-spacing: 1px;
        }
        
        .sensor-status-badge.normal {
          background-color: rgba(46, 204, 113, 0.15);
        }
        
        .sensor-status-badge.warning {
          background-color: rgba(243, 156, 18, 0.15);
        }
        
        .sensor-status-badge.fault {
          background-color: rgba(231, 76, 60, 0.15);
        }
        
        .equipment-status {
          margin-top: 10px;
          font-weight: 600;
        }
        
        .navigation-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #2c3e50, #34495e);
          color: white;
          padding: 15px 0;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
        }
        
        .btn-nav {
          background-color: rgba(255,255,255,0.1);
          color: white;
          border: none;
          border-radius: 20px;
          padding: 8px 15px;
          transition: all 0.3s ease;
        }
        
        .btn-nav:hover {
          background-color: rgba(255,255,255,0.2);
          color: white;
        }
        
        .breadcrumb-nav {
          display: flex;
          align-items: center;
        }
        
        .breadcrumb-nav span {
          cursor: pointer;
          opacity: 0.7;
          transition: all 0.3s ease;
        }
        
        .breadcrumb-nav span:hover {
          opacity: 1;
        }
        
        .breadcrumb-nav span.active {
          opacity: 1;
          font-weight: 600;
        }
        
        .timestamp {
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .bg-success-subtle {
          background-color: rgba(46, 204, 113, 0.15);
        }
        
        .bg-warning-subtle {
          background-color: rgba(243, 156, 18, 0.15);
        }
        
        .bg-danger-subtle {
          background-color: rgba(231, 76, 60, 0.15);
        }
        
        .text-success {
          color: var(--success-color) !important;
        }
        
        .text-warning {
          color: var(--warning-color) !important;
        }
        
        .text-danger {
          color: var(--danger-color) !important;
        }
        
        .nav-actions {
          display: flex;
          gap: 10px;
        }

        @media (max-width: 768px) {
          .nav-actions {
            margin-top: 10px;
            width: 100%;
          }

          .nav-actions .btn {
            width: 100%;
          }
        }
      `,
        }}
      />
    </div>
  )
}

export default Dashboard

