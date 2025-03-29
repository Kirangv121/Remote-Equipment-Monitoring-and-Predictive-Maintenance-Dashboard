"use client"

import { useState, useEffect, useRef } from "react"
import { format, parseISO } from "date-fns"
import "bootstrap/dist/css/bootstrap.min.css"
import {
  AlertTriangle,
  RefreshCw,
  FileText,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  UserPlus,
  Clock,
  CheckCircle,
  AlertOctagon,
  BarChart2,
  Calendar,
  Download,
  Plus,
  Trash2,
  FileUp,
  Camera,
  Clipboard,
  Printer,
  ArrowUpRight,
  Tag,
  Sliders,
} from "lucide-react"

const IncidentManagement = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState("active")

  // State for incidents
  const [incidents, setIncidents] = useState([])
  const [filteredIncidents, setFilteredIncidents] = useState([])
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // State for filters
  const [filters, setFilters] = useState({
    crane: "All Cranes",
    status: "All Statuses",
    severity: "All Severities",
    assignedTo: "All Technicians",
    dateRange: {
      start: "",
      end: "",
    },
    search: "",
  })

  // State for pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
  })

  // State for modals
  const [showReportModal, setShowReportModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  // State for new incident form
  const [newIncident, setNewIncident] = useState({
    crane: "",
    title: "",
    description: "",
    severity: "Moderate",
    attachments: [],
  })

  // State for incident update form
  const [incidentUpdate, setIncidentUpdate] = useState({
    status: "",
    comment: "",
    attachments: [],
  })

  // State for incident assignment form
  const [incidentAssignment, setIncidentAssignment] = useState({
    assignedTo: "",
    priority: "Medium",
    dueDate: "",
  })

  // State for export options
  const [exportOptions, setExportOptions] = useState({
    format: "PDF",
    includeAttachments: true,
    includeComments: true,
    dateRange: {
      start: "",
      end: "",
    },
  })

  // Refs for file inputs
  const fileInputRef = useRef(null)
  const updateFileInputRef = useRef(null)
  const photoInputRef = useRef(null)

  // Load incidents data
  useEffect(() => {
    fetchIncidents()
  }, [activeTab])

  // Apply filters
  useEffect(() => {
    applyFilters()
  }, [incidents, filters, pagination.currentPage])

  // Fetch incidents data
  const fetchIncidents = async () => {
    setIsLoading(true)

    try {
      // In a real application, this would be an API call
      // For now, we'll use mock data
      setTimeout(() => {
        const mockIncidents = generateMockIncidents(activeTab)
        setIncidents(mockIncidents)
        setPagination((prev) => ({
          ...prev,
          totalItems: mockIncidents.length,
          totalPages: Math.ceil(mockIncidents.length / prev.itemsPerPage),
        }))
        setLastUpdated(new Date())
        setIsLoading(false)
      }, 800)
    } catch (err) {
      setError("Failed to load incidents data")
      setIsLoading(false)
    }
  }

  // Apply filters to incidents
  const applyFilters = () => {
    let filtered = [...incidents]

    // Apply crane filter
    if (filters.crane !== "All Cranes") {
      filtered = filtered.filter((incident) => incident.crane === filters.crane)
    }

    // Apply status filter
    if (filters.status !== "All Statuses") {
      filtered = filtered.filter((incident) => incident.status === filters.status)
    }

    // Apply severity filter
    if (filters.severity !== "All Severities") {
      filtered = filtered.filter((incident) => incident.severity === filters.severity)
    }

    // Apply assigned to filter
    if (filters.assignedTo !== "All Technicians") {
      filtered = filtered.filter((incident) => incident.assignedTo === filters.assignedTo)
    }

    // Apply date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)

      filtered = filtered.filter((incident) => {
        const reportedDate = new Date(incident.reportedOn)
        return reportedDate >= startDate && reportedDate <= endDate
      })
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(
        (incident) =>
          incident.id.toLowerCase().includes(searchTerm) ||
          incident.title.toLowerCase().includes(searchTerm) ||
          incident.description.toLowerCase().includes(searchTerm) ||
          incident.crane.toLowerCase().includes(searchTerm),
      )
    }

    // Update total items and pages
    const totalItems = filtered.length
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage)

    // Adjust current page if needed
    let currentPage = pagination.currentPage
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * pagination.itemsPerPage
    const paginatedItems = filtered.slice(startIndex, startIndex + pagination.itemsPerPage)

    setFilteredIncidents(paginatedItems)
    setPagination((prev) => ({
      ...prev,
      currentPage,
      totalItems,
      totalPages,
    }))
  }

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }))

    // Reset to first page when filter changes
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }))
  }

  // Handle date range filter change
  const handleDateRangeChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value,
      },
    }))

    // Reset to first page when filter changes
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }))
  }

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value
    setFilters((prev) => ({
      ...prev,
      search: value,
    }))

    // Reset to first page when search changes
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }))
  }

  // Handle page change
  const handlePageChange = (page) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
    }))
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchIncidents()
  }

  // Handle export
  const handleExport = () => {
    setShowExportModal(true)
  }

  // Handle export confirmation
  const handleExportConfirm = () => {
    // In a real application, this would generate and download a file
    alert(`Exporting incidents in ${exportOptions.format} format...`)
    setShowExportModal(false)
  }

  // Handle view incident details
  const handleViewIncident = (incident) => {
    setSelectedIncident(incident)
    setShowDetailModal(true)
  }

  // Handle edit incident
  const handleEditIncident = (incident) => {
    setSelectedIncident(incident)
    // Pre-fill the update form with current values
    setIncidentUpdate({
      status: incident.status,
      comment: "",
      attachments: [],
    })
    setShowUpdateModal(true)
  }

  // Handle assign incident
  const handleAssignIncident = (incident) => {
    setSelectedIncident(incident)
    // Pre-fill the assignment form with current values
    setIncidentAssignment({
      assignedTo: incident.assignedTo || "",
      priority: incident.priority || "Medium",
      dueDate: incident.dueDate || "",
    })
    setShowAssignModal(true)
  }

  // Handle report new incident
  const handleReportIncident = () => {
    setShowReportModal(true)
  }

  // Handle incident form change
  const handleIncidentFormChange = (field, value) => {
    setNewIncident((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle incident update form change
  const handleUpdateFormChange = (field, value) => {
    setIncidentUpdate((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle incident assignment form change
  const handleAssignmentFormChange = (field, value) => {
    setIncidentAssignment((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle file upload
  const handleFileUpload = (e, formType) => {
    const files = Array.from(e.target.files)

    if (formType === "new") {
      setNewIncident((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...files],
      }))
    } else if (formType === "update") {
      setIncidentUpdate((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...files],
      }))
    }
  }

  // Handle remove attachment
  const handleRemoveAttachment = (index, formType) => {
    if (formType === "new") {
      setNewIncident((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index),
      }))
    } else if (formType === "update") {
      setIncidentUpdate((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index),
      }))
    }
  }

  // Handle take photo
  const handleTakePhoto = () => {
    photoInputRef.current.click()
  }

  // Handle submit new incident
  const handleSubmitIncident = () => {
    // Validate form
    if (!newIncident.crane || !newIncident.title || !newIncident.description) {
      alert("Please fill in all required fields")
      return
    }

    // In a real application, this would be an API call
    // For now, we'll just add it to our local state
    const newId = `INC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`

    const incident = {
      id: newId,
      crane: newIncident.crane,
      title: newIncident.title,
      description: newIncident.description,
      severity: newIncident.severity,
      status: "Reported",
      reportedOn: new Date().toISOString(),
      reportedBy: "Current User",
      assignedTo: null,
      attachments: newIncident.attachments.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      })),
      updates: [],
      priority: "Medium",
      dueDate: null,
    }

    setIncidents((prev) => [incident, ...prev])

    // Reset form
    setNewIncident({
      crane: "",
      title: "",
      description: "",
      severity: "Moderate",
      attachments: [],
    })

    setShowReportModal(false)

    // Switch to active incidents tab
    setActiveTab("active")
  }

  // Handle submit incident update
  const handleSubmitUpdate = () => {
    // Validate form
    if (!incidentUpdate.status || !incidentUpdate.comment) {
      alert("Please fill in all required fields")
      return
    }

    // In a real application, this would be an API call
    // For now, we'll just update our local state
    const updatedIncidents = incidents.map((incident) => {
      if (incident.id === selectedIncident.id) {
        const update = {
          timestamp: new Date().toISOString(),
          status: incidentUpdate.status,
          comment: incidentUpdate.comment,
          updatedBy: "Current User",
          attachments: incidentUpdate.attachments.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file),
          })),
        }

        return {
          ...incident,
          status: incidentUpdate.status,
          updates: [update, ...(incident.updates || [])],
          lastUpdated: new Date().toISOString(),
        }
      }
      return incident
    })

    setIncidents(updatedIncidents)

    // Reset form
    setIncidentUpdate({
      status: "",
      comment: "",
      attachments: [],
    })

    setShowUpdateModal(false)
  }

  // Handle submit incident assignment
  const handleSubmitAssignment = () => {
    // Validate form
    if (!incidentAssignment.assignedTo) {
      alert("Please select a technician")
      return
    }

    // In a real application, this would be an API call
    // For now, we'll just update our local state
    const updatedIncidents = incidents.map((incident) => {
      if (incident.id === selectedIncident.id) {
        const update = {
          timestamp: new Date().toISOString(),
          status: "Assigned",
          comment: `Assigned to ${incidentAssignment.assignedTo} with ${incidentAssignment.priority} priority`,
          updatedBy: "Current User",
          attachments: [],
        }

        return {
          ...incident,
          status: "Assigned",
          assignedTo: incidentAssignment.assignedTo,
          priority: incidentAssignment.priority,
          dueDate: incidentAssignment.dueDate,
          updates: [update, ...(incident.updates || [])],
          lastUpdated: new Date().toISOString(),
        }
      }
      return incident
    })

    setIncidents(updatedIncidents)

    // Reset form
    setIncidentAssignment({
      assignedTo: "",
      priority: "Medium",
      dueDate: "",
    })

    setShowAssignModal(false)
  }

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }

  // Format time
  const formatTime = (dateString) => {
    try {
      return format(parseISO(dateString), "h:mm a")
    } catch (error) {
      return ""
    }
  }

  // Format date and time
  const formatDateTime = (dateString) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy h:mm a")
    } catch (error) {
      return dateString
    }
  }

  // Get severity badge class
  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-danger"
      case "High":
        return "bg-danger-subtle text-danger"
      case "Moderate":
        return "bg-warning-subtle text-warning"
      case "Minor":
        return "bg-success-subtle text-success"
      default:
        return "bg-secondary"
    }
  }

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Reported":
        return "bg-info-subtle text-info"
      case "Assigned":
        return "bg-primary-subtle text-primary"
      case "In Progress":
        return "bg-warning-subtle text-warning"
      case "Pending Parts":
        return "bg-purple-subtle text-purple"
      case "Resolved":
        return "bg-success-subtle text-success"
      case "Closed":
        return "bg-secondary-subtle text-secondary"
      default:
        return "bg-secondary"
    }
  }

  // Get priority badge class
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "High":
        return "bg-danger-subtle text-danger"
      case "Medium":
        return "bg-warning-subtle text-warning"
      case "Low":
        return "bg-success-subtle text-success"
      default:
        return "bg-secondary"
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="incidents-loading">
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
        <h3>Loading Incidents...</h3>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="incidents-error">
        <div className="alert alert-danger">
          <AlertTriangle className="me-2" />
          {error}
        </div>
        <button className="btn btn-primary" onClick={handleRefresh}>
          <RefreshCw className="me-2" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="incidents-container">
      {/* Header with search */}
      <div className="incidents-header">
        <div className="search-container">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search incidents..."
              value={filters.search}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="incidents-content">
        {/* Title and tabs */}
        <div className="incidents-title-container">
          <h2 className="incidents-title">
            <AlertTriangle className="me-2" size={28} />
            Incident Reporting
          </h2>
        </div>

        {/* Tabs */}
        <div className="incidents-tabs">
          <div
            className={`incidents-tab ${activeTab === "report" ? "active" : ""}`}
            onClick={() => setActiveTab("report")}
          >
            Report Incident
          </div>
          <div
            className={`incidents-tab ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Active Incidents
          </div>
          <div
            className={`incidents-tab ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            Incident History
          </div>
          <div
            className={`incidents-tab ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics & Trends
          </div>
        </div>

        {/* Report Incident Tab */}
        {activeTab === "report" && (
          <div className="report-incident-container">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Report New Incident</h5>
              </div>
              <div className="card-body">
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Crane *</label>
                      <select
                        className="form-select"
                        value={newIncident.crane}
                        onChange={(e) => handleIncidentFormChange("crane", e.target.value)}
                        required
                      >
                        <option value="">Select Crane</option>
                        <option value="Crane #C-001">Crane #C-001</option>
                        <option value="Crane #C-002">Crane #C-002</option>
                        <option value="Crane #C-003">Crane #C-003</option>
                        <option value="Crane #C-004">Crane #C-004</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Severity *</label>
                      <select
                        className="form-select"
                        value={newIncident.severity}
                        onChange={(e) => handleIncidentFormChange("severity", e.target.value)}
                        required
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Minor">Minor</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Incident Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter a descriptive title"
                      value={newIncident.title}
                      onChange={(e) => handleIncidentFormChange("title", e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      placeholder="Provide detailed information about the incident"
                      value={newIncident.description}
                      onChange={(e) => handleIncidentFormChange("description", e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Attachments</label>
                    <div className="attachment-controls">
                      <button
                        type="button"
                        className="btn btn-outline-primary me-2"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <FileUp size={16} className="me-1" />
                        Upload Files
                      </button>
                      <button type="button" className="btn btn-outline-primary" onClick={handleTakePhoto}>
                        <Camera size={16} className="me-1" />
                        Take Photo
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        multiple
                        onChange={(e) => handleFileUpload(e, "new")}
                      />
                      <input
                        type="file"
                        ref={photoInputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFileUpload(e, "new")}
                      />
                    </div>
                    {newIncident.attachments.length > 0 && (
                      <div className="attachment-list mt-3">
                        <h6>Attached Files:</h6>
                        <ul className="list-group">
                          {newIncident.attachments.map((file, index) => (
                            <li
                              key={index}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <i className="bi bi-file-earmark me-2"></i>
                                {file.name} ({(file.size / 1024).toFixed(1)} KB)
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveAttachment(index, "new")}
                              >
                                <Trash2 size={14} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="d-flex justify-content-end mt-4">
                    <button type="button" className="btn btn-secondary me-2" onClick={() => setActiveTab("active")}>
                      Cancel
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleSubmitIncident}>
                      Submit Incident
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Active Incidents Tab */}
        {activeTab === "active" && (
          <div className="active-incidents-container">
            <div className="incidents-header-actions">
              <h3 className="section-title">Active Incidents</h3>
              <div className="header-buttons">
                <button className="btn btn-primary me-2" onClick={handleRefresh}>
                  <RefreshCw size={16} className="me-1" />
                  Refresh
                </button>
                <button className="btn btn-primary" onClick={handleExport}>
                  <FileText size={16} className="me-1" />
                  Export
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="incidents-filters">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label className="filter-label">Crane</label>
                  <select
                    className="form-select"
                    value={filters.crane}
                    onChange={(e) => handleFilterChange("crane", e.target.value)}
                  >
                    <option>All Cranes</option>
                    <option>Crane #C-001</option>
                    <option>Crane #C-002</option>
                    <option>Crane #C-003</option>
                    <option>Crane #C-004</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label className="filter-label">Status</label>
                  <select
                    className="form-select"
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                  >
                    <option>All Statuses</option>
                    <option>Reported</option>
                    <option>Assigned</option>
                    <option>In Progress</option>
                    <option>Pending Parts</option>
                    <option>Resolved</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label className="filter-label">Severity</label>
                  <select
                    className="form-select"
                    value={filters.severity}
                    onChange={(e) => handleFilterChange("severity", e.target.value)}
                  >
                    <option>All Severities</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Moderate</option>
                    <option>Minor</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label className="filter-label">Assigned To</label>
                  <select
                    className="form-select"
                    value={filters.assignedTo}
                    onChange={(e) => handleFilterChange("assignedTo", e.target.value)}
                  >
                    <option>All Technicians</option>
                    <option>Team A</option>
                    <option>Team B</option>
                    <option>John Doe</option>
                    <option>Jane Smith</option>
                    <option>Unassigned</option>
                  </select>
                </div>
              </div>
              <div className="advanced-filters-toggle">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowFilterModal(true)}>
                  <Filter size={14} className="me-1" />
                  Advanced Filters
                </button>
              </div>
            </div>

            {/* Incidents Table */}
            <div className="incidents-table-container">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Crane</th>
                      <th>Title</th>
                      <th>Reported On</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncidents.length > 0 ? (
                      filteredIncidents.map((incident) => (
                        <tr key={incident.id}>
                          <td className="incident-id">
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                handleViewIncident(incident)
                              }}
                            >
                              {incident.id}
                            </a>
                          </td>
                          <td>{incident.crane}</td>
                          <td className="incident-title">{incident.title}</td>
                          <td>{formatDate(incident.reportedOn)}</td>
                          <td>
                            <span className={`badge ${getSeverityBadgeClass(incident.severity)}`}>
                              {incident.severity}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(incident.status)}`}>{incident.status}</span>
                          </td>
                          <td>{incident.assignedTo || "Unassigned"}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-outline-primary me-1"
                                title="View Details"
                                onClick={() => handleViewIncident(incident)}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-warning me-1"
                                title="Update Status"
                                onClick={() => handleEditIncident(incident)}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-info"
                                title="Assign"
                                onClick={() => handleAssignIncident(incident)}
                              >
                                <UserPlus size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          No incidents found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="incidents-pagination">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`btn btn-sm ${pagination.currentPage === page ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

            {/* Report Incident Button (Fixed) */}
            <div className="report-incident-button">
              <button
                className="btn btn-danger btn-lg rounded-circle shadow"
                onClick={handleReportIncident}
                title="Report New Incident"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
        )}

        {/* Incident History Tab */}
        {activeTab === "history" && (
          <div className="incident-history-container">
            <div className="incidents-header-actions">
              <h3 className="section-title">Incident History</h3>
              <div className="header-buttons">
                <button className="btn btn-primary me-2" onClick={handleRefresh}>
                  <RefreshCw size={16} className="me-1" />
                  Refresh
                </button>
                <button className="btn btn-primary" onClick={handleExport}>
                  <FileText size={16} className="me-1" />
                  Export
                </button>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="date-range-filter mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-2">
                      <label className="form-label">Date Range:</label>
                    </div>
                    <div className="col-md-4">
                      <div className="input-group">
                        <span className="input-group-text">
                          <Calendar size={16} />
                        </span>
                        <input
                          type="date"
                          className="form-control"
                          value={filters.dateRange.start}
                          onChange={(e) => handleDateRangeChange("start", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-1 text-center">
                      <span>to</span>
                    </div>
                    <div className="col-md-4">
                      <div className="input-group">
                        <span className="input-group-text">
                          <Calendar size={16} />
                        </span>
                        <input
                          type="date"
                          className="form-control"
                          value={filters.dateRange.end}
                          onChange={(e) => handleDateRangeChange("end", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-1">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => {
                          handleDateRangeChange("start", "")
                          handleDateRangeChange("end", "")
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Incidents Table (same as Active Incidents) */}
            <div className="incidents-table-container">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Crane</th>
                      <th>Title</th>
                      <th>Reported On</th>
                      <th>Resolved On</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncidents.length > 0 ? (
                      filteredIncidents.map((incident) => (
                        <tr key={incident.id}>
                          <td className="incident-id">
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                handleViewIncident(incident)
                              }}
                            >
                              {incident.id}
                            </a>
                          </td>
                          <td>{incident.crane}</td>
                          <td className="incident-title">{incident.title}</td>
                          <td>{formatDate(incident.reportedOn)}</td>
                          <td>{incident.resolvedOn ? formatDate(incident.resolvedOn) : "-"}</td>
                          <td>
                            <span className={`badge ${getSeverityBadgeClass(incident.severity)}`}>
                              {incident.severity}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(incident.status)}`}>{incident.status}</span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                title="View Details"
                                onClick={() => handleViewIncident(incident)}
                              >
                                <Eye size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          No incidents found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination (same as Active Incidents) */}
            {pagination.totalPages > 1 && (
              <div className="incidents-pagination">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`btn btn-sm ${pagination.currentPage === page ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analytics & Trends Tab */}
        {activeTab === "analytics" && (
          <div className="analytics-container">
            <div className="incidents-header-actions">
              <h3 className="section-title">Analytics & Trends</h3>
              <div className="header-buttons">
                <button className="btn btn-primary me-2" onClick={handleRefresh}>
                  <RefreshCw size={16} className="me-1" />
                  Refresh
                </button>
                <button className="btn btn-primary" onClick={handleExport}>
                  <FileText size={16} className="me-1" />
                  Export
                </button>
              </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="analytics-dashboard">
              {/* Summary Cards */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="stat-icon bg-danger-subtle text-danger me-3">
                          <AlertOctagon size={24} />
                        </div>
                        <div>
                          <h6 className="stat-title mb-1">Total Incidents</h6>
                          <div className="stat-value">42</div>
                          <div className="stat-change text-success">
                            <ArrowUpRight size={14} className="me-1" />
                            12% increase
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="stat-icon bg-warning-subtle text-warning me-3">
                          <Clock size={24} />
                        </div>
                        <div>
                          <h6 className="stat-title mb-1">Avg. Resolution Time</h6>
                          <div className="stat-value">3.2 days</div>
                          <div className="stat-change text-success">
                            <ArrowUpRight size={14} className="me-1" transform="rotate(180)" />
                            8% decrease
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="stat-icon bg-success-subtle text-success me-3">
                          <CheckCircle size={24} />
                        </div>
                        <div>
                          <h6 className="stat-title mb-1">Resolution Rate</h6>
                          <div className="stat-value">87%</div>
                          <div className="stat-change text-success">
                            <ArrowUpRight size={14} className="me-1" />
                            5% increase
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="stat-icon bg-info-subtle text-info me-3">
                          <BarChart2 size={24} />
                        </div>
                        <div>
                          <h6 className="stat-title mb-1">Critical Incidents</h6>
                          <div className="stat-value">7</div>
                          <div className="stat-change text-danger">
                            <ArrowUpRight size={14} className="me-1" />
                            2% increase
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <h5 className="mb-0">Incidents by Severity</h5>
                    </div>
                    <div className="card-body">
                      <div className="chart-placeholder">
                        <div className="chart-content">
                          <div className="chart-bar critical" style={{ width: "25%" }}>
                            <span className="chart-label">Critical</span>
                            <span className="chart-value">7</span>
                          </div>
                          <div className="chart-bar high" style={{ width: "40%" }}>
                            <span className="chart-label">High</span>
                            <span className="chart-value">12</span>
                          </div>
                          <div className="chart-bar moderate" style={{ width: "60%" }}>
                            <span className="chart-label">Moderate</span>
                            <span className="chart-value">18</span>
                          </div>
                          <div className="chart-bar minor" style={{ width: "20%" }}>
                            <span className="chart-label">Minor</span>
                            <span className="chart-value">5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <h5 className="mb-0">Incidents by Crane</h5>
                    </div>
                    <div className="card-body">
                      <div className="chart-placeholder">
                        <div className="chart-content">
                          <div className="chart-bar crane-1" style={{ width: "80%" }}>
                            <span className="chart-label">Crane #C-001</span>
                            <span className="chart-value">15</span>
                          </div>
                          <div className="chart-bar crane-2" style={{ width: "45%" }}>
                            <span className="chart-label">Crane #C-002</span>
                            <span className="chart-value">9</span>
                          </div>
                          <div className="chart-bar crane-3" style={{ width: "35%" }}>
                            <span className="chart-label">Crane #C-003</span>
                            <span className="chart-value">7</span>
                          </div>
                          <div className="chart-bar crane-4" style={{ width: "55%" }}>
                            <span className="chart-label">Crane #C-004</span>
                            <span className="chart-value">11</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-8">
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <h5 className="mb-0">Incidents Over Time</h5>
                    </div>
                    <div className="card-body">
                      <div className="chart-placeholder time-series">
                        <div className="time-series-line"></div>
                        <div className="time-series-points">
                          <div className="point" style={{ left: "10%", bottom: "30%" }}></div>
                          <div className="point" style={{ left: "20%", bottom: "40%" }}></div>
                          <div className="point" style={{ left: "30%", bottom: "20%" }}></div>
                          <div className="point" style={{ left: "40%", bottom: "50%" }}></div>
                          <div className="point" style={{ left: "50%", bottom: "35%" }}></div>
                          <div className="point" style={{ left: "60%", bottom: "60%" }}></div>
                          <div className="point" style={{ left: "70%", bottom: "45%" }}></div>
                          <div className="point" style={{ left: "80%", bottom: "70%" }}></div>
                          <div className="point" style={{ left: "90%", bottom: "55%" }}></div>
                        </div>
                        <div className="time-series-labels">
                          <span style={{ left: "10%" }}>Jan</span>
                          <span style={{ left: "20%" }}>Feb</span>
                          <span style={{ left: "30%" }}>Mar</span>
                          <span style={{ left: "40%" }}>Apr</span>
                          <span style={{ left: "50%" }}>May</span>
                          <span style={{ left: "60%" }}>Jun</span>
                          <span style={{ left: "70%" }}>Jul</span>
                          <span style={{ left: "80%" }}>Aug</span>
                          <span style={{ left: "90%" }}>Sep</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <h5 className="mb-0">Top Issue Categories</h5>
                    </div>
                    <div className="card-body">
                      <ul className="list-group">
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          Hydraulic System
                          <span className="badge bg-primary rounded-pill">14</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          Control Panel
                          <span className="badge bg-primary rounded-pill">8</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          Mechanical Failure
                          <span className="badge bg-primary rounded-pill">7</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          Electrical Issues
                          <span className="badge bg-primary rounded-pill">6</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          Operator Error
                          <span className="badge bg-primary rounded-pill">4</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="card shadow-sm mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Key Insights & Recommendations</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="insight-card">
                        <div className="insight-icon bg-danger-subtle text-danger">
                          <AlertTriangle size={24} />
                        </div>
                        <h6>Hydraulic System Issues</h6>
                        <p>
                          Hydraulic system failures account for 33% of all critical incidents. Recommend implementing
                          more frequent preventive maintenance checks.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="insight-card">
                        <div className="insight-icon bg-warning-subtle text-warning">
                          <Clock size={24} />
                        </div>
                        <h6>Resolution Time Improvement</h6>
                        <p>
                          Average resolution time has decreased by 8% this quarter. Continue to optimize parts inventory
                          and technician scheduling.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="insight-card">
                        <div className="insight-icon bg-info-subtle text-info">
                          <Sliders size={24} />
                        </div>
                        <h6>Crane #C-001 Maintenance</h6>
                        <p>
                          Crane #C-001 has 36% of all incidents. Recommend comprehensive inspection and potential
                          component replacement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Incident Detail Modal */}
      {showDetailModal && selectedIncident && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Incident Details: {selectedIncident.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="incident-detail-header mb-4">
                  <div className="row">
                    <div className="col-md-8">
                      <h4>{selectedIncident.title}</h4>
                      <div className="incident-meta">
                        <span className={`badge ${getSeverityBadgeClass(selectedIncident.severity)} me-2`}>
                          {selectedIncident.severity}
                        </span>
                        <span className={`badge ${getStatusBadgeClass(selectedIncident.status)} me-2`}>
                          {selectedIncident.status}
                        </span>
                        <span className="text-muted">Reported on {formatDateTime(selectedIncident.reportedOn)}</span>
                      </div>
                    </div>
                    <div className="col-md-4 text-end">
                      <div className="incident-actions">
                        <button
                          className="btn btn-outline-primary me-2"
                          onClick={() => {
                            setShowDetailModal(false)
                            handleEditIncident(selectedIncident)
                          }}
                        >
                          <Edit size={16} className="me-1" />
                          Update
                        </button>
                        <button
                          className="btn btn-outline-info"
                          onClick={() => {
                            setShowDetailModal(false)
                            handleAssignIncident(selectedIncident)
                          }}
                        >
                          <UserPlus size={16} className="me-1" />
                          Assign
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-8">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Description</h6>
                      </div>
                      <div className="card-body">
                        <p>{selectedIncident.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Details</h6>
                      </div>
                      <div className="card-body">
                        <div className="detail-item">
                          <span className="detail-label">Crane:</span>
                          <span className="detail-value">{selectedIncident.crane}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Reported By:</span>
                          <span className="detail-value">{selectedIncident.reportedBy}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Assigned To:</span>
                          <span className="detail-value">{selectedIncident.assignedTo || "Unassigned"}</span>
                        </div>
                        {selectedIncident.priority && (
                          <div className="detail-item">
                            <span className="detail-label">Priority:</span>
                            <span className="detail-value">
                              <span className={`badge ${getPriorityBadgeClass(selectedIncident.priority)}`}>
                                {selectedIncident.priority}
                              </span>
                            </span>
                          </div>
                        )}
                        {selectedIncident.dueDate && (
                          <div className="detail-item">
                            <span className="detail-label">Due Date:</span>
                            <span className="detail-value">{formatDate(selectedIncident.dueDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedIncident.attachments && selectedIncident.attachments.length > 0 && (
                  <div className="card mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">Attachments</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        {selectedIncident.attachments.map((attachment, index) => (
                          <div key={index} className="col-md-3 mb-3">
                            <div className="attachment-card">
                              <div className="attachment-icon">
                                <i className="bi bi-file-earmark"></i>
                              </div>
                              <div className="attachment-info">
                                <div className="attachment-name">{attachment.name}</div>
                                <div className="attachment-size">{(attachment.size / 1024).toFixed(1)} KB</div>
                              </div>
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="attachment-download"
                              >
                                <Download size={14} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedIncident.updates && selectedIncident.updates.length > 0 && (
                  <div className="card mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">Updates</h6>
                    </div>
                    <div className="card-body">
                      <div className="updates-timeline">
                        {selectedIncident.updates.map((update, index) => (
                          <div key={index} className="update-item">
                            <div className="update-badge">
                              <span className={`badge ${getStatusBadgeClass(update.status)}`}>{update.status}</span>
                            </div>
                            <div className="update-content">
                              <div className="update-header">
                                <span className="update-by">{update.updatedBy}</span>
                                <span className="update-time">{formatDateTime(update.timestamp)}</span>
                              </div>
                              <div className="update-comment">{update.comment}</div>
                              {update.attachments && update.attachments.length > 0 && (
                                <div className="update-attachments">
                                  <h6>Attachments:</h6>
                                  <div className="row">
                                    {update.attachments.map((attachment, idx) => (
                                      <div key={idx} className="col-md-3 mb-2">
                                        <div className="attachment-card small">
                                          <div className="attachment-icon">
                                            <i className="bi bi-file-earmark"></i>
                                          </div>
                                          <div className="attachment-info">
                                            <div className="attachment-name">{attachment.name}</div>
                                          </div>
                                          <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="attachment-download"
                                          >
                                            <Download size={12} />
                                          </a>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary me-2"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary me-2"
                  onClick={() => {
                    setShowDetailModal(false)
                    handleEditIncident(selectedIncident)
                  }}
                >
                  <Edit size={16} className="me-1" />
                  Update Status
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowDetailModal(false)
                    handleAssignIncident(selectedIncident)
                  }}
                >
                  <UserPlus size={16} className="me-1" />
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Incident Modal */}
      {showUpdateModal && selectedIncident && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Incident Status</h5>
                <button type="button" className="btn-close" onClick={() => setShowUpdateModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Incident ID</label>
                    <input type="text" className="form-control" value={selectedIncident.id} disabled />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Current Status</label>
                    <input type="text" className="form-control" value={selectedIncident.status} disabled />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Status *</label>
                    <select
                      className="form-select"
                      value={incidentUpdate.status}
                      onChange={(e) => handleUpdateFormChange("status", e.target.value)}
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending Parts">Pending Parts</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Comment *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Provide details about this update"
                      value={incidentUpdate.comment}
                      onChange={(e) => handleUpdateFormChange("comment", e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Attachments</label>
                    <div className="attachment-controls">
                      <button
                        type="button"
                        className="btn btn-outline-primary me-2"
                        onClick={() => updateFileInputRef.current.click()}
                      >
                        <FileUp size={16} className="me-1" />
                        Upload Files
                      </button>
                      <input
                        type="file"
                        ref={updateFileInputRef}
                        style={{ display: "none" }}
                        multiple
                        onChange={(e) => handleFileUpload(e, "update")}
                      />
                    </div>
                    {incidentUpdate.attachments.length > 0 && (
                      <div className="attachment-list mt-3">
                        <h6>Attached Files:</h6>
                        <ul className="list-group">
                          {incidentUpdate.attachments.map((file, index) => (
                            <li
                              key={index}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <i className="bi bi-file-earmark me-2"></i>
                                {file.name} ({(file.size / 1024).toFixed(1)} KB)
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveAttachment(index, "update")}
                              >
                                <Trash2 size={14} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSubmitUpdate}>
                  Update Incident
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Incident Modal */}
      {showAssignModal && selectedIncident && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Incident</h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Incident ID</label>
                    <input type="text" className="form-control" value={selectedIncident.id} disabled />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Incident Title</label>
                    <input type="text" className="form-control" value={selectedIncident.title} disabled />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Assign To *</label>
                    <select
                      className="form-select"
                      value={incidentAssignment.assignedTo}
                      onChange={(e) => handleAssignmentFormChange("assignedTo", e.target.value)}
                      required
                    >
                      <option value="">Select Technician or Team</option>
                      <option value="Team A">Team A</option>
                      <option value="Team B">Team B</option>
                      <option value="John Doe">John Doe</option>
                      <option value="Jane Smith">Jane Smith</option>
                      <option value="Mike Johnson">Mike Johnson</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={incidentAssignment.priority}
                      onChange={(e) => handleAssignmentFormChange("priority", e.target.value)}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={incidentAssignment.dueDate}
                      onChange={(e) => handleAssignmentFormChange("dueDate", e.target.value)}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSubmitAssignment}>
                  Assign Incident
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filter Modal */}
      {showFilterModal && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <Filter size={18} className="me-2" />
                  Advanced Filters
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowFilterModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Date Range</label>
                    <div className="input-group mb-2">
                      <span className="input-group-text">From</span>
                      <input
                        type="date"
                        className="form-control"
                        value={filters.dateRange.start}
                        onChange={(e) => handleDateRangeChange("start", e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <span className="input-group-text">To</span>
                      <input
                        type="date"
                        className="form-control"
                        value={filters.dateRange.end}
                        onChange={(e) => handleDateRangeChange("end", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Priority</label>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="highPriority" />
                      <label className="form-check-label" htmlFor="highPriority">
                        High
                      </label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="mediumPriority" />
                      <label className="form-check-label" htmlFor="mediumPriority">
                        Medium
                      </label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="lowPriority" />
                      <label className="form-check-label" htmlFor="lowPriority">
                        Low
                      </label>
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Reported By</label>
                    <input type="text" className="form-control" placeholder="Enter name" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Tags</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Tag size={16} />
                      </span>
                      <input type="text" className="form-control" placeholder="Enter tags" />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <label className="form-label">Components</label>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" id="hydraulicSystem" />
                          <label className="form-check-label" htmlFor="hydraulicSystem">
                            Hydraulic System
                          </label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" id="controlPanel" />
                          <label className="form-check-label" htmlFor="controlPanel">
                            Control Panel
                          </label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" id="engine" />
                          <label className="form-check-label" htmlFor="engine">
                            Engine
                          </label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" id="electrical" />
                          <label className="form-check-label" htmlFor="electrical">
                            Electrical System
                          </label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" id="structural" />
                          <label className="form-check-label" htmlFor="structural">
                            Structural Components
                          </label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="checkbox" id="software" />
                          <label className="form-check-label" htmlFor="software">
                            Software/Firmware
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowFilterModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-outline-secondary me-2">
                  Reset Filters
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setShowFilterModal(false)}>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FileText size={18} className="me-2" />
                  Export Incidents
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowExportModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Export Format</label>
                  <div className="d-flex">
                    <div className="form-check me-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="exportFormat"
                        id="formatPDF"
                        checked={exportOptions.format === "PDF"}
                        onChange={() => setExportOptions({ ...exportOptions, format: "PDF" })}
                      />
                      <label className="form-check-label" htmlFor="formatPDF">
                        PDF
                      </label>
                    </div>
                    <div className="form-check me-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="exportFormat"
                        id="formatExcel"
                        checked={exportOptions.format === "Excel"}
                        onChange={() => setExportOptions({ ...exportOptions, format: "Excel" })}
                      />
                      <label className="form-check-label" htmlFor="formatExcel">
                        Excel
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="exportFormat"
                        id="formatCSV"
                        checked={exportOptions.format === "CSV"}
                        onChange={() => setExportOptions({ ...exportOptions, format: "CSV" })}
                      />
                      <label className="form-check-label" htmlFor="formatCSV">
                        CSV
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Date Range</label>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="input-group mb-2">
                        <span className="input-group-text">From</span>
                        <input
                          type="date"
                          className="form-control"
                          value={exportOptions.dateRange.start}
                          onChange={(e) =>
                            setExportOptions({
                              ...exportOptions,
                              dateRange: { ...exportOptions.dateRange, start: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="input-group">
                        <span className="input-group-text">To</span>
                        <input
                          type="date"
                          className="form-control"
                          value={exportOptions.dateRange.end}
                          onChange={(e) =>
                            setExportOptions({
                              ...exportOptions,
                              dateRange: { ...exportOptions.dateRange, end: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Include</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="includeAttachments"
                      checked={exportOptions.includeAttachments}
                      onChange={() =>
                        setExportOptions({
                          ...exportOptions,
                          includeAttachments: !exportOptions.includeAttachments,
                        })
                      }
                    />
                    <label className="form-check-label" htmlFor="includeAttachments">
                      Attachments
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="includeComments"
                      checked={exportOptions.includeComments}
                      onChange={() =>
                        setExportOptions({
                          ...exportOptions,
                          includeComments: !exportOptions.includeComments,
                        })
                      }
                    />
                    <label className="form-check-label" htmlFor="includeComments">
                      Comments and Updates
                    </label>
                  </div>
                </div>
                <div className="export-actions">
                  <button className="btn btn-outline-primary me-2">
                    <Printer size={16} className="me-1" />
                    Print
                  </button>
                  <button className="btn btn-outline-primary">
                    <Clipboard size={16} className="me-1" />
                    Copy to Clipboard
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowExportModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleExportConfirm}>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal backdrop */}
      {(showDetailModal || showUpdateModal || showAssignModal || showFilterModal || showExportModal) && (
        <div className="modal-backdrop fade show"></div>
      )}

      {/* CSS Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .incidents-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Roboto', sans-serif;
          }
          
          .incidents-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          
          .search-container {
            width: 350px;
          }
          
          .incidents-title-container {
            margin-bottom: 1.5rem;
          }
          
          .incidents-title {
            display: flex;
            align-items: center;
            font-weight: 600;
            color: #343a40;
            margin-bottom: 1rem;
          }
          
          .incidents-tabs {
            display: flex;
            border-bottom: 1px solid #dee2e6;
            margin-bottom: 1.5rem;
          }
          
          .incidents-tab {
            padding: 0.75rem 1.5rem;
            cursor: pointer;
            font-weight: 500;
            color: #6c757d;
            border-bottom: 2px solid transparent;
            transition: all 0.2s ease;
          }
          
          .incidents-tab:hover {
            color: #343a40;
          }
          
          .incidents-tab.active {
            color: #0d6efd;
            border-bottom-color: #0d6efd;
          }
          
          .incidents-header-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          
          .section-title {
            margin: 0;
            font-weight: 600;
          }
          
          .header-buttons {
            display: flex;
          }
          
          .incidents-filters {
            background-color: #f8f9fa;
            border-radius: 0.375rem;
            padding: 1rem;
            margin-bottom: 1.5rem;
          }
          
          .filter-label {
            font-weight: 500;
            margin-bottom: 0.5rem;
          }
          
          .advanced-filters-toggle {
            display: flex;
            justify-content: flex-end;
            margin-top: 0.5rem;
          }
          
          .incidents-table-container {
            background-color: #fff;
            border-radius: 0.375rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            margin-bottom: 1.5rem;
            overflow: hidden;
          }
          
          .incident-id a {
            font-weight: 500;
            color: #0d6efd;
            text-decoration: none;
          }
          
          .incident-id a:hover {
            text-decoration: underline;
          }
          
          .incident-title {
            max-width: 300px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .action-buttons {
            display: flex;
          }
          
          .incidents-pagination {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 1.5rem;
          }
          
          .report-incident-button {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            z-index: 100;
          }
          
          .report-incident-button .btn {
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .attachment-controls {
            display: flex;
          }
          
          .detail-item {
            display: flex;
            margin-bottom: 0.75rem;
          }
          
          .detail-label {
            font-weight: 500;
            width: 40%;
            color: #6c757d;
          }
          
          .detail-value {
            width: 60%;
          }
          
          .attachment-card {
            display: flex;
            align-items: center;
            background-color: #f8f9fa;
            border-radius: 0.375rem;
            padding: 0.75rem;
            height: 100%;
          }
          
          .attachment-card.small {
            padding: 0.5rem;
          }
          
          .attachment-icon {
            font-size: 1.5rem;
            margin-right: 0.75rem;
            color: #6c757d;
          }
          
          .attachment-info {
            flex: 1;
            overflow: hidden;
          }
          
          .attachment-name {
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .attachment-size {
            font-size: 0.875rem;
            color: #6c757d;
          }
          
          .attachment-download {
            color: #6c757d;
            transition: color 0.2s ease;
          }
          
          .attachment-download:hover {
            color: #0d6efd;
          }
          
          .updates-timeline {
            position: relative;
          }
          
          .update-item {
            display: flex;
            margin-bottom: 1.5rem;
            position: relative;
          }
          
          .update-item:last-child {
            margin-bottom: 0;
          }
          
          .update-badge {
            margin-right: 1rem;
            flex-shrink: 0;
          }
          
          .update-content {
            flex: 1;
            background-color: #f8f9fa;
            border-radius: 0.375rem;
            padding: 1rem;
          }
          
          .update-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
          }
          
          .update-by {
            font-weight: 500;
          }
          
          .update-time {
            color: #6c757d;
            font-size: 0.875rem;
          }
          
          .update-comment {
            margin-bottom: 0.75rem;
          }
          
          .update-attachments h6 {
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
          }
          
          .incident-detail-header {
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 1rem;
          }
          
          .incident-meta {
            display: flex;
            align-items: center;
            margin-top: 0.5rem;
          }
          
          .incident-actions {
            display: flex;
            justify-content: flex-end;
          }
          
          .export-actions {
            display: flex;
            margin-top: 1rem;
          }
          
          .incidents-loading {
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
            border-top: 5px solid #0d6efd;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Analytics styles */
          .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .stat-title {
            color: #6c757d;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .stat-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: #343a40;
          }
          
          .stat-change {
            display: flex;
            align-items: center;
            font-size: 0.875rem;
          }
          
          .chart-placeholder {
            height: 300px;
            display: flex;
            align-items: flex-end;
            padding: 1rem;
            position: relative;
          }
          
          .chart-content {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .chart-bar {
            height: 30px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            padding: 0 1rem;
            color: white;
            font-weight: 500;
            position: relative;
          }
          
          .chart-bar.critical {
            background-color: #dc3545;
          }
          
          .chart-bar.high {
            background-color: #fd7e14;
          }
          
          .chart-bar.moderate {
            background-color: #ffc107;
          }
          
          .chart-bar.minor {
            background-color: #28a745;
          }
          
          .chart-bar.crane-1 {
            background-color: #0d6efd;
          }
          
          .chart-bar.crane-2 {
            background-color: #6610f2;
          }
          
          .chart-bar.crane-3 {
            background-color: #6f42c1;
          }
          
          .chart-bar.crane-4 {
            background-color: #d63384;
          }
          
          .chart-label {
            flex: 1;
          }
          
          .chart-value {
            font-weight: 700;
          }
          
          .time-series {
            position: relative;
          }
          
          .time-series-line {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 50px;
            height: 2px;
            background-color: #dee2e6;
          }
          
          .time-series-points {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 50px;
            height: 200px;
          }
          
          .time-series-points .point {
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: #0d6efd;
            border-radius: 50%;
            transform: translate(-50%, 50%);
          }
          
          .time-series-points .point::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(13, 110, 253, 0.2);
            border-radius: 50%;
            transform: scale(2);
          }
          
          .time-series-labels {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 20px;
            display: flex;
            justify-content: space-between;
          }
          
          .time-series-labels span {
            font-size: 0.75rem;
            color: #6c757d;
            transform: translateX(-50%);
            position: absolute;
          }
          
          .insight-card {
            background-color: #f8f9fa;
            border-radius: 0.375rem;
            padding: 1.25rem;
            height: 100%;
          }
          
          .insight-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
          }
          
          .insight-card h6 {
            font-weight: 600;
            margin-bottom: 0.75rem;
          }
          
          .insight-card p {
            color: #6c757d;
            margin-bottom: 0;
          }
          
          /* Responsive styles */
          @media (max-width: 992px) {
            .incidents-header {
              flex-direction: column;
              align-items: flex-start;
            }
            
            .search-container {
              width: 100%;
              margin-bottom: 1rem;
            }
            
            .incidents-header-actions {
              flex-direction: column;
              align-items: flex-start;
            }
            
            .header-buttons {
              margin-top: 1rem;
            }
            
            .chart-placeholder {
              height: 250px;
            }
          }
          
          @media (max-width: 768px) {
            .incidents-tabs {
              flex-wrap: wrap;
            }
            
            .incidents-tab {
              flex: 1 0 50%;
              text-align: center;
            }
            
            .chart-placeholder {
              height: 200px;
            }
            
            .action-buttons {
              flex-direction: column;
              gap: 0.5rem;
            }
          }
          
          /* Purple badge for "Pending Parts" status */
          .bg-purple-subtle {
            background-color: #e2d9f3;
          }
          
          .text-purple {
            color: #6f42c1;
          }
          `,
        }}
      />
    </div>
  )
}

// Helper function to generate mock incidents
const generateMockIncidents = (type) => {
  const now = new Date()

  // Active incidents
  const activeIncidents = [
    {
      id: "INC-2023-042",
      crane: "Crane #C-004",
      title: "Hydraulic system pressure loss",
      description:
        "Operator reported significant pressure loss in the hydraulic system during lifting operations. The crane was unable to maintain load at maximum extension.",
      severity: "Critical",
      status: "In Progress",
      reportedOn: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2).toISOString(),
      reportedBy: "John Smith",
      assignedTo: "Team A",
      attachments: [
        {
          name: "hydraulic_pressure_reading.jpg",
          size: 1024 * 1024 * 1.2,
          type: "image/jpeg",
          url: "#",
        },
        {
          name: "maintenance_log.pdf",
          size: 1024 * 512,
          type: "application/pdf",
          url: "#",
        },
      ],
      updates: [
        {
          timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString(),
          status: "In Progress",
          comment: "Initial inspection shows possible leak in the main hydraulic line. Ordered replacement parts.",
          updatedBy: "Mike Johnson",
          attachments: [],
        },
      ],
      priority: "High",
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString(),
    },
    {
      id: "INC-2023-041",
      crane: "Crane #C-002",
      title: "Control panel unresponsive",
      description:
        "Control panel becomes unresponsive intermittently. Operator needs to restart the system to regain control.",
      severity: "Moderate",
      status: "Reported",
      reportedOn: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3).toISOString(),
      reportedBy: "Sarah Williams",
      assignedTo: null,
      attachments: [],
      updates: [],
      priority: null,
      dueDate: null,
    },
    {
      id: "INC-2023-040",
      crane: "Crane #C-003",
      title: "Unusual vibration in rotation mechanism",
      description: "Unusual vibration detected when rotating the crane. Noise increases with load.",
      severity: "Minor",
      status: "Pending Parts",
      reportedOn: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4).toISOString(),
      reportedBy: "Robert Brown",
      assignedTo: "Team B",
      attachments: [
        {
          name: "vibration_analysis.xlsx",
          size: 1024 * 256,
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          url: "#",
        },
      ],
      updates: [
        {
          timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3).toISOString(),
          status: "Assigned",
          comment: "Assigned to Team B for investigation.",
          updatedBy: "Jane Smith",
          attachments: [],
        },
        {
          timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2).toISOString(),
          status: "In Progress",
          comment: "Initial inspection shows wear on the slew bearing. Need to order replacement parts.",
          updatedBy: "Team B",
          attachments: [],
        },
        {
          timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString(),
          status: "Pending Parts",
          comment: "Parts ordered. Expected delivery in 3-5 business days.",
          updatedBy: "Team B",
          attachments: [],
        },
      ],
      priority: "Medium",
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5).toISOString(),
    },
  ]

  // Historical incidents (resolved/closed)
  const historicalIncidents = [
    {
      id: "INC-2023-039",
      crane: "Crane #C-001",
      title: "Overload sensor malfunction",
      description: "Overload sensor triggering false alarms during normal operation.",
      severity: "High",
      status: "Resolved",
      reportedOn: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10).toISOString(),
      reportedBy: "Mike Johnson",
      assignedTo: "John Doe",
      resolvedOn: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString(),
      attachments: [],
      updates: [
        {
          timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 9).toISOString(),
          status: "Assigned",
          comment: "Assigned to John Doe for investigation.",
          updatedBy: "Jane Smith",
          attachments: [],
        },
        {
          timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 8).toISOString(),
          status: "In Progress",
          comment: "Initial inspection shows calibration issue with the sensor.",
          updatedBy: "John Doe",
          attachments: [],
        },
        {
          timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString(),
          status: "Resolved",
          comment: "Sensor recalibrated and tested. Working properly now.",
          updatedBy: "John Doe",
          attachments: [],
        },
      ],
      priority: "High",
      dueDate: null,
    },
    {
      id: "INC-2023-038",
      crane: "Crane #C-002",
      title: "Fuel leak",
      description: "Fuel leak detected near the engine compartment.",
      severity: "Critical",
      status: "Closed",
      reportedOn: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15).toISOString(),
      reportedBy: "Sarah Williams",
      assignedTo: "Team A",
      resolvedOn: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12).toISOString(),
      attachments: [],
      updates: [
        {
          timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14).toISOString(),
          status: "Assigned",
          comment: "Assigned to Team A for immediate repair.",
          updatedBy: "Jane Smith",
          attachments: [],
        },
        {
          timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13).toISOString(),
          status: "In Progress",
          comment: "Identified damaged fuel line. Replacing component.",
          updatedBy: "Team A",
          attachments: [],
        },
        {
          timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12).toISOString(),
          status: "Resolved",
          comment: "Fuel line replaced and tested. No leaks detected.",
          updatedBy: "Team A",
          attachments: [],
        },
        {
          timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 11).toISOString(),
          status: "Closed",
          comment: "Incident verified and closed.",
          updatedBy: "Jane Smith",
          attachments: [],
        },
      ],
      priority: "High",
      dueDate: null,
    },
    {
      id: "INC-2023-037",
      crane: "Crane #C-004",
      title: "Electrical system failure",
      description: "Complete electrical system failure during operation.",
      severity: "Critical",
      status: "Closed",
      reportedOn: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 20).toISOString(),
      reportedBy: "Robert Brown",
      assignedTo: "Team B",
      resolvedOn: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 16).toISOString(),
      attachments: [],
      updates: [
        {
          timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 19).toISOString(),
          status: "Assigned",
          comment: "Assigned to Team B for investigation.",
          updatedBy: "Jane Smith",
          attachments: [],
        },
        {
          timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 18).toISOString(),
          status: "In Progress",
          comment: "Initial inspection shows main circuit breaker failure.",
          updatedBy: "Team B",
          attachments: [],
        },
        {
          timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 17).toISOString(),
          status: "Pending Parts",
          comment: "Ordered replacement circuit breaker. Expected delivery tomorrow.",
          updatedBy: "Team B",
          attachments: [],
        },
        {
          timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 16).toISOString(),
          status: "Resolved",
          comment: "Circuit breaker replaced and tested. Electrical system functioning normally.",
          updatedBy: "Team B",
          attachments: [],
        },
        {
          timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15).toISOString(),
          status: "Closed",
          comment: "Incident verified and closed.",
          updatedBy: "Jane Smith",
          attachments: [],
        },
      ],
      priority: "High",
      dueDate: null,
    },
  ]

  // Return appropriate incidents based on type
  if (type === "active") {
    return activeIncidents
  } else if (type === "history") {
    return historicalIncidents
  } else {
    return [...activeIncidents, ...historicalIncidents]
  }
}

export default IncidentManagement

