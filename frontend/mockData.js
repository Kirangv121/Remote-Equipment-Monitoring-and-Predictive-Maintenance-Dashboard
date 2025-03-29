// Mock data for the application
export const mockAlerts = [
  {
    id: 1,
    title: "High temperature detected",
    description: "Engine temperature exceeds normal operating range",
    severity: "critical",
    timestamp: new Date().toISOString(),
    status: "active",
    source: "Engine Sensor",
    craneId: "CR-001",
  },
  {
    id: 2,
    title: "Low fuel level",
    description: "Fuel level below 20%",
    severity: "warning",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: "active",
    source: "Fuel Sensor",
    craneId: "CR-001",
  },
  {
    id: 3,
    title: "Scheduled maintenance",
    description: "Regular maintenance due in 2 days",
    severity: "maintenance",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: "active",
    source: "Maintenance System",
    craneId: "CR-002",
  },
  {
    id: 4,
    title: "System update available",
    description: "New firmware version 2.3.4 is available",
    severity: "info",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    status: "active",
    source: "Update Server",
    craneId: "CR-003",
  },
]

export const mockSensorData = {
  temperature: [
    { timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), value: 75 },
    { timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), value: 78 },
    { timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), value: 82 },
    { timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), value: 85 },
    { timestamp: new Date().toISOString(), value: 88 },
  ],
  pressure: [
    { timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), value: 120 },
    { timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), value: 122 },
    { timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), value: 118 },
    { timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), value: 121 },
    { timestamp: new Date().toISOString(), value: 123 },
  ],
  vibration: [
    { timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), value: 0.5 },
    { timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), value: 0.6 },
    { timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), value: 0.8 },
    { timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), value: 0.7 },
    { timestamp: new Date().toISOString(), value: 0.9 },
  ],
}

// Helper function to get mock data
export const getMockData = (type) => {
  switch (type) {
    case "alerts":
      return [...mockAlerts]
    case "sensorData":
      return { ...mockSensorData }
    default:
      return []
  }
}

// Helper function to simulate API calls
export const mockApiCall = (endpoint, delay = 500) => {
  // Try to use the real backend API first
  if (typeof window !== "undefined") {
    try {
      console.log("Attempting to use real API for:", endpoint)
      return fetch(`http://localhost:5000${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok")
          }
          return response.json()
        })
        .catch((error) => {
          console.warn("Failed to fetch from real API, using mock data:", error.message)
          // Fall back to mock data
          return new Promise((resolve) => {
            setTimeout(() => {
              if (endpoint.includes("alerts")) {
                resolve(getMockData("alerts"))
              } else if (endpoint.includes("sensor")) {
                resolve(getMockData("sensorData"))
              } else {
                resolve([])
              }
            }, delay)
          })
        })
    } catch (error) {
      console.warn("Error in API call, using mock data:", error.message)
    }
  }

  // Use mock data as fallback
  return new Promise((resolve) => {
    console.log("Using mock data for:", endpoint)
    setTimeout(() => {
      if (endpoint.includes("alerts")) {
        resolve(getMockData("alerts"))
      } else if (endpoint.includes("sensor")) {
        resolve(getMockData("sensorData"))
      } else {
        resolve([])
      }
    }, delay)
  })
}

