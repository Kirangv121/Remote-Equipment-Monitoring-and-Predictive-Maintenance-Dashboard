"use client"

import React from "react"
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for Leaflet marker icons in Next.js
const createMarkerIcon = (status) => {
  return L.divIcon({
    className: `custom-marker ${status}`,
    iconSize: [40, 40], // Increased size
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    html: `<div class="marker-pin ${status}"></div>`,
  })
}

// Custom component to add fullscreen control
// This component must be used inside the MapContainer
function FullscreenControlComponent() {
  const map = useMap()

  React.useEffect(() => {
    // Only add the control if it doesn't exist yet
    if (!map.fullscreenControl) {
      // Check if L.Control.Fullscreen exists
      if (L.Control && L.Control.Fullscreen) {
        map.fullscreenControl = L.control
          .fullscreen({
            position: "topright",
            title: "Show me the fullscreen!",
            titleCancel: "Exit fullscreen mode",
            content: '<i class="bi bi-arrows-fullscreen"></i>',
          })
          .addTo(map)
      } else {
        console.warn("Fullscreen control not available")
      }
    }

    return () => {
      // Clean up on unmount
      if (map.fullscreenControl) {
        map.removeControl(map.fullscreenControl)
        map.fullscreenControl = null
      }
    }
  }, [map])

  return null // This component doesn't render anything
}

// Component to handle map resize
function MapResizer() {
  const map = useMap()

  React.useEffect(() => {
    // Fix for map container not rendering properly
    setTimeout(() => {
      map.invalidateSize()
    }, 200)

    // Also handle window resize
    const handleResize = () => {
      map.invalidateSize()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [map])

  return null
}

export default function MapComponent({ craneData }) {
  // Default center on Singapore
  const center = [1.2855, 103.8565]

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false} // We'll add zoom control in a better position
      className="map-fullsize"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Add zoom control in top-right */}
      <ZoomControl position="topright" />

      {/* Add our custom components */}
      <MapResizer />

      {craneData.map((crane) => (
        <Marker key={crane.id} position={crane.position} icon={createMarkerIcon(crane.status)}>
          <Popup className="custom-popup">
            <div className="crane-popup">
              <h3>{crane.name}</h3>
              <p>
                <strong>Operator:</strong> {crane.operator}
              </p>
              <p>
                <strong>Type:</strong> {crane.type || "Standard Crane"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status-text ${crane.status}`}>{crane.status.toUpperCase()}</span>
              </p>
              {crane.alerts && crane.alerts.length > 0 && (
                <>
                  <p>
                    <strong>Alerts:</strong>
                  </p>
                  <ul className="alert-list">
                    {crane.alerts.map((alert, index) => (
                      <li key={index}>{alert}</li>
                    ))}
                  </ul>
                </>
              )}
              <button className="details-button">View Details</button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

