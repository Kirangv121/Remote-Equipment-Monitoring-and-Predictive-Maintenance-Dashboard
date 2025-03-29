"use client"

import { useState, useEffect, useRef } from "react"
import { Line, Bar } from "react-chartjs-2"
import "bootstrap/dist/css/bootstrap.min.css"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

// Icons
import {
  BarChart2,
  TrendingUp,
  Download,
  RefreshCw,
  Zap,
  Clock,
  Truck,
  Search,
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react"

const Analytics = () => {
  // State for crane selection
  const [selectedCranes, setSelectedCranes] = useState(["C-001", "C-002"])
  const [availableCranes, setAvailableCranes] = useState([
    { id: "C-001", name: "XCMG Truck Crane" },
    { id: "C-002", name: "POTAIN Tower Crane" },
    { id: "C-003", name: "GROVE Rough Terrain Crane" },
    { id: "C-004", name: "Liebherr Crawler Crane" },
  ])

  // State for metrics selection
  const [selectedMetrics, setSelectedMetrics] = useState({
    uptime: true,
    maintenanceFrequency: true,
    loadCapacity: true,
    temperature: false,
    vibration: false,
    fuelConsumption: false,
  })

  // State for time period
  const [timePeriod, setTimePeriod] = useState({
    startDate: "2023-01-01",
    endDate: "2023-12-31",
  })

  // State for comparison data
  const [comparisonData, setComparisonData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // State for crane details
  const [craneDetails, setCraneDetails] = useState({})
  const [showCraneDetails, setShowCraneDetails] = useState({})

  // State for real-time data
  const [realTimeData, setRealTimeData] = useState({})
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Refs for charts
  const performanceChartRef = useRef(null)
  const uptimeChartRef = useRef(null)
  const maintenanceChartRef = useRef(null)

  // Generate mock data for crane comparison
  useEffect(() => {
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      try {
        const data = generateMockComparisonData(selectedCranes, selectedMetrics, timePeriod)
        setComparisonData(data)

        // Generate crane details
        const details = {}
        selectedCranes.forEach((craneId) => {
          details[craneId] = generateCraneDetails(craneId)
        })
        setCraneDetails(details)

        // Initialize crane details visibility
        const detailsVisibility = {}
        selectedCranes.forEach((craneId) => {
          detailsVisibility[craneId] = false
        })
        setShowCraneDetails(detailsVisibility)

        // Generate real-time data
        const rtData = {}
        selectedCranes.forEach((craneId) => {
          rtData[craneId] = generateRealTimeData(craneId)
        })
        setRealTimeData(rtData)

        setIsLoading(false)
      } catch (err) {
        setError("Failed to load comparison data")
        setIsLoading(false)
      }
    }, 1000)
  }, [selectedCranes, selectedMetrics, timePeriod])

  // Update real-time data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const rtData = {}
      selectedCranes.forEach((craneId) => {
        rtData[craneId] = generateRealTimeData(craneId)
      })
      setRealTimeData(rtData)
      setLastUpdated(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedCranes])

  // Handle adding a crane to comparison
  const handleAddCrane = () => {
    const availableIds = availableCranes.map((crane) => crane.id)
    const unusedCranes = availableIds.filter((id) => !selectedCranes.includes(id))

    if (unusedCranes.length > 0) {
      setSelectedCranes([...selectedCranes, unusedCranes[0]])
    }
  }

  // Handle removing a crane from comparison
  const handleRemoveCrane = (craneId) => {
    if (selectedCranes.length > 1) {
      setSelectedCranes(selectedCranes.filter((id) => id !== craneId))
    }
  }

  // Handle changing a crane in the comparison
  const handleChangeCrane = (index, newCraneId) => {
    const newSelectedCranes = [...selectedCranes]
    newSelectedCranes[index] = newCraneId
    setSelectedCranes(newSelectedCranes)
  }

  // Handle metric selection change
  const handleMetricChange = (metric) => {
    setSelectedMetrics({
      ...selectedMetrics,
      [metric]: !selectedMetrics[metric],
    })
  }

  // Handle time period change
  const handleTimePeriodChange = (field, value) => {
    setTimePeriod({
      ...timePeriod,
      [field]: value,
    })
  }

  // Toggle crane details visibility
  const toggleCraneDetails = (craneId) => {
    setShowCraneDetails({
      ...showCraneDetails,
      [craneId]: !showCraneDetails[craneId],
    })
  }

  // Handle export report
  const handleExportReport = () => {
    alert("Exporting analytics report...")
    // In a real application, this would generate a PDF or Excel report
  }

  // Handle refresh data
  const handleRefreshData = () => {
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      try {
        const data = generateMockComparisonData(selectedCranes, selectedMetrics, timePeriod)
        setComparisonData(data)

        // Generate real-time data
        const rtData = {}
        selectedCranes.forEach((craneId) => {
          rtData[craneId] = generateRealTimeData(craneId)
        })
        setRealTimeData(rtData)

        setLastUpdated(new Date())
        setIsLoading(false)
      } catch (err) {
        setError("Failed to refresh data")
        setIsLoading(false)
      }
    }, 1000)
  }

  // Get crane name by ID
  const getCraneName = (craneId) => {
    const crane = availableCranes.find((c) => c.id === craneId)
    return crane ? crane.name : craneId
  }

  // Get crane color by ID
  const getCraneColor = (craneId, opacity = 1) => {
    const colors = {
      "C-001": `rgba(52, 152, 219, ${opacity})`, // Blue
      "C-002": `rgba(155, 89, 182, ${opacity})`, // Purple
      "C-003": `rgba(46, 204, 113, ${opacity})`, // Green
      "C-004": `rgba(231, 76, 60, ${opacity})`, // Red
    }

    return colors[craneId] || `rgba(149, 165, 166, ${opacity})` // Default gray
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  // Generate performance comparison chart data
  const generatePerformanceChartData = () => {
    if (!comparisonData) return null

    const labels = Object.keys(selectedMetrics).filter((metric) => selectedMetrics[metric])
    const datasets = selectedCranes.map((craneId) => ({
      label: getCraneName(craneId),
      data: labels.map((metric) => comparisonData[craneId][metric]),
      backgroundColor: getCraneColor(craneId, 0.7),
      borderColor: getCraneColor(craneId),
      borderWidth: 1,
    }))

    return {
      labels: labels.map((label) => label.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())),
      datasets,
    }
  }

  // Generate uptime trend chart data
  const generateUptimeTrendData = () => {
    if (!comparisonData) return null

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const datasets = selectedCranes.map((craneId) => ({
      label: getCraneName(craneId),
      data: months.map(() => Math.floor(Math.random() * 20) + 80), // Random values between 80-100
      borderColor: getCraneColor(craneId),
      backgroundColor: getCraneColor(craneId, 0.1),
      tension: 0.4,
      fill: true,
    }))

    return {
      labels: months,
      datasets,
    }
  }

  // Generate maintenance history chart data
  const generateMaintenanceHistoryData = () => {
    if (!comparisonData) return null

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const datasets = selectedCranes.map((craneId) => ({
      label: getCraneName(craneId),
      data: months.map(() => Math.floor(Math.random() * 5) + 1), // Random values between 1-5
      backgroundColor: getCraneColor(craneId, 0.7),
      borderColor: getCraneColor(craneId),
      borderWidth: 1,
    }))

    return {
      labels: months,
      datasets,
    }
  }

  // Generate real-time sensor chart data
  const generateSensorChartData = (craneId, sensor) => {
    if (!realTimeData[craneId] || !realTimeData[craneId][sensor]) return null

    const data = realTimeData[craneId][sensor]
    const color = getCraneColor(craneId)

    return {
      labels: data.timestamps,
      datasets: [
        {
          label: `${sensor.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}`,
          data: data.values,
          borderColor: color,
          backgroundColor: getCraneColor(craneId, 0.1),
          tension: 0.4,
          fill: true,
        },
      ],
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
        <h3>Loading Analytics...</h3>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="analytics-error">
        <div className="alert alert-danger">
          <AlertTriangle className="me-2" />
          {error}
        </div>
        <button className="btn btn-primary" onClick={handleRefreshData}>
          <RefreshCw className="me-2" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="analytics-container">
      {/* Header with search and actions */}
      <div className="analytics-header">
        <div className="search-container">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <Search size={18} />
            </span>
            <input type="text" className="form-control border-start-0" placeholder="Search reports..." />
          </div>
        </div>
        <div className="actions-container">
          <button className="btn btn-outline-secondary me-2" onClick={handleRefreshData}>
            <RefreshCw size={16} className="me-1" />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={handleExportReport}>
            <Download size={16} className="me-1" />
            Export Report
          </button>
        </div>
      </div>

      {/* Last updated timestamp */}
      <div className="last-updated text-muted mb-3">
        <Clock size={14} className="me-1" />
        Last updated: {formatTime(lastUpdated)}
      </div>

      {/* Crane Comparison Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <BarChart2 className="me-2" size={20} />
            Crane Comparison
          </h5>
          <div className="header-actions">
            <button className="btn btn-sm btn-outline-secondary">
              <Filter size={14} className="me-1" />
              Filters
            </button>
          </div>
        </div>
        <div className="card-body">
          {/* Comparison Controls */}
          <div className="comparison-controls mb-4">
            <div className="row">
              <div className="col-md-4">
                <label className="form-label">Select Cranes:</label>
                <div className="crane-selectors">
                  {selectedCranes.map((craneId, index) => (
                    <div key={index} className="crane-selector mb-2 d-flex">
                      <select
                        className="form-select me-2"
                        value={craneId}
                        onChange={(e) => handleChangeCrane(index, e.target.value)}
                      >
                        {availableCranes.map((crane) => (
                          <option
                            key={crane.id}
                            value={crane.id}
                            disabled={selectedCranes.includes(crane.id) && crane.id !== craneId}
                          >
                            {crane.name} ({crane.id})
                          </option>
                        ))}
                      </select>
                      {selectedCranes.length > 1 && (
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveCrane(craneId)}>
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                  {selectedCranes.length < availableCranes.length && (
                    <button className="btn btn-outline-primary btn-sm" onClick={handleAddCrane}>
                      <Plus size={14} className="me-1" />
                      Add Crane
                    </button>
                  )}
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Metrics:</label>
                <div className="metrics-selectors">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="uptimeCheck"
                      checked={selectedMetrics.uptime}
                      onChange={() => handleMetricChange("uptime")}
                    />
                    <label className="form-check-label" htmlFor="uptimeCheck">
                      Uptime
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="maintenanceCheck"
                      checked={selectedMetrics.maintenanceFrequency}
                      onChange={() => handleMetricChange("maintenanceFrequency")}
                    />
                    <label className="form-check-label" htmlFor="maintenanceCheck">
                      Maintenance Frequency
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="loadCheck"
                      checked={selectedMetrics.loadCapacity}
                      onChange={() => handleMetricChange("loadCapacity")}
                    />
                    <label className="form-check-label" htmlFor="loadCheck">
                      Load Capacity
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="temperatureCheck"
                      checked={selectedMetrics.temperature}
                      onChange={() => handleMetricChange("temperature")}
                    />
                    <label className="form-check-label" htmlFor="temperatureCheck">
                      Temperature
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="vibrationCheck"
                      checked={selectedMetrics.vibration}
                      onChange={() => handleMetricChange("vibration")}
                    />
                    <label className="form-check-label" htmlFor="vibrationCheck">
                      Vibration
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Time Period:</label>
                <div className="time-period-selectors">
                  <div className="input-group mb-2">
                    <input
                      type="date"
                      className="form-control"
                      value={timePeriod.startDate}
                      onChange={(e) => handleTimePeriodChange("startDate", e.target.value)}
                    />
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <span className="mx-auto">to</span>
                  </div>
                  <div className="input-group">
                    <input
                      type="date"
                      className="form-control"
                      value={timePeriod.endDate}
                      onChange={(e) => handleTimePeriodChange("endDate", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Comparison Chart */}
          <div className="performance-chart-container mb-4">
            <h6 className="chart-title">Crane Performance Comparison</h6>
            <div className="chart-container">
              <Bar
                ref={performanceChartRef}
                data={generatePerformanceChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Value",
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          let label = context.dataset.label || ""
                          if (label) {
                            label += ": "
                          }
                          if (context.parsed.y !== null) {
                            label += context.parsed.y.toFixed(1)
                          }
                          return label
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Comparison Summary */}
          <div className="comparison-summary">
            <h6 className="summary-title mb-3">Comparison Summary</h6>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Metric</th>
                    {selectedCranes.map((craneId) => (
                      <th key={craneId}>
                        {getCraneName(craneId)} ({craneId})
                      </th>
                    ))}
                    <th>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(selectedMetrics)
                    .filter((metric) => selectedMetrics[metric])
                    .map((metric) => {
                      const metricName = metric.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
                      const values = selectedCranes.map((craneId) => comparisonData[craneId][metric])
                      const max = Math.max(...values)
                      const min = Math.min(...values)
                      const diff = max - min
                      const diffPercent = min === 0 ? 100 : ((diff / min) * 100).toFixed(1)

                      return (
                        <tr key={metric}>
                          <td>{metricName}</td>
                          {selectedCranes.map((craneId) => (
                            <td
                              key={craneId}
                              className={comparisonData[craneId][metric] === max ? "table-success" : ""}
                            >
                              {comparisonData[craneId][metric].toFixed(1)}
                            </td>
                          ))}
                          <td>
                            {diff.toFixed(1)} ({diffPercent}%)
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Analysis Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <TrendingUp className="me-2" size={20} />
            Trend Analysis
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-4">
              <h6 className="chart-title">Uptime Trend (2023)</h6>
              <div className="chart-container">
                <Line
                  ref={uptimeChartRef}
                  data={generateUptimeTrendData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: false,
                        min: 70,
                        max: 100,
                        title: {
                          display: true,
                          text: "Uptime (%)",
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <h6 className="chart-title">Maintenance Frequency (2023)</h6>
              <div className="chart-container">
                <Bar
                  ref={maintenanceChartRef}
                  data={generateMaintenanceHistoryData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Number of Maintenance Events",
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Crane Analysis */}
      {selectedCranes.map((craneId) => (
        <div key={craneId} className="card shadow-sm mb-4">
          <div
            className="card-header d-flex justify-content-between align-items-center cursor-pointer"
            onClick={() => toggleCraneDetails(craneId)}
          >
            <h5 className="mb-0">
              <Truck className="me-2" size={20} />
              {getCraneName(craneId)} ({craneId}) Analysis
            </h5>
            <div>{showCraneDetails[craneId] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
          </div>

          {showCraneDetails[craneId] && (
            <div className="card-body">
              {/* Crane Details */}
              <div className="crane-details mb-4">
                <div className="row">
                  <div className="col-md-6">
                    <div className="detail-card">
                      <h6 className="detail-title">Crane Specifications</h6>
                      <div className="detail-content">
                        <div className="detail-item">
                          <span className="detail-label">Model:</span>
                          <span className="detail-value">{craneDetails[craneId].model}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Capacity:</span>
                          <span className="detail-value">{craneDetails[craneId].capacity}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Year:</span>
                          <span className="detail-value">{craneDetails[craneId].year}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">{craneDetails[craneId].location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="detail-card">
                      <h6 className="detail-title">Performance Summary</h6>
                      <div className="detail-content">
                        <div className="detail-item">
                          <span className="detail-label">Uptime:</span>
                          <span className="detail-value">{craneDetails[craneId].uptime}%</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Maintenance Events:</span>
                          <span className="detail-value">{craneDetails[craneId].maintenanceEvents}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Operational Hours:</span>
                          <span className="detail-value">{craneDetails[craneId].operationalHours}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Health Score:</span>
                          <span className="detail-value">{craneDetails[craneId].healthScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Sensor Data */}
              <div className="realtime-data mb-4">
                <h6 className="section-title">Real-time Sensor Data</h6>
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div className="sensor-chart-container">
                      <h6 className="chart-title">Temperature (°C)</h6>
                      <div className="chart-container-sm">
                        <Line
                          data={generateSensorChartData(craneId, "temperature")}
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
                              x: {
                                ticks: {
                                  maxTicksLimit: 6,
                                },
                              },
                            },
                            plugins: {
                              legend: {
                                display: false,
                              },
                            },
                            animation: {
                              duration: 0,
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="sensor-chart-container">
                      <h6 className="chart-title">Vibration (Hz)</h6>
                      <div className="chart-container-sm">
                        <Line
                          data={generateSensorChartData(craneId, "vibration")}
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
                              x: {
                                ticks: {
                                  maxTicksLimit: 6,
                                },
                              },
                            },
                            plugins: {
                              legend: {
                                display: false,
                              },
                            },
                            animation: {
                              duration: 0,
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div className="sensor-chart-container">
                      <h6 className="chart-title">Load (kg)</h6>
                      <div className="chart-container-sm">
                        <Line
                          data={generateSensorChartData(craneId, "load")}
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
                              x: {
                                ticks: {
                                  maxTicksLimit: 6,
                                },
                              },
                            },
                            plugins: {
                              legend: {
                                display: false,
                              },
                            },
                            animation: {
                              duration: 0,
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="sensor-chart-container">
                      <h6 className="chart-title">Fuel Level (%)</h6>
                      <div className="chart-container-sm">
                        <Line
                          data={generateSensorChartData(craneId, "fuelLevel")}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                title: {
                                  display: true,
                                  text: "Fuel Level (%)",
                                },
                                min: 0,
                                max: 100,
                              },
                              x: {
                                ticks: {
                                  maxTicksLimit: 6,
                                },
                              },
                            },
                            plugins: {
                              legend: {
                                display: false,
                              },
                            },
                            animation: {
                              duration: 0,
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance History */}
              <div className="maintenance-history">
                <h6 className="section-title">Maintenance History</h6>
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Technician</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {craneDetails[craneId].maintenanceHistory.map((record, index) => (
                        <tr key={index}>
                          <td>{formatDate(record.date)}</td>
                          <td>{record.type}</td>
                          <td>{record.description}</td>
                          <td>{record.technician}</td>
                          <td>
                            <span className={`badge ${record.status === "Completed" ? "bg-success" : "bg-warning"}`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-end mt-3">
                  <button className="btn btn-outline-primary btn-sm">
                    View Full Maintenance History
                    <ArrowRight size={14} className="ms-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Insights and Recommendations */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <Zap className="me-2" size={20} />
            Insights and Recommendations
          </h5>
        </div>
        <div className="card-body">
          <div className="insights-container">
            {selectedCranes.map((craneId) => (
              <div key={craneId} className="insight-card mb-3">
                <div className="insight-header">
                  <h6>
                    {getCraneName(craneId)} ({craneId})
                  </h6>
                </div>
                <div className="insight-body">
                  <div className="insight-item">
                    <div className="insight-icon warning">
                      <AlertTriangle size={16} />
                    </div>
                    <div className="insight-content">
                      <div className="insight-title">Maintenance Alert</div>
                      <div className="insight-text">
                        Scheduled maintenance is due in {Math.floor(Math.random() * 10) + 1} days based on operational
                        hours.
                      </div>
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon success">
                      <CheckCircle size={16} />
                    </div>
                    <div className="insight-content">
                      <div className="insight-title">Performance Improvement</div>
                      <div className="insight-text">
                        Uptime has increased by {Math.floor(Math.random() * 5) + 1}% compared to the previous month.
                      </div>
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon info">
                      <Info size={16} />
                    </div>
                    <div className="insight-content">
                      <div className="insight-title">Optimization Opportunity</div>
                      <div className="insight-text">
                        Fuel consumption could be reduced by optimizing idle time during operations.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .analytics-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Roboto', sans-serif;
          }
          
          .analytics-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          
          .search-container {
            width: 350px;
          }
          
          .actions-container {
            display: flex;
            align-items: center;
          }
          
          .last-updated {
            display: flex;
            align-items: center;
            font-size: 0.85rem;
          }
          
          .chart-title {
            font-weight: 600;
            margin-bottom: 1rem;
            color: #495057;
          }
          
          .chart-container {
            height: 300px;
            position: relative;
          }
          
          .chart-container-sm {
            height: 200px;
            position: relative;
          }
          
          .summary-title, .section-title {
            font-weight: 600;
            color: #495057;
          }
          
          .cursor-pointer {
            cursor: pointer;
          }
          
          .crane-selector {
            display: flex;
            align-items: center;
          }
          
          .detail-card {
            background-color: #f8f9fa;
            border-radius: 0.375rem;
            padding: 1rem;
            height: 100%;
          }
          
          .detail-title {
            font-weight: 600;
            margin-bottom: 1rem;
            color: #495057;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 0.5rem;
          }
          
          .detail-item {
            display: flex;
            margin-bottom: 0.5rem;
          }
          
          .detail-label {
            font-weight: 500;
            width: 40%;
            color: #6c757d;
          }
          
          .detail-value {
            width: 60%;
          }
          
          .sensor-chart-container {
            background-color: #fff;
            border-radius: 0.375rem;
            padding: 1rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          }
          
          .insight-card {
            background-color: #f8f9fa;
            border-radius: 0.375rem;
            overflow: hidden;
          }
          
          .insight-header {
            background-color: #e9ecef;
            padding: 0.75rem 1rem;
          }
          
          .insight-header h6 {
            margin: 0;
            font-weight: 600;
          }
          
          .insight-body {
            padding: 1rem;
          }
          
          .insight-item {
            display: flex;
            margin-bottom: 1rem;
          }
          
          .insight-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1rem;
            flex-shrink: 0;
          }
          
          .insight-icon.warning {
            background-color: #fff3cd;
            color: #ffc107;
          }
          
          .insight-icon.success {
            background-color: #d1e7dd;
            color: #198754;
          }
          
          .insight-icon.info {
            background-color: #cff4fc;
            color: #0dcaf0;
          }
          
          .insight-title {
            font-weight: 600;
            margin-bottom: 0.25rem;
          }
          
          .insight-text {
            color: #6c757d;
            font-size: 0.9rem;
          }
          
          .analytics-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 400px;
          }
          
          .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Responsive styles */
          @media (max-width: 992px) {
            .analytics-header {
              flex-direction: column;
              align-items: flex-start;
            }
            
            .search-container {
              width: 100%;
              margin-bottom: 1rem;
            }
            
            .actions-container {
              width: 100%;
            }
            
            .chart-container {
              height: 250px;
            }
            
            .chart-container-sm {
              height: 180px;
            }
          }
          
          @media (max-width: 768px) {
            .chart-container {
              height: 200px;
            }
            
            .chart-container-sm {
              height: 150px;
            }
          }
          `,
        }}
      />
    </div>
  )
}

// Helper function to generate mock comparison data
const generateMockComparisonData = (craneIds, metrics, timePeriod) => {
  const data = {}

  craneIds.forEach((craneId) => {
    data[craneId] = {
      uptime: Math.random() * 20 + 80, // 80-100%
      maintenanceFrequency: Math.random() * 10 + 1, // 1-11 events
      loadCapacity: Math.random() * 10 + 5, // 5-15 tons
      temperature: Math.random() * 30 + 20, // 20-50°C
      vibration: Math.random() * 500 + 200, // 200-700Hz
      fuelConsumption: Math.random() * 50 + 50, // 50-100L
    }
  })

  return data
}

// Helper function to generate crane details
const generateCraneDetails = (craneId) => {
  const models = {
    "C-001": "XCMG XCT25L5",
    "C-002": "POTAIN MDT 219",
    "C-003": "GROVE GRT880",
    "C-004": "Liebherr LR 1300",
  }

  const capacities = {
    "C-001": "25 tons",
    "C-002": "10 tons",
    "C-003": "80 tons",
    "C-004": "300 tons",
  }

  const locations = {
    "C-001": "North Construction Site",
    "C-002": "Central Tower Project",
    "C-003": "South Highway Extension",
    "C-004": "East Port Development",
  }

  // Generate random maintenance history
  const maintenanceTypes = ["Scheduled", "Repair", "Inspection", "Emergency", "Preventive"]
  const maintenanceDescriptions = [
    "Hydraulic system maintenance",
    "Engine oil change",
    "Brake system inspection",
    "Cable replacement",
    "Control system calibration",
    "Structural inspection",
    "Electrical system check",
    "Fuel system maintenance",
  ]
  const technicians = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams", "Robert Brown"]
  const statuses = ["Completed", "Scheduled"]

  const maintenanceHistory = []
  const numRecords = Math.floor(Math.random() * 5) + 3 // 3-7 records

  for (let i = 0; i < numRecords; i++) {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 180)) // Random date within last 180 days

    maintenanceHistory.push({
      date: date.toISOString(),
      type: maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)],
      description: maintenanceDescriptions[Math.floor(Math.random() * maintenanceDescriptions.length)],
      technician: technicians[Math.floor(Math.random() * technicians.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
    })
  }

  // Sort by date (newest first)
  maintenanceHistory.sort((a, b) => new Date(b.date) - new Date(a.date))

  return {
    model: models[craneId] || "Unknown Model",
    capacity: capacities[craneId] || "Unknown Capacity",
    year: 2018 + Math.floor(Math.random() * 5), // 2018-2022
    location: locations[craneId] || "Unknown Location",
    uptime: Math.floor(Math.random() * 20 + 80), // 80-100%
    maintenanceEvents: Math.floor(Math.random() * 10 + 1), // 1-10 events
    operationalHours: Math.floor(Math.random() * 5000 + 1000), // 1000-6000 hours
    healthScore: Math.floor(Math.random() * 30 + 70), // 70-100%
    maintenanceHistory,
  }
}

// Helper function to generate real-time sensor data
const generateRealTimeData = (craneId) => {
  const generateTimePoints = () => {
    const now = new Date()
    const points = []

    for (let i = 10; i >= 0; i--) {
      const time = new Date(now)
      time.setMinutes(now.getMinutes() - i)
      points.push(time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    }

    return points
  }

  const timestamps = generateTimePoints()

  // Generate temperature data (20-50°C with small variations)
  const baseTemp = Math.random() * 20 + 20
  const temperature = {
    timestamps,
    values: timestamps.map(() => baseTemp + (Math.random() * 5 - 2.5)),
  }

  // Generate vibration data (200-700Hz with variations)
  const baseVibration = Math.random() * 300 + 200
  const vibration = {
    timestamps,
    values: timestamps.map(() => baseVibration + (Math.random() * 100 - 50)),
  }

  // Generate load data (0-15 tons with variations)
  const baseLoad = Math.random() * 10
  const load = {
    timestamps,
    values: timestamps.map(() => baseLoad + (Math.random() * 3 - 1.5)),
  }

  // Generate fuel level data (0-100% with small decreases)
  let baseFuel = Math.random() * 50 + 50
  const fuelLevel = {
    timestamps,
    values: timestamps.map((_, i) => {
      baseFuel -= Math.random() * 0.5
      return Math.max(0, baseFuel)
    }),
  }

  return {
    temperature,
    vibration,
    load,
    fuelLevel,
  }
}

export default Analytics

