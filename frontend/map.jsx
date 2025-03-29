"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"

// We need to dynamically import the map component to avoid SSR issues with Leaflet
const MapWithNoSSR = dynamic(() => import("./components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="loading-map">
      <div className="spinner">
        <i className="bi bi-arrow-repeat spinning"></i>
      </div>
      <p>Loading Map...</p>
    </div>
  ),
})

export default function Map() {
  const [isLoading, setIsLoading] = useState(true)
  const [craneData, setCraneData] = useState([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const mapContainerRef = useRef(null)

  // Mock crane data
  useEffect(() => {
    // Simulate API call to get crane locations
    setTimeout(() => {
      const mockCraneData = [
        {
          id: 1,
          name: "XCMG Truck Crane #1",
          operator: "John Doe",
          type: "Mobile Crane",
          status: "healthy",
          position: [1.2855, 103.8565], // Singapore coordinates
          alerts: [],
        },
        {
          id: 2,
          name: "POTAIN Tower Crane #3",
          operator: "Jane Smith",
          type: "Tower Crane",
          status: "warning",
          position: [1.2815, 103.8495],
          alerts: ["High temperature detected"],
        },
        {
          id: 3,
          name: "Liebherr Tower Crane #2",
          operator: "Mike Johnson",
          type: "Crawler Crane",
          status: "critical",
          position: [1.2905, 103.8605],
          alerts: ["Overload detected", "Abnormal vibration"],
        },
        {
          id: 4,
          name: "XCMG Truck Crane #5",
          operator: "Sarah Williams",
          type: "Mobile Crane",
          status: "healthy",
          position: [1.2795, 103.8535],
          alerts: [],
        },
        {
          id: 5,
          name: "POTAIN Tower Crane #7",
          operator: "David Brown",
          type: "Tower Crane",
          status: "warning",
          position: [1.2875, 103.8475],
          alerts: ["Low fuel level"],
        },
      ]
      setCraneData(mockCraneData)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Toggle fullscreen using the browser's Fullscreen API
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // If not in fullscreen mode, enter fullscreen
      if (mapContainerRef.current && mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
        })
        setIsFullscreen(true)
      }
    } else {
      // If in fullscreen mode, exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`)
        })
        setIsFullscreen(false)
      }
    }
  }

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner">
          <i className="bi bi-arrow-repeat spinning"></i>
        </div>
        <p>Loading crane data...</p>
      </div>
    )
  }

  return (
    <div className={`map-container ${isFullscreen ? "fullscreen" : ""}`} ref={mapContainerRef}>
      <h1>Crane Location Tracking</h1>
      <div className="map-legend">
        <h3>Legend</h3>
        <div className="legend-item">
          <span className="legend-marker healthy"></span>
          <span>Healthy Crane</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker warning"></span>
          <span>Warning Crane</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker critical"></span>
          <span>Critical Crane</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker alert"></span>
          <span>Alert</span>
        </div>
      </div>

      <div className="map-controls">
        <div className="filter-controls">
          <button className="filter-btn active">All Cranes</button>
          <button className="filter-btn">Healthy</button>
          <button className="filter-btn">Warning</button>
          <button className="filter-btn">Critical</button>
        </div>

        <button className="fullscreen-btn" onClick={toggleFullscreen}>
          {isFullscreen ? (
            <>
              <i className="bi bi-fullscreen-exit"></i> Exit Fullscreen
            </>
          ) : (
            <>
              <i className="bi bi-fullscreen"></i> Fullscreen
            </>
          )}
        </button>
      </div>

      <div className="map-wrapper">
        <MapWithNoSSR craneData={craneData} />
      </div>

      <div className="map-stats">
        <div className="stat-card">
          <div className="stat-title">Total Cranes</div>
          <div className="stat-value">{craneData.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Healthy</div>
          <div className="stat-value healthy">{craneData.filter((crane) => crane.status === "healthy").length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Warning</div>
          <div className="stat-value warning">{craneData.filter((crane) => crane.status === "warning").length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Critical</div>
          <div className="stat-value critical">{craneData.filter((crane) => crane.status === "critical").length}</div>
        </div>
      </div>
    </div>
  )
}

