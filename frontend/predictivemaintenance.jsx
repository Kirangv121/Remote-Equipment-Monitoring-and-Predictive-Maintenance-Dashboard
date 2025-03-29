"use client"

import { useState, useEffect } from "react"
import { Line } from "react-chartjs-2"
import "bootstrap/dist/css/bootstrap.min.css"

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

const PredictiveMaintenance = ({
  sensorData,
  history,
  alerts,
  operatingHours,
  lastUpdated,
  selectedCrane,
  cranesData,
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [csvData, setCsvData] = useState([])
  const [processedData, setProcessedData] = useState({
    anomalyScores: [],
    healthScores: [],
    remainingUsefulLife: null,
    recommendations: [],
  })
  const [trendData, setTrendData] = useState({
    temperature: [],
    vibration: [],
    soundLevel: [],
    weight: [],
    voltage: [],
    fuel: [],
    distance: [],
  })

  // Process dashboard data for predictive maintenance
  useEffect(() => {
    if (history.length > 0) {
      setLoading(false)

      // Process trend data from history
      const trends = {
        temperature: history.map((h) => ({
          value: h.temperature,
          timestamp: h.timestamp || new Date().toLocaleTimeString(),
        })),
        vibration: history.map((h) => ({
          value: h.vibration,
          timestamp: h.timestamp || new Date().toLocaleTimeString(),
        })),
        soundLevel: history.map((h) => ({
          value: h.soundLevel,
          timestamp: h.timestamp || new Date().toLocaleTimeString(),
        })),
        weight: history.map((h) => ({
          value: h.weight,
          timestamp: h.timestamp || new Date().toLocaleTimeString(),
        })),
        voltage: history.map((h) => ({
          value: h.voltage,
          timestamp: h.timestamp || new Date().toLocaleTimeString(),
        })),
        fuel: history.map((h) => ({
          value: h.fuel,
          timestamp: h.timestamp || new Date().toLocaleTimeString(),
        })),
        distance: history.map((h) => ({
          value: h.distance,
          timestamp: h.timestamp || new Date().toLocaleTimeString(),
        })),
      }

      setTrendData(trends)

      // Calculate health scores based on sensor values and alerts
      const healthScores = calculateHealthScores(history)

      // Estimate remaining useful life
      const rul = estimateRUL(history, alerts || [])

      // Generate recommendations based on alerts
      const recommendations = generateRecommendations(alerts || [])

      setProcessedData({
        anomalyScores: calculateAnomalyScores(history),
        healthScores,
        remainingUsefulLife: rul,
        recommendations,
      })
    }
  }, [history, alerts])

  // Calculate anomaly scores from sensor data
  const calculateAnomalyScores = (historyData) => {
    return historyData.map((entry, index) => {
      // Calculate distance from normal operating parameters
      const temperatureScore = Math.abs(entry.temperature - 25) / 15
      const vibrationScore = Math.abs(entry.vibration - 300) / 400
      const soundScore = Math.abs(entry.soundLevel - 30) / 20
      const loadScore = Math.abs(entry.weight - 5) / 5
      const voltageScore = Math.abs(entry.voltage - 10) / 5

      // Combine scores (weighted average)
      const combinedScore =
        (temperatureScore * 0.25 + vibrationScore * 0.3 + soundScore * 0.15 + loadScore * 0.2 + voltageScore * 0.1) *
        100

      // Determine if this is an anomaly
      const isAnomaly = combinedScore > 50

      return {
        timestamp: entry.timestamp,
        score: Math.min(100, combinedScore), // Cap at 100
        isAnomaly,
      }
    })
  }

  // Calculate health scores based on sensor values
  const calculateHealthScores = (historyData) => {
    return historyData.map((entry, index) => {
      // Calculate health factors for each sensor
      const temperatureFactor = Math.max(0, 1 - Math.abs(entry.temperature - 25) / 25)
      const vibrationFactor = Math.max(0, 1 - Math.abs(entry.vibration - 300) / 700)
      const soundFactor = Math.max(0, 1 - Math.abs(entry.soundLevel - 30) / 50)
      const loadFactor = Math.max(0, 1 - Math.abs(entry.weight - 5) / 10)
      const voltageFactor = Math.max(0, 1 - Math.abs(entry.voltage - 10) / 15)
      const fuelFactor = entry.fuel / 100
      const distanceFactor = Math.min(1, entry.distance / 30)

      // Combine factors (weighted average)
      const healthScore =
        (temperatureFactor * 0.2 +
          vibrationFactor * 0.25 +
          soundFactor * 0.15 +
          loadFactor * 0.15 +
          voltageFactor * 0.1 +
          fuelFactor * 0.05 +
          distanceFactor * 0.1) *
        100

      return {
        timestamp: entry.timestamp,
        score: Math.max(0, Math.min(100, healthScore)), // Ensure between 0-100
      }
    })
  }

  // Estimate remaining useful life based on health trend
  const estimateRUL = (historyData, alertsData) => {
    if (historyData.length < 5) {
      return { days: 180, hours: 180 * 24 }
    }

    // Get health scores
    const healthScores = calculateHealthScores(historyData)

    // Calculate health trend
    const recentScores = healthScores.slice(-5).map((h) => h.score)
    const trend = calculateTrend(recentScores)

    // Base RUL on current health and trend
    const currentHealth = recentScores[recentScores.length - 1]

    // If health is declining rapidly, reduce RUL
    let baseHours = 4320 // 180 days default

    if (trend < -0.5) {
      // Declining health
      baseHours = Math.max(24, baseHours * (1 + trend))
    }

    // Adjust based on current health
    const healthFactor = currentHealth / 100
    const adjustedHours = baseHours * healthFactor

    // Further adjust based on number of alerts
    const alertFactor = Math.max(0.5, 1 - alertsData.length * 0.05)
    const finalHours = adjustedHours * alertFactor

    return {
      days: Math.round(finalHours / 24),
      hours: Math.round(finalHours),
    }
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

  // Generate maintenance recommendations based on alerts
  const generateRecommendations = (alertsData) => {
    if (!alertsData || alertsData.length === 0) {
      return []
    }

    const recommendations = []

    // Group alerts by sensor type
    const alertGroups = {}
    alertsData.forEach((alert) => {
      const sensor = alert.sensor || "System"
      if (!alertGroups[sensor]) {
        alertGroups[sensor] = []
      }
      alertGroups[sensor].push(alert)
    })

    // Generate recommendations for each sensor type
    Object.entries(alertGroups).forEach(([sensor, alerts]) => {
      // Determine severity based on number of alerts and their severity
      const highSeverityCount = alerts.filter((a) => a.severity === "high" || a.severity === "Critical").length
      const severity = highSeverityCount > 0 ? "Critical" : alerts.length > 1 ? "High" : "Medium"

      // Create recommendation for each alert
      alerts.forEach((alert, index) => {
        recommendations.push({
          component: sensor,
          issue: alert.message || alert.alert || `Issue detected with ${sensor}`,
          severity: alert.severity || severity,
          action: alert.suggestion || `Inspect ${sensor} system and perform maintenance`,
          timeline: severity === "Critical" ? "Immediately" : severity === "High" ? "Within 7 days" : "Within 14 days",
        })
      })
    })

    // Add RUL-based recommendation if health is declining
    if (processedData.healthScores && processedData.healthScores.length > 5) {
      const recentScores = processedData.healthScores.slice(-5).map((h) => h.score)
      const trend = calculateTrend(recentScores)

      if (trend < -0.5) {
        recommendations.push({
          component: "Overall System",
          issue: "Declining system health detected",
          severity: trend < -1 ? "Critical" : "Medium",
          action: "Schedule comprehensive maintenance check",
          timeline: trend < -1 ? "Immediately" : "Within 30 days",
        })
      }
    }

    return recommendations
  }

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return new Date().toLocaleString() // Return current date/time if no timestamp

    try {
      // Check if timestamp is already a Date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleString()
      }

      // If it's a number (timestamp in milliseconds)
      if (typeof timestamp === "number") {
        return new Date(timestamp).toLocaleString()
      }

      // If it's a string that looks like a time string (e.g., "10:30:45 AM")
      if (
        typeof timestamp === "string" &&
        timestamp.includes(":") &&
        !timestamp.includes("-") &&
        !timestamp.includes("/")
      ) {
        return new Date().toLocaleString() // Return current date/time for time-only strings
      }

      // Regular date string
      const date = new Date(timestamp)

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date detected:", timestamp)
        return new Date().toLocaleString() // Return current date/time if invalid
      }

      return date.toLocaleString()
    } catch (error) {
      console.error("Error formatting timestamp:", error, timestamp)
      return new Date().toLocaleString() // Return current date/time on error
    }
  }

  // Generate health score chart data
  const generateHealthScoreChartData = () => {
    if (!processedData.healthScores || processedData.healthScores.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: "Health Score",
            data: [],
            borderColor: "#3498db",
            backgroundColor: "rgba(52, 152, 219, 0.2)",
            tension: 0.4,
            fill: true,
          },
        ],
      }
    }

    // Ensure all timestamps are valid
    const validHealthScores = processedData.healthScores.map((item) => ({
      ...item,
      timestamp: item.timestamp || new Date().toLocaleString(),
    }))

    return {
      labels: validHealthScores.map((item) => formatTimestamp(item.timestamp)),
      datasets: [
        {
          label: "Health Score",
          data: validHealthScores.map((item) => item.score),
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    }
  }

  // Generate anomaly chart data
  const generateAnomalyChartData = () => {
    if (!processedData.anomalyScores || processedData.anomalyScores.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: "Anomaly Score",
            data: [],
            borderColor: "#e74c3c",
            backgroundColor: "rgba(231, 76, 60, 0.2)",
            tension: 0.4,
            fill: true,
          },
        ],
      }
    }

    // Ensure all timestamps are valid
    const validAnomalyScores = processedData.anomalyScores.map((item) => ({
      ...item,
      timestamp: item.timestamp || new Date().toLocaleString(),
    }))

    return {
      labels: validAnomalyScores.map((item) => formatTimestamp(item.timestamp)),
      datasets: [
        {
          label: "Anomaly Score",
          data: validAnomalyScores.map((item) => item.score),
          borderColor: "#e74c3c",
          backgroundColor: "rgba(231, 76, 60, 0.2)",
          tension: 0.4,
          fill: true,
          pointRadius: (context) => {
            const index = context.dataIndex
            return validAnomalyScores[index].isAnomaly ? 5 : 2
          },
          pointBackgroundColor: (context) => {
            const index = context.dataIndex
            return validAnomalyScores[index].isAnomaly ? "#e74c3c" : "#3498db"
          },
        },
      ],
    }
  }

  // Generate sensor trend chart data
  const generateSensorTrendChart = (sensorKey, label, color) => {
    if (!trendData[sensorKey] || trendData[sensorKey].length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label,
            data: [],
            borderColor: color,
            backgroundColor: `${color}33`,
            tension: 0.4,
            fill: false,
          },
        ],
      }
    }

    // Ensure all timestamps are valid
    const validTrendData = trendData[sensorKey].map((item) => ({
      ...item,
      timestamp: item.timestamp || new Date().toLocaleString(),
    }))

    return {
      labels: validTrendData.map((item) => formatTimestamp(item.timestamp)),
      datasets: [
        {
          label,
          data: validTrendData.map((item) => item.value),
          borderColor: color,
          backgroundColor: `${color}33`,
          tension: 0.4,
          fill: false,
        },
      ],
    }
  }

  // Get severity class
  const getSeverityClass = (severity) => {
    if (!severity) {
      return "bg-secondary text-white" // Default for undefined severity
    }

    switch (severity.toString().toLowerCase()) {
      case "critical":
        return "bg-danger text-white"
      case "high":
        return "bg-warning"
      case "medium":
        return "bg-info text-white"
      case "low":
        return "bg-success text-white"
      default:
        return "bg-secondary text-white"
    }
  }

  // Generate component health data
  const generateComponentHealth = () => {
    if (!sensorData) return []

    // Calculate component health based on sensor data
    const components = [
      {
        name: "Temperature System",
        health: Math.max(0, 100 - Math.abs(sensorData.temperature - 25) * 4),
        notes: "Based on temperature sensor readings",
      },
      {
        name: "Vibration System",
        health: Math.max(0, 100 - Math.abs(sensorData.vibration - 300) / 7),
        notes: "Based on vibration sensor readings",
      },
      {
        name: "Sound System",
        health: Math.max(0, 100 - Math.abs(sensorData.soundLevel - 30) * 2),
        notes: "Based on sound level readings",
      },
      {
        name: "Load System",
        health: Math.max(0, 100 - Math.abs(sensorData.weight - 5) * 10),
        notes: "Based on load sensor readings",
      },
      {
        name: "Power System",
        health: Math.max(0, 100 - Math.abs(sensorData.voltage - 10) * 6.67),
        notes: "Based on voltage readings",
      },
      {
        name: "Fuel System",
        health: Math.max(0, sensorData.fuel),
        notes: "Based on fuel level",
      },
      {
        name: "Distance System",
        health: Math.min(100, sensorData.distance * 3.33),
        notes: "Based on ultrasonic sensor readings",
      },
      {
        name: "Overall System",
        health:
          processedData.healthScores && processedData.healthScores.length > 0
            ? processedData.healthScores[processedData.healthScores.length - 1].score
            : 100,
        notes: "Based on combined sensor readings",
      },
    ]

    return components.map((component) => ({
      ...component,
      health: Math.min(100, Math.max(0, Math.round(component.health))), // Ensure between 0-100
    }))
  }

  // Render loading state
  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow">
              <div className="card-body text-center p-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5>Loading predictive maintenance data...</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow border-danger">
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">Error</h5>
              </div>
              <div className="card-body">
                <p>{error}</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const componentHealth = generateComponentHealth()

  return (
    <div className="predictive-maintenance-container">
      <div className="dashboard-header mb-4">
        <h2 className="text-center dashboard-title">
          <i className="bi bi-graph-up me-2"></i>
          Predictive Maintenance Dashboard
        </h2>
        <div className="dashboard-subtitle text-center">AI-powered anomaly detection and early fault prediction</div>
      </div>

      {/* Health Score and RUL */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Equipment Health Score Trend</h5>
            </div>
            <div className="card-body chart-container">
              <Line
                data={generateHealthScoreChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: "Health Score (%)",
                      },
                    },
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => `Health Score: ${context.parsed.y.toFixed(1)}%`,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow h-100">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Remaining Useful Life</h5>
            </div>
            <div className="card-body">
              {processedData.remainingUsefulLife && (
                <div className="rul-container text-center">
                  <div className="rul-value">
                    {processedData.remainingUsefulLife.days || 0}
                    <span className="rul-unit">days</span>
                  </div>
                  <div className="progress mt-3">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${Math.min(100, ((processedData.remainingUsefulLife.days || 0) / 365) * 100)}%`,
                        backgroundColor:
                          (processedData.remainingUsefulLife.days || 0) < 30
                            ? "#e74c3c"
                            : (processedData.remainingUsefulLife.days || 0) < 90
                              ? "#f39c12"
                              : "#2ecc71",
                      }}
                      aria-valuenow={processedData.remainingUsefulLife.days || 0}
                      aria-valuemin="0"
                      aria-valuemax="365"
                    ></div>
                  </div>
                  <p className="mt-3">
                    {(processedData.remainingUsefulLife.days || 0) < 30
                      ? "Maintenance required soon!"
                      : (processedData.remainingUsefulLife.days || 0) < 90
                        ? "Plan for maintenance in the coming months"
                        : "Equipment in good condition"}
                  </p>
                  <div className="text-muted mt-3">
                    <small>Estimated RUL: {Math.round(processedData.remainingUsefulLife.hours || 0)} hours</small>
                  </div>
                  <div className="text-muted mt-2">
                    <small>Last updated: {formatTimestamp(lastUpdated) || new Date().toLocaleString()}</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Anomaly Detection */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">Anomaly Detection</h5>
            </div>
            <div className="card-body chart-container">
              <Line
                data={generateAnomalyChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Anomaly Score",
                      },
                    },
                    x: {
                      ticks: {
                        maxTicksLimit: 10,
                      },
                    },
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const index = context.dataIndex
                          const isAnomaly = processedData.anomalyScores[index]?.isAnomaly
                          return `Anomaly Score: ${context.parsed.y.toFixed(2)}${
                            isAnomaly ? " (ANOMALY DETECTED)" : ""
                          }`
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Trends */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Critical Sensor Trends</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-header bg-danger-subtle">
                      <h6 className="mb-0">Temperature Trend</h6>
                    </div>
                    <div className="card-body chart-container-sm">
                      <Line
                        data={generateSensorTrendChart("temperature", "Temperature (°C)", "#e74c3c")}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              title: {
                                display: true,
                                text: "Temperature (°C)",
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-header bg-warning-subtle">
                      <h6 className="mb-0">Vibration Trend</h6>
                    </div>
                    <div className="card-body chart-container-sm">
                      <Line
                        data={generateSensorTrendChart("vibration", "Vibration (Hz)", "#f39c12")}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              title: {
                                display: true,
                                text: "Vibration (Hz)",
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-header bg-info-subtle">
                      <h6 className="mb-0">Load Trend</h6>
                    </div>
                    <div className="card-body chart-container-sm">
                      <Line
                        data={generateSensorTrendChart("weight", "Load (kg)", "#3498db")}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              title: {
                                display: true,
                                text: "Load (kg)",
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-header bg-success-subtle">
                      <h6 className="mb-0">Fuel Level Trend</h6>
                    </div>
                    <div className="card-body chart-container-sm">
                      <Line
                        data={generateSensorTrendChart("fuel", "Fuel Level (L)", "#2ecc71")}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              title: {
                                display: true,
                                text: "Fuel Level (L)",
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Early Fault Detection */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">Early Fault Detection</h5>
            </div>
            <div className="card-body">
              {alerts && alerts.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Sensor</th>
                        <th>Issue</th>
                        <th>Severity</th>
                        <th>Trend</th>
                        <th>Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((alert, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{alert.sensor || "System"}</strong>
                          </td>
                          <td>{alert.message || alert.alert || "Unknown issue detected"}</td>
                          <td>
                            <span className={`badge ${getSeverityClass(alert.severity)} px-3 py-2`}>
                              {alert.severity || "Medium"}
                            </span>
                          </td>
                          <td>
                            {alert.trend ? (
                              <span className={alert.direction === "increasing" ? "text-danger" : "text-warning"}>
                                <i
                                  className={`bi bi-arrow-${alert.direction === "increasing" ? "up" : "down"}-right me-1`}
                                ></i>
                                {alert.trend} per reading
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td>{alert.suggestion || "Inspect system for potential issues"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4">
                  <i className="bi bi-check-circle-fill text-success fs-1"></i>
                  <p className="mt-3">No early faults detected at this time.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Recommendations */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Maintenance Recommendations</h5>
            </div>
            <div className="card-body">
              {processedData.recommendations && processedData.recommendations.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Component</th>
                        <th>Issue</th>
                        <th>Severity</th>
                        <th>Recommended Action</th>
                        <th>Timeline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedData.recommendations.map((rec, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{rec.component}</strong>
                          </td>
                          <td>{rec.issue}</td>
                          <td>
                            <span className={`badge ${getSeverityClass(rec.severity)} px-3 py-2`}>{rec.severity}</span>
                          </td>
                          <td>{rec.action}</td>
                          <td>{rec.timeline}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4">
                  <i className="bi bi-check-circle-fill text-success fs-1"></i>
                  <p className="mt-3">No maintenance actions required at this time.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Component Health Status */}
      {componentHealth && componentHealth.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Component Health Status</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {componentHealth.map((component, index) => (
                    <div key={index} className="col-md-3 mb-3">
                      <div className="card h-100">
                        <div
                          className={`card-header ${
                            component.health >= 80
                              ? "bg-success text-white"
                              : component.health >= 50
                                ? "bg-warning"
                                : "bg-danger text-white"
                          }`}
                        >
                          <h6 className="mb-0">{component.name}</h6>
                        </div>
                        <div className="card-body text-center">
                          <div className="health-gauge">
                            <div className="health-value">{component.health}%</div>
                          </div>
                          <div className="progress mt-3">
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${component.health}%`,
                                backgroundColor:
                                  component.health >= 80 ? "#2ecc71" : component.health >= 50 ? "#f39c12" : "#e74c3c",
                              }}
                              aria-valuenow={component.health}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                          <p className="mt-2 mb-0 text-muted">{component.notes}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for styling */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .predictive-maintenance-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .chart-container {
            height: 300px;
            position: relative;
          }
          
          .chart-container-sm {
            height: 200px;
            position: relative;
          }
          
          .rul-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
          }
          
          .rul-value {
            font-size: 3.5rem;
            font-weight: 700;
            position: relative;
          }
          
          .rul-unit {
            font-size: 1rem;
            font-weight: 400;
            position: absolute;
            bottom: 0.5rem;
            margin-left: 5px;
          }
          
          .health-gauge {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: #f0f0f0;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
          }
          
          .health-value {
            font-size: 1.5rem;
            font-weight: 700;
          }
          
          .dashboard-title {
            font-weight: 700;
            color: #2c3e50;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .dashboard-subtitle {
            color: #34495e;
            font-size: 1.1rem;
            margin-top: 5px;
          }
          
          @media (max-width: 768px) {
            .chart-container {
              height: 250px;
            }
            
            .chart-container-sm {
              height: 180px;
            }
            
            .rul-value {
              font-size: 2.5rem;
            }
          }
        `,
        }}
      />
    </div>
  )
}

export default PredictiveMaintenance

