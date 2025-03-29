"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import "bootstrap/dist/css/bootstrap.min.css"

// Icons
import {
  Wrench,
  Calendar,
  UserCheck,
  FileText,
  Upload,
  FileBarChart,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Minus,
  Eye,
  Edit,
  Check,
  Trash2,
  RotateCcw,
  Search,
  Bell,
  HelpCircle,
  X,
} from "lucide-react"

const MaintenanceManagement = () => {
  // State for maintenance tasks
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [selectedTasks, setSelectedTasks] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  // State for filters
  const [filters, setFilters] = useState({
    status: "All Status",
    crane: "All Cranes",
    technician: "All Technicians",
    type: "All Types",
    startDate: "",
    endDate: "",
  })

  // State for statistics
  const [stats, setStats] = useState({
    completed: { count: 0, change: 0 },
    upcoming: { count: 0, change: 0 },
    overdue: { count: 0, change: 0 },
    compliance: { rate: 0, change: 0 },
  })

  // State for modals
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)

  // Notification state
  const [notificationCount, setNotificationCount] = useState(5)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])

  // Mock data for maintenance tasks
  useEffect(() => {
    const mockTasks = [
      {
        id: "M-1025",
        crane: "C-001",
        task: "Quarterly Hydraulic Inspection",
        description: "Check hydraulic system for leaks and pressure",
        type: "Inspection",
        assignedTo: "John Doe",
        dueDate: "2023-08-25",
        status: "Scheduled",
        createdAt: "2023-07-25",
        priority: "Medium",
        estimatedHours: 4,
        actualHours: null,
        notes: "Last inspection showed minor pressure fluctuations",
        parts: ["Pressure gauge", "Hydraulic fluid"],
      },
      {
        id: "M-1024",
        crane: "C-002",
        task: "Replace Worn Cables",
        description: "Replace main hoist cables showing signs of wear",
        type: "Repair",
        assignedTo: "Mike Jones",
        dueDate: "2023-08-22",
        status: "In Progress",
        createdAt: "2023-08-15",
        priority: "High",
        estimatedHours: 8,
        actualHours: 3,
        notes: "Cables showing 30% wear at pulley contact points",
        parts: ["Steel cable (50m)", "Cable clamps", "Thimbles"],
      },
      {
        id: "M-1023",
        crane: "C-003",
        task: "Motor Bearing Replacement",
        description: "Replace main motor bearings showing excessive wear",
        type: "Repair",
        assignedTo: "Jane Smith",
        dueDate: "2023-08-15",
        status: "Overdue",
        createdAt: "2023-08-01",
        priority: "Critical",
        estimatedHours: 6,
        actualHours: null,
        notes: "Bearing noise detected during last operation",
        parts: ["Bearing set", "Bearing puller", "Lubricant"],
      },
      {
        id: "M-1022",
        crane: "C-001",
        task: "Annual Safety Inspection",
        description: "Complete annual safety certification inspection",
        type: "Inspection",
        assignedTo: "John Doe",
        dueDate: "2023-09-15",
        status: "Scheduled",
        createdAt: "2023-07-15",
        priority: "High",
        estimatedHours: 8,
        actualHours: null,
        notes: "Regulatory compliance requirement",
        parts: ["Safety checklist", "Certification forms"],
      },
      {
        id: "M-1021",
        crane: "C-001",
        task: "Lubricate Slew Bearing",
        description: "Apply lubrication to slew bearing and check rotation",
        type: "Preventive",
        assignedTo: "Mike Jones",
        dueDate: "2023-08-30",
        status: "Scheduled",
        createdAt: "2023-08-10",
        priority: "Medium",
        estimatedHours: 2,
        actualHours: null,
        notes: "Use high-temperature grease",
        parts: ["Grease gun", "High-temp grease"],
      },
      {
        id: "M-1020",
        crane: "C-004",
        task: "Electrical System Check",
        description: "Inspect all electrical connections and controls",
        type: "Inspection",
        assignedTo: "Sarah Johnson",
        dueDate: "2023-08-18",
        status: "Completed",
        createdAt: "2023-08-05",
        completedAt: "2023-08-17",
        priority: "Medium",
        estimatedHours: 3,
        actualHours: 2.5,
        notes: "All systems functioning normally",
        parts: ["Multimeter", "Electrical tape", "Wire connectors"],
      },
      {
        id: "M-1019",
        crane: "C-001",
        task: "Replace Worn Brake Pads",
        description: "Replace main hoist brake pads",
        type: "Repair",
        assignedTo: "John Doe",
        dueDate: "2023-08-10",
        status: "Completed",
        createdAt: "2023-08-01",
        completedAt: "2023-08-09",
        priority: "High",
        estimatedHours: 4,
        actualHours: 3.5,
        notes: "Brake pads were at 15% remaining thickness",
        parts: ["Brake pad set", "Brake cleaner", "Adjustment tools"],
      },
      {
        id: "M-1018",
        crane: "C-002",
        task: "Inspect Limit Switches",
        description: "Check and calibrate all limit switches",
        type: "Inspection",
        assignedTo: "Jane Smith",
        dueDate: "2023-08-05",
        status: "Completed",
        createdAt: "2023-07-25",
        completedAt: "2023-08-04",
        priority: "Medium",
        estimatedHours: 2,
        actualHours: 2,
        notes: "All limit switches functioning correctly",
        parts: ["Calibration tools"],
      },
    ]

    setTasks(mockTasks)
    setFilteredTasks(mockTasks)

    // Calculate statistics
    const completed = mockTasks.filter((task) => task.status === "Completed").length
    const upcoming = mockTasks.filter((task) => task.status === "Scheduled" || task.status === "In Progress").length
    const overdue = mockTasks.filter((task) => task.status === "Overdue").length
    const total = mockTasks.length
    const complianceRate = total > 0 ? Math.round((completed / total) * 100) : 0

    setStats({
      completed: { count: completed, change: 3 },
      upcoming: { count: upcoming, change: 0 },
      overdue: { count: overdue, change: 1 },
      compliance: { rate: complianceRate, change: 2 },
    })

    // Mock notifications
    const mockNotifications = [
      {
        id: 1,
        title: "Overdue Maintenance Task",
        message: "Motor Bearing Replacement (M-1023) is overdue by 14 days",
        time: "2 hours ago",
        type: "danger",
        read: false,
      },
      {
        id: 2,
        title: "Task Assigned",
        message: "You have been assigned to Quarterly Hydraulic Inspection (M-1025)",
        time: "Yesterday",
        type: "info",
        read: false,
      },
      {
        id: 3,
        title: "Task Completed",
        message: "Electrical System Check (M-1020) has been completed",
        time: "2 days ago",
        type: "success",
        read: false,
      },
      {
        id: 4,
        title: "Upcoming Maintenance",
        message: "Annual Safety Inspection (M-1022) is due in 7 days",
        time: "3 days ago",
        type: "warning",
        read: true,
      },
      {
        id: 5,
        title: "Part Shortage",
        message: "Required parts for Replace Worn Cables (M-1024) are low in inventory",
        time: "1 week ago",
        type: "warning",
        read: true,
      },
    ]

    setNotifications(mockNotifications)
    setNotificationCount(mockNotifications.filter((n) => !n.read).length)
  }, [])

  // Filter tasks based on current filters
  useEffect(() => {
    let filtered = [...tasks]

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.id.toLowerCase().includes(query) ||
          task.task.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.assignedTo.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (filters.status !== "All Status") {
      filtered = filtered.filter((task) => task.status === filters.status)
    }

    // Apply crane filter
    if (filters.crane !== "All Cranes") {
      filtered = filtered.filter((task) => task.crane === filters.crane)
    }

    // Apply technician filter
    if (filters.technician !== "All Technicians") {
      filtered = filtered.filter((task) => task.assignedTo === filters.technician)
    }

    // Apply type filter
    if (filters.type !== "All Types") {
      filtered = filtered.filter((task) => task.type === filters.type)
    }

    // Apply date range filter
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate)
      const end = new Date(filters.endDate)
      filtered = filtered.filter((task) => {
        const dueDate = new Date(task.dueDate)
        return dueDate >= start && dueDate <= end
      })
    }

    setFilteredTasks(filtered)
  }, [tasks, filters, searchQuery])

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "All Status",
      crane: "All Cranes",
      technician: "All Technicians",
      type: "All Types",
      startDate: "",
      endDate: "",
    })
    setSearchQuery("")
  }

  // Handle task selection
  const handleTaskSelection = (taskId) => {
    setSelectedTasks((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId)
      } else {
        return [...prev, taskId]
      }
    })
  }

  // Handle select all tasks
  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(filteredTasks.map((task) => task.id))
    }
  }

  // Handle task status change
  const handleStatusChange = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              completedAt: newStatus === "Completed" ? new Date().toISOString() : task.completedAt,
            }
          : task,
      ),
    )
  }

  // Handle task deletion
  const handleDeleteTask = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
      setSelectedTasks((prev) => prev.filter((id) => id !== taskId))
    }
  }

  // Handle view task details
  const handleViewTask = (task) => {
    setCurrentTask(task)
    setShowTaskDetailModal(true)
  }

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      ),
    )
    setNotificationCount((prev) => prev - 1)
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
    setNotificationCount(0)
  }

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch (error) {
      return dateString
    }
  }

  // Calculate days left
  const getDaysLeft = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-success text-white"
      case "In Progress":
        return "bg-primary text-white"
      case "Scheduled":
        return "bg-info text-white"
      case "Overdue":
        return "bg-danger text-white"
      default:
        return "bg-secondary text-white"
    }
  }

  // Get type badge class
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case "Inspection":
        return "bg-info-subtle text-info"
      case "Repair":
        return "bg-warning-subtle text-warning"
      case "Preventive":
        return "bg-success-subtle text-success"
      default:
        return "bg-secondary-subtle text-secondary"
    }
  }

  // Get notification type class
  const getNotificationTypeClass = (type) => {
    switch (type) {
      case "danger":
        return "notification-danger"
      case "warning":
        return "notification-warning"
      case "success":
        return "notification-success"
      case "info":
        return "notification-info"
      default:
        return ""
    }
  }

  // Schedule new task
  const handleScheduleNew = () => {
    setShowScheduleModal(true)
  }

  // Assign technician
  const handleAssignTechnician = () => {
    if (selectedTasks.length === 0) {
      alert("Please select at least one task to assign a technician.")
      return
    }
    setShowAssignModal(true)
  }

  // Generate report
  const handleGenerateReport = () => {
    alert("Generating maintenance report...")
    // In a real application, this would generate a PDF or Excel report
  }

  return (
    <div className="maintenance-management-container">
      {/* Header with search and notifications */}
      <div className="header-container">
        <div className="search-container">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search maintenance tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="notifications-container">
          <div className="notification-icon position-relative me-3" onClick={toggleNotifications}>
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {notificationCount}
              </span>
            )}
          </div>
          <div className="help-icon">
            <HelpCircle size={20} />
          </div>
        </div>

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="notifications-panel">
            <div className="notifications-header">
              <h6 className="mb-0">Notifications</h6>
              <div className="notifications-actions">
                <button className="btn btn-sm btn-link" onClick={markAllAsRead}>
                  Mark all as read
                </button>
                <button className="btn btn-sm btn-link text-danger" onClick={toggleNotifications}>
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="notifications-body">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.read ? "read" : ""} ${getNotificationTypeClass(notification.type)}`}
                  >
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">{notification.time}</div>
                    </div>
                    {!notification.read && (
                      <button className="btn btn-sm btn-link mark-read-btn" onClick={() => markAsRead(notification.id)}>
                        Mark as read
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-notifications">
                  <p>No notifications</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Title and action buttons */}
        <div className="title-container">
          <h2 className="maintenance-title mb-0">
            <Wrench className="me-2" size={28} />
            Maintenance Management
          </h2>
          <div className="action-buttons">
            <button className="btn btn-primary me-2" onClick={handleScheduleNew}>
              <Calendar size={16} className="me-1" />
              Schedule New
            </button>
            <button className="btn btn-primary me-2" onClick={handleAssignTechnician}>
              <UserCheck size={16} className="me-1" />
              Assign Technician
            </button>
            <button className="btn btn-primary me-2">
              <FileText size={16} className="me-1" />
              Work Orders
            </button>
            <button className="btn btn-primary me-2">
              <Upload size={16} className="me-1" />
              Import/Export
            </button>
            <button className="btn btn-primary" onClick={handleGenerateReport}>
              <FileBarChart size={16} className="me-1" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Statistics cards */}
        <div className="stats-container mb-4">
          <div className="row">
            <div className="col-md-3">
              <div className="card shadow-sm">
                <div className="card-body d-flex align-items-center">
                  <div className="stat-icon completed-icon me-3">
                    <CheckCircle size={24} />
                  </div>
                  <div className="stat-content">
                    <h6 className="stat-title mb-1">Completed Tasks</h6>
                    <div className="stat-value">{stats.completed.count}</div>
                    <div className="stat-change text-success">
                      <TrendingUp size={14} className="me-1" />
                      {stats.completed.change} since last week
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm">
                <div className="card-body d-flex align-items-center">
                  <div className="stat-icon upcoming-icon me-3">
                    <Clock size={24} />
                  </div>
                  <div className="stat-content">
                    <h6 className="stat-title mb-1">Upcoming Tasks</h6>
                    <div className="stat-value">{stats.upcoming.count}</div>
                    <div className="stat-change text-secondary">
                      <Minus size={14} className="me-1" />
                      No change
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm">
                <div className="card-body d-flex align-items-center">
                  <div className="stat-icon overdue-icon me-3">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="stat-content">
                    <h6 className="stat-title mb-1">Overdue Tasks</h6>
                    <div className="stat-value">{stats.overdue.count}</div>
                    <div className="stat-change text-danger">
                      <TrendingUp size={14} className="me-1" />
                      {stats.overdue.change} since last week
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm">
                <div className="card-body d-flex align-items-center">
                  <div className="stat-icon compliance-icon me-3">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-content">
                    <h6 className="stat-title mb-1">Compliance Rate</h6>
                    <div className="stat-value">{stats.compliance.rate}%</div>
                    <div className="stat-change text-success">
                      <TrendingUp size={14} className="me-1" />
                      {stats.compliance.change}% increase
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-container mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-2">
                  <label className="form-label">Status:</label>
                  <select className="form-select" name="status" value={filters.status} onChange={handleFilterChange}>
                    <option>All Status</option>
                    <option>Scheduled</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Overdue</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Crane:</label>
                  <select className="form-select" name="crane" value={filters.crane} onChange={handleFilterChange}>
                    <option>All Cranes</option>
                    <option>C-001</option>
                    <option>C-002</option>
                    <option>C-003</option>
                    <option>C-004</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Technician:</label>
                  <select
                    className="form-select"
                    name="technician"
                    value={filters.technician}
                    onChange={handleFilterChange}
                  >
                    <option>All Technicians</option>
                    <option>John Doe</option>
                    <option>Mike Jones</option>
                    <option>Jane Smith</option>
                    <option>Sarah Johnson</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Type:</label>
                  <select className="form-select" name="type" value={filters.type} onChange={handleFilterChange}>
                    <option>All Types</option>
                    <option>Inspection</option>
                    <option>Repair</option>
                    <option>Preventive</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Date Range:</label>
                  <div className="d-flex">
                    <input
                      type="date"
                      className="form-control me-2"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                    />
                    <span className="align-self-center">to</span>
                    <input
                      type="date"
                      className="form-control ms-2"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
                <div className="col-md-1 d-flex align-items-end">
                  <button className="btn btn-outline-secondary w-100" onClick={resetFilters}>
                    <RotateCcw size={16} className="me-1" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks table */}
        <div className="tasks-table-container">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th width="40">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>ID</th>
                      <th>Crane</th>
                      <th>Task</th>
                      <th>Type</th>
                      <th>Assigned To</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th width="120">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.length > 0 ? (
                      filteredTasks.map((task) => {
                        const daysLeft = getDaysLeft(task.dueDate)
                        const isSelected = selectedTasks.includes(task.id)

                        return (
                          <tr key={task.id} className={isSelected ? "table-active" : ""}>
                            <td>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={isSelected}
                                onChange={() => handleTaskSelection(task.id)}
                              />
                            </td>
                            <td>{task.id}</td>
                            <td>{task.crane}</td>
                            <td>
                              <div className="task-title">{task.task}</div>
                              <div className="task-description text-muted small">{task.description}</div>
                            </td>
                            <td>
                              <span className={`badge ${getTypeBadgeClass(task.type)}`}>{task.type}</span>
                            </td>
                            <td>{task.assignedTo}</td>
                            <td>
                              <div>{formatDate(task.dueDate)}</div>
                              {task.status !== "Completed" && (
                                <div className="days-left small">
                                  {daysLeft > 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(task.status)}`}>{task.status}</span>
                            </td>
                            <td>
                              <div className="d-flex">
                                <button
                                  className="btn btn-sm btn-outline-primary me-1"
                                  title="View Details"
                                  onClick={() => handleViewTask(task)}
                                >
                                  <Eye size={16} />
                                </button>
                                <button className="btn btn-sm btn-outline-warning me-1" title="Edit Task">
                                  <Edit size={16} />
                                </button>
                                {task.status !== "Completed" && (
                                  <button
                                    className="btn btn-sm btn-outline-success me-1"
                                    title="Mark as Completed"
                                    onClick={() => handleStatusChange(task.id, "Completed")}
                                  >
                                    <Check size={16} />
                                  </button>
                                )}
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  title="Delete Task"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-4">
                          No maintenance tasks found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule New Task Modal */}
      {showScheduleModal && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Schedule New Maintenance Task</h5>
                <button type="button" className="btn-close" onClick={() => setShowScheduleModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Crane</label>
                      <select className="form-select">
                        <option>C-001</option>
                        <option>C-002</option>
                        <option>C-003</option>
                        <option>C-004</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Task Type</label>
                      <select className="form-select">
                        <option>Inspection</option>
                        <option>Repair</option>
                        <option>Preventive</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Task Title</label>
                    <input type="text" className="form-control" placeholder="Enter task title" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="3" placeholder="Enter task description"></textarea>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Assigned To</label>
                      <select className="form-select">
                        <option>John Doe</option>
                        <option>Mike Jones</option>
                        <option>Jane Smith</option>
                        <option>Sarah Johnson</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Due Date</label>
                      <input type="date" className="form-control" />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Priority</label>
                      <select className="form-select">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Critical</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Estimated Hours</label>
                      <input type="number" className="form-control" min="0" step="0.5" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Required Parts</label>
                    <textarea className="form-control" rows="2" placeholder="List required parts"></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea className="form-control" rows="2" placeholder="Additional notes"></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary">
                  Schedule Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {showAssignModal && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Technician</h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Assign a technician to {selectedTasks.length} selected task(s):</p>
                <ul className="list-group mb-3">
                  {selectedTasks.map((taskId) => {
                    const task = tasks.find((t) => t.id === taskId)
                    return (
                      <li key={taskId} className="list-group-item">
                        <strong>{task.id}</strong> - {task.task}
                      </li>
                    )
                  })}
                </ul>
                <div className="mb-3">
                  <label className="form-label">Select Technician</label>
                  <select className="form-select">
                    <option>John Doe</option>
                    <option>Mike Jones</option>
                    <option>Jane Smith</option>
                    <option>Sarah Johnson</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Assignment Notes</label>
                  <textarea className="form-control" rows="3" placeholder="Add notes for the technician"></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary">
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskDetailModal && currentTask && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Task Details: {currentTask.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowTaskDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 className="fw-bold">Task</h6>
                      <p>{currentTask.task}</p>
                    </div>
                    <div className="mb-3">
                      <h6 className="fw-bold">Description</h6>
                      <p>{currentTask.description}</p>
                    </div>
                    <div className="mb-3">
                      <h6 className="fw-bold">Crane</h6>
                      <p>{currentTask.crane}</p>
                    </div>
                    <div className="mb-3">
                      <h6 className="fw-bold">Type</h6>
                      <p>
                        <span className={`badge ${getTypeBadgeClass(currentTask.type)}`}>{currentTask.type}</span>
                      </p>
                    </div>
                    <div className="mb-3">
                      <h6 className="fw-bold">Priority</h6>
                      <p>{currentTask.priority}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 className="fw-bold">Status</h6>
                      <p>
                        <span className={`badge ${getStatusBadgeClass(currentTask.status)}`}>{currentTask.status}</span>
                      </p>
                    </div>
                    <div className="mb-3">
                      <h6 className="fw-bold">Assigned To</h6>
                      <p>{currentTask.assignedTo}</p>
                    </div>
                    <div className="mb-3">
                      <h6 className="fw-bold">Due Date</h6>
                      <p>{formatDate(currentTask.dueDate)}</p>
                    </div>
                    <div className="mb-3">
                      <h6 className="fw-bold">Created</h6>
                      <p>{formatDate(currentTask.createdAt)}</p>
                    </div>
                    {currentTask.completedAt && (
                      <div className="mb-3">
                        <h6 className="fw-bold">Completed</h6>
                        <p>{formatDate(currentTask.completedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 className="fw-bold">Estimated Hours</h6>
                      <p>{currentTask.estimatedHours}</p>
                    </div>
                    {currentTask.actualHours && (
                      <div className="mb-3">
                        <h6 className="fw-bold">Actual Hours</h6>
                        <p>{currentTask.actualHours}</p>
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 className="fw-bold">Required Parts</h6>
                      <ul className="list-unstyled">
                        {currentTask.parts.map((part, index) => (
                          <li key={index}>• {part}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <h6 className="fw-bold">Notes</h6>
                  <p>{currentTask.notes}</p>
                </div>
              </div>
              <div className="modal-footer">
                {currentTask.status !== "Completed" && (
                  <button
                    type="button"
                    className="btn btn-success me-2"
                    onClick={() => {
                      handleStatusChange(currentTask.id, "Completed")
                      setShowTaskDetailModal(false)
                    }}
                  >
                    <Check size={16} className="me-1" />
                    Mark as Completed
                  </button>
                )}
                <button type="button" className="btn btn-primary me-2">
                  <Edit size={16} className="me-1" />
                  Edit Task
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskDetailModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal backdrop */}
      {(showScheduleModal || showAssignModal || showTaskDetailModal) && (
        <div className="modal-backdrop fade show"></div>
      )}

      {/* CSS Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
    .maintenance-management-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Roboto', sans-serif;
    }
    
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      margin-bottom: 1rem;
    }
    
    .search-container {
      width: 350px;
    }
    
    .notifications-container {
      display: flex;
      align-items: center;
    }
    
    .notification-icon, .help-icon {
      cursor: pointer;
      color: #6c757d;
      transition: color 0.2s;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    
    .notification-icon:hover, .help-icon:hover {
      color: #343a40;
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    /* Notifications Panel */
    .notifications-panel {
      position: absolute;
      top: 50px;
      right: 0;
      width: 350px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      overflow: hidden;
      max-height: 500px;
      display: flex;
      flex-direction: column;
    }
    
    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #e9ecef;
      background-color: #f8f9fa;
    }
    
    .notifications-actions {
      display: flex;
      align-items: center;
    }
    
    .notifications-body {
      overflow-y: auto;
      max-height: 450px;
      padding: 0;
    }
    
    .notification-item {
      padding: 12px 16px;
      border-bottom: 1px solid #e9ecef;
      position: relative;
      transition: background-color 0.2s;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .notification-item:hover {
      background-color: #f8f9fa;
    }
    
    .notification-item.read {
      opacity: 0.7;
    }
    
    .notification-content {
      flex: 1;
    }
    
    .notification-title {
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .notification-message {
      font-size: 0.9rem;
      color: #6c757d;
      margin-bottom: 4px;
    }
    
    .notification-time {
      font-size: 0.8rem;
      color: #adb5bd;
    }
    
    .mark-read-btn {
      padding: 0;
      font-size: 0.8rem;
      white-space: nowrap;
    }
    
    .no-notifications {
      padding: 20px;
      text-align: center;
      color: #6c757d;
    }
    
    /* Notification types */
    .notification-danger {
      border-left: 4px solid #dc3545;
    }
    
    .notification-warning {
      border-left: 4px solid #ffc107;
    }
    
    .notification-success {
      border-left: 4px solid #28a745;
    }
    
    .notification-info {
      border-left: 4px solid #17a2b8;
    }
    
    .title-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }
    
    .maintenance-title {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: #343a40;
      margin-bottom: 0;
    }
    
    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .card {
      margin-bottom: 0;
      border-radius: 0.375rem;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }

    .card-body {
      padding: 1rem; /* Reduce padding */
    }
    
    .stat-icon {
      width: 40px; /* Reduce size */
      height: 40px; /* Reduce size */
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .completed-icon {
      background-color: #28a745;
    }
    
    .upcoming-icon {
      background-color: #fd7e14;
    }
    
    .overdue-icon {
      background-color: #dc3545;
    }
    
    .compliance-icon {
      background-color: #17a2b8;
    }
    
    .stat-title {
      color: #6c757d;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .stat-value {
      font-size: 1.75rem; /* Reduce font size */
      font-weight: 700;
      color: #343a40;
      line-height: 1.2;
    }
    
    .stat-change {
      display: flex;
      align-items: center;
      font-size: 0.8rem; /* Reduce font size */
    }
    
    .task-title {
      font-weight: 500;
    }
    
    .days-left {
      color: #6c757d;
    }
    
    /* Responsive styles */
    @media (max-width: 992px) {
      .title-container {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .action-buttons {
        margin-top: 15px;
      }
      
      .search-container {
        width: 100%;
        margin-bottom: 15px;
      }
      
      .header-container {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .notifications-container {
        margin-top: 15px;
        align-self: flex-end;
      }
      
      .notifications-panel {
        width: 100%;
        right: 0;
        left: 0;
        top: 80px;
      }
    }
    
    @media (max-width: 768px) {
      .action-buttons {
        flex-direction: column;
        width: 100%;
      }
      
      .action-buttons button {
        width: 100%;
      }
    }
    
    /* Modal backdrop */
    .modal-backdrop {
      background-color: rgba(0, 0, 0, 0.5);
    }
    
    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    /* Additional spacing fixes */
    .row {
      margin-left: -10px;
      margin-right: -10px;
    }

    .col-md-2, .col-md-3, .col-md-4, .col-md-6, .col-md-12 {
      padding-left: 10px;
      padding-right: 10px;
    }

    .form-label {
      margin-bottom: 0.25rem;
      font-size: 0.875rem;
    }

    .form-select, .form-control {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }

    .table th, .table td {
      padding: 0.5rem 0.75rem;
      vertical-align: middle;
    }

    .table thead th {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .badge {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
    }

    /* Fix for the filters container */
    .filters-container .card-body {
      padding: 0.75rem;
    }

    /* Fix for the tasks table */
    .tasks-table-container .card-body {
      padding: 0;
    }

    /* Compact action buttons */
    .action-buttons .btn {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }

    /* Ensure proper alignment of the maintenance title */
    .maintenance-title {
      margin-top: 0;
      margin-bottom: 0;
      font-size: 1.5rem;
    }
    `,
        }}
      />
    </div>
  )
}

export default MaintenanceManagement

