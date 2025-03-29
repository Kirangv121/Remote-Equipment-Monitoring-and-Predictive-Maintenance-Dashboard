"use client"

import { useState } from "react"
import "./app/globals.css"

// Mock data for operators
const initialOperators = [
  {
    id: 1,
    name: "John Doe",
    active: true,
    role: "Senior Operator",
    crane: "XCMG Truck Crane",
    shift: "Morning",
    location: "Site A",
    certifications: ["Crane Operation", "Safety Management"],
    tasks: ["Daily Inspection"],
    performance: {
      efficiency: 95,
      incidents: 0,
      hours: 180,
    },
  },
  {
    id: 2,
    name: "Jane Smith",
    active: true,
    role: "Operator",
    crane: "POTAIN Tower Crane",
    shift: "Evening",
    location: "Site B",
    certifications: ["Crane Operation"],
    tasks: ["Equipment Check", "Safety Protocol"],
    performance: {
      efficiency: 92,
      incidents: 1,
      hours: 155,
    },
  },
  {
    id: 3,
    name: "Robert Johnson",
    active: false,
    role: "Junior Operator",
    crane: "Liebherr Mobile Crane",
    shift: "Night",
    location: "Site C",
    certifications: ["Crane Operation"],
    tasks: ["Maintenance Check"],
    performance: {
      efficiency: 85,
      incidents: 2,
      hours: 120,
    },
  },
]

export default function OperatorsManagement() {
  const [operators, setOperators] = useState(initialOperators)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newOperator, setNewOperator] = useState({
    name: "",
    role: "",
    crane: "",
    shift: "",
    location: "",
    certifications: [],
    tasks: [],
  })
  const [editingId, setEditingId] = useState(null)

  // Toggle operator active status
  const toggleStatus = (id) => {
    setOperators(operators.map((op) => (op.id === id ? { ...op, active: !op.active } : op)))
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewOperator({ ...newOperator, [name]: value })
  }

  // Handle certification checkbox changes
  const handleCertificationChange = (cert) => {
    const updatedCerts = newOperator.certifications.includes(cert)
      ? newOperator.certifications.filter((c) => c !== cert)
      : [...newOperator.certifications, cert]
    setNewOperator({ ...newOperator, certifications: updatedCerts })
  }

  // Handle task input
  const handleTaskInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      setNewOperator({
        ...newOperator,
        tasks: [...newOperator.tasks, e.target.value.trim()],
      })
      e.target.value = ""
      e.preventDefault()
    }
  }

  // Remove a task
  const removeTask = (task) => {
    setNewOperator({
      ...newOperator,
      tasks: newOperator.tasks.filter((t) => t !== task),
    })
  }

  // Add new operator
  const addOperator = (e) => {
    e.preventDefault()
    const newId = Math.max(...operators.map((op) => op.id)) + 1
    const operatorToAdd = {
      ...newOperator,
      id: newId,
      active: true,
      performance: {
        efficiency: 0,
        incidents: 0,
        hours: 0,
      },
    }
    setOperators([...operators, operatorToAdd])
    setNewOperator({
      name: "",
      role: "",
      crane: "",
      shift: "",
      location: "",
      certifications: [],
      tasks: [],
    })
    setShowAddForm(false)
  }

  // Start editing an operator
  const startEditing = (operator) => {
    setNewOperator({ ...operator })
    setEditingId(operator.id)
    setShowAddForm(true)
  }

  // Update operator
  const updateOperator = (e) => {
    e.preventDefault()
    setOperators(operators.map((op) => (op.id === editingId ? { ...newOperator } : op)))
    setNewOperator({
      name: "",
      role: "",
      crane: "",
      shift: "",
      location: "",
      certifications: [],
      tasks: [],
    })
    setEditingId(null)
    setShowAddForm(false)
  }

  // Delete operator
  const deleteOperator = (id) => {
    if (window.confirm("Are you sure you want to delete this operator?")) {
      setOperators(operators.filter((op) => op.id !== id))
    }
  }

  // Available certifications
  const availableCertifications = [
    "Crane Operation",
    "Safety Management",
    "Heavy Machinery",
    "First Aid",
    "Hazardous Materials",
  ]

  // Available shifts
  const availableShifts = ["Morning", "Evening", "Night"]

  return (
    <div className="operators-management">
      <div className="page-header">
        <h1>Operators Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null)
            setNewOperator({
              name: "",
              role: "",
              crane: "",
              shift: "",
              location: "",
              certifications: [],
              tasks: [],
            })
            setShowAddForm(!showAddForm)
          }}
        >
          {showAddForm ? "Cancel" : "Add Operator"}
        </button>
      </div>

      {showAddForm && (
        <div className="add-operator-form">
          <form onSubmit={editingId ? updateOperator : addOperator}>
            <h2>{editingId ? "Edit Operator" : "Add New Operator"}</h2>
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={newOperator.name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input type="text" name="role" value={newOperator.role} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Crane</label>
              <input type="text" name="crane" value={newOperator.crane} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Shift</label>
              <select name="shift" value={newOperator.shift} onChange={handleInputChange} required>
                <option value="">Select Shift</option>
                {availableShifts.map((shift) => (
                  <option key={shift} value={shift}>
                    {shift}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input type="text" name="location" value={newOperator.location} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Certifications</label>
              <div className="certifications-checkboxes">
                {availableCertifications.map((cert) => (
                  <div key={cert} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={`cert-${cert}`}
                      checked={newOperator.certifications.includes(cert)}
                      onChange={() => handleCertificationChange(cert)}
                    />
                    <label htmlFor={`cert-${cert}`}>{cert}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Tasks</label>
              <div className="tasks-input">
                <input type="text" placeholder="Press Enter to add task" onKeyDown={handleTaskInput} />
                <div className="tasks-list">
                  {newOperator.tasks.map((task, index) => (
                    <div key={index} className="task-item">
                      <span>{task}</span>
                      <button type="button" className="remove-task" onClick={() => removeTask(task)}>
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingId ? "Update Operator" : "Add Operator"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="operators-list">
        {operators.map((operator) => (
          <div key={operator.id} className={`operator-card ${!operator.active ? "inactive" : ""}`}>
            <div className="operator-header">
              <h2>{operator.name}</h2>
              <div className="operator-actions">
                <button
                  className={`status-badge ${operator.active ? "active" : "inactive"}`}
                  onClick={() => toggleStatus(operator.id)}
                >
                  {operator.active ? "Active" : "Inactive"}
                </button>
                <div className="action-buttons">
                  <button className="edit-btn" onClick={() => startEditing(operator)}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="delete-btn" onClick={() => deleteOperator(operator.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="operator-details">
              <div className="detail-item">
                <span className="detail-label">Role</span>
                <span className="detail-value">{operator.role}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Crane</span>
                <span className="detail-value">{operator.crane}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Shift</span>
                <span className="detail-value">{operator.shift}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location</span>
                <span className="detail-value">{operator.location}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Certifications</span>
                <div className="certifications-list">
                  {operator.certifications.map((cert, index) => (
                    <span key={index} className="certification-badge">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tasks</span>
                <ul className="tasks-list">
                  {operator.tasks.map((task, index) => (
                    <li key={index}>• {task}</li>
                  ))}
                </ul>
              </div>

              {operator.performance && (
                <div className="performance-section">
                  <h3>Performance</h3>
                  <div className="performance-metrics">
                    <div className="metric">
                      <span className="metric-label">Efficiency</span>
                      <span className="metric-value efficiency">{operator.performance.efficiency}%</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Incidents</span>
                      <span className="metric-value incidents">{operator.performance.incidents}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Hours</span>
                      <span className="metric-value hours">{operator.performance.hours}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

