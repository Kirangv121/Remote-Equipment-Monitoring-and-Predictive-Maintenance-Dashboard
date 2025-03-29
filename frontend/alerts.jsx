"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import "bootstrap/dist/css/bootstrap.min.css"
import { mockAlerts } from "./mockData"

// Remove MSW imports and replace with a simple mock function
const mockFetch = (url, options = {}) => {
  console.log("Mock fetch called:", url)
  // Return mock data based on the URL
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: [] }),
    text: () => Promise.resolve(""),
  })
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

// Crane data structure with equipment parts and sensors
const cranesData = [
  {
    id: 1,
    name: "XCMG Truck Crane (Mobile Crane)",
    code: "C-001",
    description: "High-performance mobile crane with telescopic boom and advanced hydraulic system",
    capacity: "25 tons",
    year: "2021",
    image:
      "https://sjc.microlink.io/M4XbNEX7KG82cFstuOqOSd3KTedQeDBp3AVHL6lJ3wLOOvUm9XwpWegPPiIOE-6WlZIdZH30mrk0eEU3PIKFzA.jpeg",
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
    code: "C-002",
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
    code: "C-003",
    description: "Rugged all-terrain crane designed for challenging work environments",
    capacity: "80 tons",
    year: "2022",
    image: "https://www.wppecrane.com/wp-content/uploads/2020/08/GRT880-COB.png",
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
    code: "C-004",
    description: "Heavy-duty crawler crane with exceptional stability and lifting power",
    capacity: "100 tons",
    year: "2019",
    image: "https://images.amain.com/cdn-cgi/image/f=auto,width=475/images/large/leg/leg42146.jpg",
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

// API configuration - using real API by default
const API_CONFIG = {
  url: "http://localhost:5000/get-sensor",
  timeout: 5000,
}

const Alerts = ({
  sensorData = {},
  alerts: externalAlerts = [],
  history = [],
  operatingHours = 0,
  lastUpdated = "",
  cranesData = [],
  stats: externalStats = null,
}) => {
  const [alerts, setAlerts] = useState(mockAlerts)
  const [trendAlerts, setTrendAlerts] = useState([])
  const [stats, setStats] = useState({
    critical: 0,
    warning: 0,
    maintenance: 0,
    info: 0,
  })
  const [filters, setFilters] = useState({
    severity: "All Severity",
    type: "All Types",
    status: "All Status",
    crane: "All Cranes",
    date: "",
    search: "",
  })
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    push: true,
    desktop: true,
  })
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [alertConfig, setAlertConfig] = useState({
    "Load Sensor": { warning: 6, fault: 8, enabled: true },
    "Vibration Sensor": { warning: 500, fault: 700, enabled: true },
    "Temperature Sensor": { warning: 35, fault: 40, enabled: true },
    "Power Sensor": { warning: 12, fault: 15, enabled: true },
    "Ultrasonic Sensor": { warning: 15, fault: 10, enabled: true },
    "Sound Sensor": { warning: 40, fault: 50, enabled: true },
    "Fuel Sensor": { warning: 20, fault: 10, enabled: true },
  })
  const [isLoading, setIsLoading] = useState(true)

  const updateStats = useCallback((alertsList) => {
    if (!alertsList || !Array.isArray(alertsList)) return

    const newStats = {
      critical: 0,
      warning: 0,
      maintenance: 0,
      info: 0,
    }

    alertsList.forEach((alert) => {
      if (!alert) return

      // Only count alerts that are not resolved
      if (alert.status !== "Resolved") {
        // Handle case insensitive severity matching
        const severity = alert.severity ? alert.severity.toLowerCase() : ""

        if (severity === "critical") newStats.critical++
        else if (severity === "warning") newStats.warning++
        else if (severity === "maintenance") newStats.maintenance++
        else if (severity === "info") newStats.info++
      }
    })

    // Debug log to verify counts
    console.log("Updated alert stats:", newStats)

    setStats(newStats)
  }, [])

  // Use external alerts if provided, otherwise generate them
  useEffect(() => {
    let generatedAlerts = []
    let newTrendAlerts = []

    if (externalAlerts && externalAlerts.length > 0) {
      setAlerts(externalAlerts)

      // Always update stats from external alerts to ensure synchronization
      updateStats(externalAlerts)
      setIsLoading(false)
    } else {
      // Generate alerts based on sensor data if no external alerts
      generatedAlerts = generateAlerts(sensorData)
      newTrendAlerts = detectTrends(sensorData, history)

      setAlerts([...generatedAlerts, ...newTrendAlerts])
      setTrendAlerts(newTrendAlerts)

      // Update stats
      updateStats([...generatedAlerts, ...newTrendAlerts])
      setIsLoading(false)
    }
    logAlertCounts(externalAlerts || [...generatedAlerts, ...newTrendAlerts], "Processed alerts")
  }, [externalAlerts, sensorData, history, updateStats])

  // Use external stats if provided, but ensure they're properly synchronized
  useEffect(() => {
    if (externalStats) {
      // Merge with current stats to ensure all values are updated
      setStats((prevStats) => ({
        ...prevStats,
        ...externalStats,
      }))
    } else if (alerts.length > 0) {
      // If no external stats but we have alerts, make sure stats are updated
      updateStats(alerts)
    }
  }, [externalStats, alerts, updateStats])

  // Fetch sensor data every 5 seconds if no external data is provided
  useEffect(() => {
    // If we have external data, don't fetch
    if (externalAlerts && externalAlerts.length > 0) {
      return
    }

    const fetchData = async () => {
      try {
        // Fetch from real API
        const response = await axios
          .get(API_CONFIG.url, {
            timeout: API_CONFIG.timeout,
          })
          .catch((error) => {
            console.error("API fetch error:", error)
            // Generate mock data if API fails
            return {
              data: {
                sensorData: {
                  temperature: Math.random() * 40 + 10, // 10-50°C
                  weight: Math.random() * 10, // 0-10kg
                  distance: Math.random() * 30 + 5, // 5-35cm
                  voltage: Math.random() * 15 + 5, // 5-20V
                  soundLevel: Math.random() * 60 + 10, // 10-70dB
                  vibration: Math.random() * 800 + 100, // 100-900Hz
                  fuel: Math.random() * 100, // 0-100L
                  totalOperatingHours: operatingHours + 0.01, // Increment slightly
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

        // Ensure all expected sensor keys exist
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

        // Generate alerts based on sensor data
        const generatedAlerts = generateAlerts(safeSensorData)
        const newTrendAlerts = detectTrends(safeSensorData, history)

        // Combine API alerts with generated alerts
        const combinedAlerts = [...alertsData, ...generatedAlerts, ...newTrendAlerts]
        setAlerts(combinedAlerts)
        setTrendAlerts(newTrendAlerts)

        // Update stats
        updateStats(combinedAlerts)
        setIsLoading(false)
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

        // Generate alerts based on mock data
        const generatedAlerts = generateAlerts(mockData)
        const newTrendAlerts = detectTrends(mockData, history)

        // Combine generated alerts with trend alerts
        const combinedAlerts = [...generatedAlerts, ...newTrendAlerts]
        setAlerts(combinedAlerts)
        setTrendAlerts(newTrendAlerts)

        // Update stats
        updateStats(combinedAlerts)
        setIsLoading(false)
      }
    }

    fetchData() // Initial fetch
    const interval = setInterval(fetchData, 5000) // Fetch every 5 seconds

    return () => clearInterval(interval) // Cleanup
  }, [history, operatingHours, updateStats, externalAlerts])

  // Generate alerts based on sensor data
  const generateAlerts = (data) => {
    const generatedAlerts = []
    const now = new Date()
    const timeString = now.toLocaleTimeString()
    const dateString = now.toLocaleDateString()

    // Check each sensor against thresholds
    if (data.temperature > alertThresholds["Temperature Sensor"].fault && alertConfig["Temperature Sensor"].enabled) {
      generatedAlerts.push({
        id: `TEMP-${Date.now()}`,
        time: timeString,
        date: dateString,
        craneId: "C-001",
        craneName: "XCMG Truck Crane",
        type: "Temperature",
        severity: "Critical",
        message: "Temperature exceeds critical threshold",
        details: `Current temperature: ${data.temperature.toFixed(1)}°C, Threshold: ${
          alertThresholds["Temperature Sensor"].fault
        }°C`,
        status: "New",
        timestamp: now.toISOString(),
        value: data.temperature,
        threshold: alertThresholds["Temperature Sensor"].fault,
        equipment: "Hydraulic System",
        sensor: "Temperature Sensor",
        recommendation: "Shut down system and check cooling system immediately",
      })
    } else if (
      data.temperature > alertThresholds["Temperature Sensor"].warning &&
      alertConfig["Temperature Sensor"].enabled
    ) {
      generatedAlerts.push({
        id: `TEMP-${Date.now()}`,
        time: timeString,
        date: dateString,
        craneId: "C-001",
        craneName: "XCMG Truck Crane",
        type: "Temperature",
        severity: "Warning",
        message: "Temperature approaching critical level",
        details: `Current temperature: ${data.temperature.toFixed(1)}°C, Threshold: ${
          alertThresholds["Temperature Sensor"].warning
        }°C`,
        status: "New",
        timestamp: now.toISOString(),
        value: data.temperature,
        threshold: alertThresholds["Temperature Sensor"].warning,
        equipment: "Hydraulic System",
        sensor: "Temperature Sensor",
        recommendation: "Check cooling system and reduce load",
      })
    }

    if (data.vibration > alertThresholds["Vibration Sensor"].fault && alertConfig["Vibration Sensor"].enabled) {
      generatedAlerts.push({
        id: `VIB-${Date.now()}`,
        time: timeString,
        date: dateString,
        craneId: "C-002",
        craneName: "POTAIN Tower Crane",
        type: "Vibration",
        severity: "Critical",
        message: "Excessive vibration detected",
        details: `Current vibration: ${data.vibration.toFixed(1)}Hz, Threshold: ${
          alertThresholds["Vibration Sensor"].fault
        }Hz`,
        status: "New",
        timestamp: now.toISOString(),
        value: data.vibration,
        threshold: alertThresholds["Vibration Sensor"].fault,
        equipment: "Mast (Tower)",
        sensor: "Vibration Sensor",
        recommendation: "Stop operation immediately and inspect for structural issues",
      })
    }

    if (data.weight > alertThresholds["Load Sensor"].fault && alertConfig["Load Sensor"].enabled) {
      generatedAlerts.push({
        id: `LOAD-${Date.now()}`,
        time: timeString,
        date: dateString,
        craneId: "C-003",
        craneName: "GROVE Rough Terrain Crane",
        type: "Load",
        severity: "Critical",
        message: "Load exceeds maximum capacity",
        details: `Current load: ${data.weight.toFixed(1)}kg, Threshold: ${alertThresholds["Load Sensor"].fault}kg`,
        status: "New",
        timestamp: now.toISOString(),
        value: data.weight,
        threshold: alertThresholds["Load Sensor"].fault,
        equipment: "Boom",
        sensor: "Load Sensor",
        recommendation: "Reduce load immediately to prevent structural damage",
      })
    }

    if (data.fuel < alertThresholds["Fuel Sensor"].fault && alertConfig["Fuel Sensor"].enabled) {
      generatedAlerts.push({
        id: `FUEL-${Date.now()}`,
        time: timeString,
        date: dateString,
        craneId: "C-004",
        craneName: "Liebherr Crawler Crane",
        type: "Fuel",
        severity: "Warning",
        message: "Fuel level critically low",
        details: `Current fuel: ${data.fuel.toFixed(1)}L, Threshold: ${alertThresholds["Fuel Sensor"].fault}L`,
        status: "New",
        timestamp: now.toISOString(),
        value: data.fuel,
        threshold: alertThresholds["Fuel Sensor"].fault,
        equipment: "Fuel System",
        sensor: "Fuel Sensor",
        recommendation: "Refuel immediately to prevent system shutdown",
      })
    }

    // Add maintenance alerts based on operating hours
    if (operatingHours > 500 && operatingHours < 510) {
      generatedAlerts.push({
        id: `MAINT-${Date.now()}`,
        time: timeString,
        date: dateString,
        craneId: "C-001",
        craneName: "XCMG Truck Crane",
        type: "Maintenance",
        severity: "Maintenance",
        message: "Scheduled maintenance required",
        details: `Current operating hours: ${operatingHours.toFixed(1)}, Maintenance interval: 500 hours`,
        status: "New",
        timestamp: now.toISOString(),
        value: operatingHours,
        threshold: 500,
        equipment: "All Systems",
        sensor: "System",
        recommendation: "Schedule 500-hour maintenance check",
      })
    }

    return generatedAlerts
  }

  // Detect trends in sensor data to predict potential failures
  const detectTrends = (newData, history) => {
    if (history.length < 5) return [] // Need at least 5 data points for trend analysis

    const newTrendAlerts = []
    const now = new Date()
    const timeString = now.toLocaleTimeString()
    const dateString = now.toLocaleDateString()

    // Check for increasing trends (temperature, vibration, sound, load, power)
    const increasingParams = [
      {
        key: "temperature",
        name: "Temperature",
        threshold: 0.5,
        unit: "°C",
        craneId: "C-001",
        craneName: "XCMG Truck Crane",
        equipment: "Hydraulic System",
        sensor: "Temperature Sensor",
      },
      {
        key: "vibration",
        name: "Vibration",
        threshold: 20,
        unit: "Hz",
        craneId: "C-002",
        craneName: "POTAIN Tower Crane",
        equipment: "Mast (Tower)",
        sensor: "Vibration Sensor",
      },
      {
        key: "soundLevel",
        name: "Sound Level",
        threshold: 2,
        unit: "dB",
        craneId: "C-004",
        craneName: "Liebherr Crawler Crane",
        equipment: "Operator Cabin",
        sensor: "Sound Sensor",
      },
      {
        key: "weight",
        name: "Load",
        threshold: 0.2,
        unit: "kg",
        craneId: "C-003",
        craneName: "GROVE Rough Terrain Crane",
        equipment: "Boom",
        sensor: "Load Sensor",
      },
      {
        key: "voltage",
        name: "Power",
        threshold: 0.3,
        unit: "V",
        craneId: "C-001",
        craneName: "XCMG Truck Crane",
        equipment: "Hydraulic System",
        sensor: "Power Sensor",
      },
    ]

    // Check for decreasing trends (fuel, distance)
    const decreasingParams = [
      {
        key: "fuel",
        name: "Fuel Level",
        threshold: -0.5,
        unit: "L",
        craneId: "C-004",
        craneName: "Liebherr Crawler Crane",
        equipment: "Fuel System",
        sensor: "Fuel Sensor",
      },
      {
        key: "distance",
        name: "Distance",
        threshold: -0.5,
        unit: "cm",
        craneId: "C-003",
        craneName: "GROVE Rough Terrain Crane",
        equipment: "Chassis & Suspension",
        sensor: "Ultrasonic Sensor",
      },
    ]

    // Calculate trends for increasing parameters
    increasingParams.forEach((param) => {
      if (!alertConfig[param.sensor]?.enabled) return

      const recentValues = history.slice(-5).map((h) => h[param.key])
      const trend = calculateTrend(recentValues)

      if (trend > param.threshold) {
        newTrendAlerts.push({
          id: `TREND-${param.key}-${Date.now()}`,
          time: timeString,
          date: dateString,
          craneId: param.craneId,
          craneName: param.craneName,
          type: "Trend",
          severity: trend > param.threshold * 2 ? "Warning" : "Info",
          message: `${param.name} increasing trend detected`,
          details: `${param.name} is increasing at a rate of ${trend.toFixed(2)} ${param.unit} per reading`,
          status: "New",
          timestamp: now.toISOString(),
          value: newData[param.key],
          threshold: param.threshold,
          equipment: param.equipment,
          sensor: param.sensor,
          trend: trend.toFixed(2),
          direction: "increasing",
          recommendation: `Monitor ${param.name.toLowerCase()} system for potential issues`,
        })
      }
    })

    // Calculate trends for decreasing parameters
    decreasingParams.forEach((param) => {
      if (!alertConfig[param.sensor]?.enabled) return

      const recentValues = history.slice(-5).map((h) => h[param.key])
      const trend = calculateTrend(recentValues)

      if (trend < param.threshold) {
        newTrendAlerts.push({
          id: `TREND-${param.key}-${Date.now()}`,
          time: timeString,
          date: dateString,
          craneId: param.craneId,
          craneName: param.craneName,
          type: "Trend",
          severity: trend < param.threshold * 2 ? "Warning" : "Info",
          message: `${param.name} decreasing trend detected`,
          details: `${param.name} is decreasing at a rate of ${Math.abs(trend).toFixed(2)} ${param.unit} per reading`,
          status: "New",
          timestamp: now.toISOString(),
          value: newData[param.key],
          threshold: param.threshold,
          equipment: param.equipment,
          sensor: param.sensor,
          trend: trend.toFixed(2),
          direction: "decreasing",
          recommendation: `Check ${param.name.toLowerCase()} system for potential issues`,
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
    const denominator2 = indices.reduce((sum, x) => sum + Math.pow(x - meanX, 2), 0)

    return denominator2 === 0 ? 0 : numerator / denominator2
  }

  // Handle alert acknowledgement
  const handleAcknowledge = (alertId) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) => (alert.id === alertId ? { ...alert, status: "Acknowledged" } : alert)),
    )
  }

  // Handle alert clearing
  const handleClear = (alertId) => {
    if (window.confirm("Are you sure you want to clear this alert?")) {
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) => (alert.id === alertId ? { ...alert, status: "Resolved" } : alert)),
      )
    }
  }

  // Handle clearing all alerts
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all alerts?")) {
      setAlerts((prevAlerts) => prevAlerts.map((alert) => ({ ...alert, status: "Resolved" })))
    }
  }

  // Handle viewing alert details
  const handleViewDetails = (alert) => {
    setSelectedAlert(alert)
    setShowDetailModal(true)
  }

  // Get severity color
  const getSeverityColor = (severity) => {
    if (!severity) return { bg: "#f7fafc", text: "#a0aec0" } // Default for undefined

    switch (severity.toLowerCase()) {
      case "critical":
        return { bg: "#fff5f5", text: "#f56565" }
      case "warning":
        return { bg: "#fffaf0", text: "#f6ad55" }
      case "maintenance":
        return { bg: "#ebf8ff", text: "#4299e1" }
      case "info":
        return { bg: "#f7fafc", text: "#a0aec0" }
      default:
        return { bg: "#f7fafc", text: "#a0aec0" }
    }
  }

  // Get severity icon
  const getSeverityIcon = (severity) => {
    if (!severity) return "ℹ️" // Default for undefined

    switch (severity.toLowerCase()) {
      case "critical":
        return "❗"
      case "warning":
        return "⚠️"
      case "maintenance":
        return "🔧"
      case "info":
        return "ℹ️"
      default:
        return "ℹ️"
    }
  }

  // Filter alerts based on current filters
  const filteredAlerts = alerts.filter((alert) => {
    if (!alert) return false // Skip undefined alerts

    // Filter by severity
    if (filters.severity !== "All Severity" && alert.severity !== filters.severity) return false

    // Filter by type
    if (filters.type !== "All Types" && alert.type !== filters.type) return false

    // Filter by status
    if (filters.status !== "All Status" && alert.status !== filters.status) return false

    // Filter by crane
    if (filters.crane !== "All Cranes" && alert.craneId !== filters.crane) return false

    // Filter by date
    if (filters.date && new Date(alert.timestamp).toLocaleDateString() !== new Date(filters.date).toLocaleDateString())
      return false

    // Filter by search
    if (
      filters.search &&
      !(
        (alert.message && alert.message.toLowerCase().includes(filters.search.toLowerCase())) ||
        (alert.details && alert.details.toLowerCase().includes(filters.search.toLowerCase())) ||
        (alert.craneName && alert.craneName.toLowerCase().includes(filters.search.toLowerCase())) ||
        (alert.equipment && alert.equipment.toLowerCase().includes(filters.search.toLowerCase())) ||
        (alert.sensor && alert.sensor.toLowerCase().includes(filters.search.toLowerCase()))
      )
    )
      return false

    return true
  })

  // Sort alerts by timestamp (newest first) and severity
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    // First sort by status (New > Acknowledged > Resolved)
    const statusOrder = { New: 0, Acknowledged: 1, Resolved: 2 }
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]
    if (statusDiff !== 0) return statusDiff

    // Then sort by severity (Critical > Warning > Maintenance > Info)
    const severityOrder = { Critical: 0, Warning: 1, Maintenance: 2, Info: 3 }
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
    if (severityDiff !== 0) return severityDiff

    // Finally sort by timestamp (newest first)
    return new Date(b.timestamp) - new Date(a.timestamp)
  })

  // Export alerts to CSV
  const exportAlerts = () => {
    const headers = [
      "ID",
      "Time",
      "Date",
      "Crane ID",
      "Crane Name",
      "Type",
      "Severity",
      "Message",
      "Details",
      "Status",
      "Equipment",
      "Sensor",
      "Value",
      "Threshold",
      "Recommendation",
    ]

    const csvContent =
      headers.join(",") +
      "\n" +
      filteredAlerts
        .map((alert) => {
          return [
            alert.id,
            alert.time,
            alert.date,
            alert.craneId,
            alert.craneName,
            alert.type,
            alert.severity,
            alert.message,
            alert.details,
            alert.status,
            alert.equipment,
            alert.sensor,
            alert.value,
            alert.threshold,
            alert.recommendation,
          ].join(",")
        })
        .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `crane_alerts_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="alerts-loading">
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
        <h3>Loading Alerts...</h3>
      </div>
    )
  }

  return (
    <div className="alerts-management">
      {/* Header */}
      <div className="alerts-header">
        <h1>
          <i className="bi bi-bell me-2"></i>
          Alerts Management
        </h1>
        <div className="alerts-actions">
          <button className="btn btn-primary" onClick={() => setShowConfigModal(true)}>
            <i className="bi bi-gear me-2"></i>
            Configure Alerts
          </button>
          <button className="btn btn-primary" onClick={() => setShowNotificationModal(true)}>
            <i className="bi bi-envelope me-2"></i>
            Notification Settings
          </button>
          <button className="btn btn-secondary" onClick={exportAlerts}>
            <i className="bi bi-download me-2"></i>
            Export Log
          </button>
          <button className="btn btn-danger" onClick={handleClearAll}>
            <i className="bi bi-trash me-2"></i>
            Clear All
          </button>
        </div>
      </div>

      {/* Alert Statistics */}

      <div className="alert-stats">
        <div className="stat-card critical">
          <div className="stat-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div className="stat-content">
            <h3>CRITICAL</h3>
            <div className="stat-value">{stats.critical || 0}</div>
            <div className="stat-change">
              {stats.critical > 0 ? (
                <span className="increase">
                  <i className="bi bi-arrow-up"></i> {stats.critical} active {stats.critical === 1 ? "alert" : "alerts"}
                </span>
              ) : (
                "No critical alerts"
              )}
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <i className="bi bi-exclamation-circle-fill"></i>
          </div>
          <div className="stat-content">
            <h3>WARNING</h3>
            <div className="stat-value">{stats.warning || 0}</div>
            <div className="stat-change">
              {stats.warning > 0 ? (
                <span className="increase">
                  <i className="bi bi-arrow-up"></i> {stats.warning} active {stats.warning === 1 ? "alert" : "alerts"}
                </span>
              ) : (
                "No warning alerts"
              )}
            </div>
          </div>
        </div>

        <div className="stat-card maintenance">
          <div className="stat-icon">
            <i className="bi bi-tools"></i>
          </div>
          <div className="stat-content">
            <h3>MAINTENANCE</h3>
            <div className="stat-value">{stats.maintenance || 0}</div>
            <div className="stat-change">
              {stats.maintenance > 0 ? (
                <span className="increase">
                  <i className="bi bi-arrow-up"></i> {stats.maintenance} scheduled
                </span>
              ) : (
                "No scheduled maintenance"
              )}
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <i className="bi bi-info-circle-fill"></i>
          </div>
          <div className="stat-content">
            <h3>INFO</h3>
            <div className="stat-value">{stats.info || 0}</div>
            <div className="stat-change">
              {stats.info > 0 ? (
                <span>
                  <i className="bi bi-bell"></i> {stats.info} notifications
                </span>
              ) : (
                "No notifications"
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="alerts-filters">
        <div className="filter-group">
          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            className="form-select"
          >
            <option>All Severity</option>
            <option>Critical</option>
            <option>Warning</option>
            <option>Maintenance</option>
            <option>Info</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="form-select"
          >
            <option>All Types</option>
            <option>Load</option>
            <option>Temperature</option>
            <option>Vibration</option>
            <option>Fuel</option>
            <option>Maintenance</option>
            <option>Trend</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="form-select"
          >
            <option>All Status</option>
            <option>New</option>
            <option>Acknowledged</option>
            <option>Resolved</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.crane}
            onChange={(e) => setFilters({ ...filters, crane: e.target.value })}
            className="form-select"
          >
            <option>All Cranes</option>
            <option>C-001</option>
            <option>C-002</option>
            <option>C-003</option>
            <option>C-004</option>
          </select>
        </div>

        <div className="filter-group">
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="form-control"
          />
        </div>

        <div className="filter-group search-group">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search alerts..."
            className="form-control"
          />
          <i className="bi bi-search search-icon"></i>
        </div>

        <div className="filter-group">
          <button
            onClick={() =>
              setFilters({
                severity: "All Severity",
                type: "All Types",
                status: "All Status",
                crane: "All Cranes",
                date: "",
                search: "",
              })
            }
            className="btn btn-outline-secondary"
          >
            <i className="bi bi-x-circle me-2"></i>
            Reset
          </button>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="alerts-table-container">
        <div className="alerts-count">
          Showing {sortedAlerts.length} of {alerts.length} alerts
        </div>
        <table className="alerts-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Alert ID</th>
              <th>Crane</th>
              <th>Equipment</th>
              <th>Sensor</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Message</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAlerts.length > 0 ? (
              sortedAlerts.map((alert) => (
                <tr key={alert.id} className={`alert-row ${alert.status ? alert.status.toLowerCase() : "unknown"}`}>
                  <td className="time-cell">
                    <div>{alert.time}</div>
                    <div className="date-subtext">{alert.date}</div>
                  </td>
                  <td>{alert.id}</td>
                  <td>
                    <div>{alert.craneName}</div>
                    <div className="subtext">{alert.craneId}</div>
                  </td>
                  <td>{alert.equipment}</td>
                  <td>
                    <span className="sensor-icon">{sensorIcons[alert.sensor] || "🔌"}</span>
                    {alert.sensor}
                  </td>
                  <td>{alert.type}</td>
                  <td>
                    <span
                      className={`severity-badge ${alert.severity ? alert.severity.toLowerCase() : "unknown"}`}
                      title={`${alert.severity || "Unknown"}: ${alert.message || "No message"}`}
                    >
                      {getSeverityIcon(alert.severity)} {alert.severity || "Unknown"}
                    </span>
                  </td>
                  <td className="message-cell">
                    <div>{alert.message}</div>
                    <div className="details-subtext">{alert.details}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${alert.status ? alert.status.toLowerCase() : "unknown"}`}>
                      {alert.status || "Unknown"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        title="View Details"
                        onClick={() => handleViewDetails(alert)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      {alert.status === "New" && (
                        <button
                          className="btn btn-sm btn-outline-success"
                          title="Acknowledge"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          <i className="bi bi-check-lg"></i>
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Clear"
                        onClick={() => handleClear(alert.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-alerts">
                  <i className="bi bi-check-circle-fill"></i>
                  <p>No alerts match your current filters</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Alert Detail Modal */}
      {showDetailModal && selectedAlert && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content alert-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <span
                  className={`severity-badge ${selectedAlert.severity ? selectedAlert.severity.toLowerCase() : "unknown"}`}
                >
                  {getSeverityIcon(selectedAlert.severity)} {selectedAlert.severity || "Unknown"}
                </span>
                Alert Details
              </h2>
              <button className="close-button" onClick={() => setShowDetailModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Alert ID</div>
                  <div className="detail-value">{selectedAlert.id}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Time</div>
                  <div className="detail-value">
                    {selectedAlert.time} on {selectedAlert.date}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Crane</div>
                  <div className="detail-value">
                    {selectedAlert.craneName} ({selectedAlert.craneId})
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Equipment</div>
                  <div className="detail-value">{selectedAlert.equipment}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Sensor</div>
                  <div className="detail-value">
                    <span className="sensor-icon">{sensorIcons[selectedAlert.sensor] || "🔌"}</span>
                    {selectedAlert.sensor}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Type</div>
                  <div className="detail-value">{selectedAlert.type}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Status</div>
                  <div className="detail-value">
                    <span
                      className={`status-badge ${selectedAlert.status ? selectedAlert.status.toLowerCase() : "unknown"}`}
                    >
                      {selectedAlert.status || "Unknown"}
                    </span>
                  </div>
                </div>
                <div className="detail-item full-width">
                  <div className="detail-label">Message</div>
                  <div className="detail-value">{selectedAlert.message}</div>
                </div>
                <div className="detail-item full-width">
                  <div className="detail-label">Details</div>
                  <div className="detail-value">{selectedAlert.details}</div>
                </div>
                {selectedAlert.trend && (
                  <div className="detail-item">
                    <div className="detail-label">Trend</div>
                    <div className="detail-value">
                      <span
                        className={`trend-indicator ${
                          selectedAlert.direction === "increasing" ? "increasing" : "decreasing"
                        }`}
                      >
                        <i
                          className={`bi bi-arrow-${selectedAlert.direction === "increasing" ? "up" : "down"}-right`}
                        ></i>
                        {selectedAlert.trend} per reading
                      </span>
                    </div>
                  </div>
                )}
                <div className="detail-item">
                  <div className="detail-label">Current Value</div>
                  <div className="detail-value">{selectedAlert.value}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Threshold</div>
                  <div className="detail-value">{selectedAlert.threshold}</div>
                </div>
                <div className="detail-item full-width">
                  <div className="detail-label">Recommendation</div>
                  <div className="detail-value recommendation">{selectedAlert.recommendation}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedAlert.status === "New" && (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    handleAcknowledge(selectedAlert.id)
                    setShowDetailModal(false)
                  }}
                >
                  <i className="bi bi-check-lg me-2"></i>
                  Acknowledge
                </button>
              )}
              <button
                className="btn btn-danger"
                onClick={() => {
                  handleClear(selectedAlert.id)
                  setShowDetailModal(false)
                }}
              >
                <i className="bi bi-trash me-2"></i>
                Clear
              </button>
              <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Configuration Modal */}
      {showConfigModal && (
        <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="bi bi-gear me-2"></i>
                Alert Configuration
              </h2>
              <button className="close-button" onClick={() => setShowConfigModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="config-grid">
                {Object.entries(alertConfig).map(([sensor, config]) => (
                  <div key={sensor} className="config-item">
                    <div className="config-header">
                      <div className="sensor-name">
                        <span className="sensor-icon">{sensorIcons[sensor] || "🔌"}</span>
                        {sensor}
                      </div>
                      <div className="sensor-toggle">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={() =>
                              setAlertConfig({
                                ...alertConfig,
                                [sensor]: { ...config, enabled: !config.enabled },
                              })
                            }
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                    <div className="config-thresholds">
                      <div className="threshold-item">
                        <label>Warning Threshold:</label>
                        <input
                          type="number"
                          value={config.warning}
                          onChange={(e) =>
                            setAlertConfig({
                              ...alertConfig,
                              [sensor]: { ...config, warning: Number.parseFloat(e.target.value) },
                            })
                          }
                          disabled={!config.enabled}
                          className="form-control"
                        />
                      </div>
                      <div className="threshold-item">
                        <label>Fault Threshold:</label>
                        <input
                          type="number"
                          value={config.fault}
                          onChange={(e) =>
                            setAlertConfig({
                              ...alertConfig,
                              [sensor]: { ...config, fault: Number.parseFloat(e.target.value) },
                            })
                          }
                          disabled={!config.enabled}
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowConfigModal(false)}>
                Save Changes
              </button>
              <button className="btn btn-secondary" onClick={() => setShowConfigModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings Modal */}
      {showNotificationModal && (
        <div className="modal-overlay" onClick={() => setShowNotificationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="bi bi-envelope me-2"></i>
                Notification Settings
              </h2>
              <button className="close-button" onClick={() => setShowNotificationModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="notification-settings">
                <div className="notification-item">
                  <div className="notification-info">
                    <i className="bi bi-envelope-fill"></i>
                    <div>
                      <h3>Email Notifications</h3>
                      <p>Receive alert notifications via email</p>
                    </div>
                  </div>
                  <div className="notification-toggle">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.email}
                        onChange={() =>
                          setNotificationSettings({
                            ...notificationSettings,
                            email: !notificationSettings.email,
                          })
                        }
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <i className="bi bi-phone-fill"></i>
                    <div>
                      <h3>SMS Notifications</h3>
                      <p>Receive alert notifications via SMS</p>
                    </div>
                  </div>
                  <div className="notification-toggle">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.sms}
                        onChange={() =>
                          setNotificationSettings({
                            ...notificationSettings,
                            sms: !notificationSettings.sms,
                          })
                        }
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <i className="bi bi-bell-fill"></i>
                    <div>
                      <h3>Push Notifications</h3>
                      <p>Receive push notifications in your browser</p>
                    </div>
                  </div>
                  <div className="notification-toggle">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.push}
                        onChange={() =>
                          setNotificationSettings({
                            ...notificationSettings,
                            push: !notificationSettings.push,
                          })
                        }
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <i className="bi bi-laptop-fill"></i>
                    <div>
                      <h3>Desktop Notifications</h3>
                      <p>Receive notifications on your desktop</p>
                    </div>
                  </div>
                  <div className="notification-toggle">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.desktop}
                        onChange={() =>
                          setNotificationSettings({
                            ...notificationSettings,
                            desktop: !notificationSettings.desktop,
                          })
                        }
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowNotificationModal(false)}>
                Save Settings
              </button>
              <button className="btn btn-secondary" onClick={() => setShowNotificationModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css');
          
          .alerts-management {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Roboto', sans-serif;
          }
          
          .alerts-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            background-color: #fff;
            padding: 16px 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          }
          
          .alerts-header h1 {
            font-size: 28px;
            font-weight: 600;
            color: #2c3e50;
            margin: 0;
            display: flex;
            align-items: center;
          }
          
          .alerts-header h1 i {
            color: #e74c3c;
            margin-right: 12px;
            font-size: 32px;
          }
          
          .alerts-actions {
            display: flex;
            gap: 12px;
          }
          
          .alerts-actions button {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.2s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          
          .alerts-actions button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }
          
          
          
          .stat-card {
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
            border-left: 4px solid transparent;
          }
          
          .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(0,0,0,0.15);
          }
          
          .stat-card.critical {
            border-left-color: #f56565;
          }
          
          .stat-card.warning {
            border-left-color: #f6ad55;
          }
          
          .stat-card.maintenance {
            border-left-color: #4299e1;
          }
          
          .stat-card.info {
            border-left-color: #a0aec0;
          }
          
          .stat-card.critical .stat-icon {
            background-color: #f56565;
          }
          
          .stat-card.warning .stat-icon {
            background-color: #f6ad55;
          }
          
          .stat-card.maintenance .stat-icon {
            background-color: #4299e1;
          }
          
          .stat-card.info .stat-icon {
            background-color: #a0aec0;
          }
          
          .stat-icon {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 28px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          
          .stat-content {
            flex: 1;
          }
          
          .stat-content h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
            color: #4a5568;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: #2d3748;
          }
          
          .stat-change {
            font-size: 14px;
            color: #718096;
            margin-top: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          
          .stat-change.increase {
            color: #e53e3e;
          }
          
          .stat-change.decrease {
            color: #38a169;
          }
          
          .alerts-filters {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 24px;
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          }
          
          .filter-group {
            min-width: 180px;
            flex: 1;
          }
          
          .search-group {
            position: relative;
            flex: 2;
          }
          
          .search-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #a0aec0;
          }
          
          .alerts-table-container {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            overflow: hidden;
            margin-bottom: 30px;
          }
          
          .alerts-count {
            padding: 16px 20px;
            background-color: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
            color: #718096;
            font-weight: 500;
          }
          
          .alerts-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          
          .alerts-table th {
            padding: 16px 20px;
            text-align: left;
            font-weight: 600;
            color: #4a5568;
            background-color: #f8fafc;
            border-bottom: 2px solid #e2e8f0;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          
          .alerts-table td {
            padding: 16px 20px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
            word-wrap: break-word;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .alert-row {
            transition: background-color 0.2s;
          }
          
          .alert-row:hover {
            background-color: #f8fafc;
          }
          
          .alert-row.new {
            background-color: #fff5f5;
          }
          
          .alert-row.acknowledged {
            background-color: #ebf8ff;
          }
          
          .alert-row.resolved {
            opacity: 0.7;
          }
          
          .time-cell {
            white-space: nowrap;
          }
          
          .date-subtext, .details-subtext, .subtext {
            font-size: 12px;
            color: #718096;
            margin-top: 2px;
          }
          
          .message-cell {
            max-width: 300px;
            white-space: normal;
            word-wrap: break-word;
          }
          
          .severity-badge {
            display: inline-flex;
            align-items: center;
            padding: 6px 10px;
            border-radius: 20px;
            font-weight: 500;
            font-size: 12px;
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .severity-badge.critical {
            background-color: #fff5f5;
            color: #e53e3e;
            border: 1px solid #feb2b2;
          }
          
          .severity-badge.warning {
            background-color: #fffaf0;
            color: #dd6b20;
            border: 1px solid #fbd38d;
          }
          
          .severity-badge.maintenance {
            background-color: #ebf8ff;
            color: #3182ce;
            border: 1px solid #bee3f8;
          }
          
          .severity-badge.info {
            background-color: #f7fafc;
            color: #718096;
            border: 1px solid #e2e8f0;
          }
          
          .status-badge {
            display: inline-flex;
            align-items: center;
            padding: 6px 10px;
            border-radius: 20px;
            font-weight: 500;
            font-size: 12px;
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .status-badge.new {
            background-color: #fff5f5;
            color: #e53e3e;
            border: 1px solid #feb2b2;
          }
          
          .status-badge.acknowledged {
            background-color: #ebf8ff;
            color: #3182ce;
            border: 1px solid #bee3f8;
          }
          
          .status-badge.resolved {
            background-color: #f0fff4;
            color: #38a169;
            border: 1px solid #c6f6d5;
          }
          
          .action-buttons {
            display: flex;
            gap: 8px;
            justify-content: center;
          }
          
          .action-buttons button {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.2s;
          }
          
          .action-buttons button:hover {
            transform: translateY(-2px);
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          
          .sensor-icon {
            margin-right: 6px;
            font-size: 16px;
          }
          
          .no-alerts {
            text-align: center;
            padding: 60px !important;
            color: #718096;
          }
          
          .no-alerts i {
            font-size: 64px;
            color: #48bb78;
            margin-bottom: 20px;
          }
          
          .no-alerts p {
            font-size: 18px;
            margin: 0;
          }
          
          /* Modal Styles */
          .modal-overlay {
            margin-bottom: 20px;
          }
          
          .no-alerts p {
            font-size: 18px;
            margin: 0;
          }
          
          /* Modal Styles */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
          }
          
          .modal-content {
            background-color: white;
            border-radius: 12px;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            animation: modalFadeIn 0.3s ease-out;
          }
          
          @keyframes modalFadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid #e2e8f0;
            background-color: #f8fafc;
            border-top-left-radius: 12px;
            padding: 20px 24px;
            border-bottom: 1px solid #e2e8f0;
            background-color: #f8fafc;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
          }
          
          .modal-header h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #2d3748;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .close-button {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #718096;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }
          
          .close-button:hover {
            background-color: #e2e8f0;
            color: #4a5568;
          }
          
          .modal-body {
            padding: 24px;
            max-height: 60vh;
            overflow-y: auto;
          }
          
          .modal-footer {
            padding: 16px 24px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            background-color: #f8fafc;
            border-bottom-left-radius: 12px;
            border-bottom-right-radius: 12px;
          }
          
          
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  background-color: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.05);
}

.detail-item {
  margin-bottom: 16px;
}

.detail-item.full-width {
  grid-column: span 2;
}

.detail-label {
  font-size: 14px;
  color: #4a5568;
  margin-bottom: 6px;
  font-weight: 600;
}

.detail-value {
  font-size: 16px;
  color: #2d3748;
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
          
          /* Config Modal Styles */
.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  background-color: #f8fafc;
  padding: 15px;
  border-radius: 8px;
}

.config-item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transition: all 0.2s;
}
          
          /* Notification Settings Styles */
.notification-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #f8fafc;
  padding: 15px;
  border-radius: 8px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transition: all 0.2s;
}
          
          
          .alerts-table-container {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  overflow: hidden;
  margin-bottom: 30px;
}

.alerts-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.alerts-table th {
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  background-color: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.alerts-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-cell {
  max-width: 300px;
  white-space: normal;
  word-wrap: break-word;
}
          
          /* Loading Styles */
.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3182ce;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.alerts-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.alerts-loading h3 {
  margin-top: 20px;
  color: #4a5568;
  font-weight: 500;
}
          
          /* Responsive Styles */
@media (max-width: 992px) {
  .alerts-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
  
  .message-cell {
    max-width: 200px;
    white-space: normal;
  }
}

@media (max-width: 768px) {
  .alerts-table th, 
  .alerts-table td {
    padding: 12px 10px;
    font-size: 0.9rem;
  }
  
  .message-cell {
    max-width: 150px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 5px;
  }
}

          .severity-badge.unknown, .status-badge.unknown {
            background-color: #e2e8f0;
            color: #4a5568;
            border: 1px solid #cbd5e0;
          }

          .alert-row.unknown {
            background-color: #f7fafc;
          }
        
.alert-detail-modal {
  max-width: 850px;
}

.recommendation {
  padding: 16px;
  background-color: #ebf8ff;
  border-left: 4px solid #3182ce;
  border-radius: 6px;
  font-weight: 500;
  line-height: 1.5;
}

.trend-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 20px;
}

.trend-indicator.increasing {
  color: #e53e3e;
  background-color: #fff5f5;
  border: 1px solid #feb2b2;
}

.trend-indicator.decreasing {
  color: #dd6b20;
  background-color: #fffaf0;
  border: 1px solid #fbd38d;
}

.severity-badge, .status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
        `,
        }}
      />
    </div>
  )
}

// Debug function to log alert counts by severity
const logAlertCounts = (alertsList, label = "Current alerts") => {
  if (!alertsList || !Array.isArray(alertsList)) return

  const counts = {
    critical: 0,
    warning: 0,
    maintenance: 0,
    info: 0,
    total: alertsList.length,
    active: 0,
  }

  alertsList.forEach((alert) => {
    if (!alert) return

    if (alert.status !== "Resolved") {
      counts.active++
      const severity = alert.severity ? alert.severity.toLowerCase() : ""

      if (severity === "critical") counts.critical++
      else if (severity === "warning") counts.warning++
      else if (severity === "maintenance") counts.maintenance++
      else if (severity === "info") counts.info++
    }
  })

  console.log(`${label}:`, counts)
}

// Simple mock implementation instead of MSW
const originalFetch = window.fetch
window.fetch = (url, options) => {
  // For development/testing only
  if (process.env.NODE_ENV !== "production") {
    return mockFetch(url, options)
  }
  return originalFetch(url, options)
}

export default Alerts

