"use client"

import { createContext, useContext, useState, useEffect } from "react"

const TaskContext = createContext()

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load mock tasks data
    const mockTasks = [
      {
        id: 1,
        title: "Inspect Downtown Office Building",
        description:
          "Complete full inspection of the 15-story downtown office building including HVAC, electrical, and structural assessment.",
        assignedTo: "super@demo.com", // supervisor email
        assignedBy: "admin@demo.com", // admin email
        status: "in-progress",
        priority: "high",
        dueDate: "2024-02-20",
        createdAt: "2024-02-01",
        updatedAt: "2024-02-05",
        progress: 65,
        category: "inspection",
        propertyId: "prop-001",
        propertyName: "Commerce Plaza",
        comments: [
          {
            id: 1,
            author: "super@demo.com",
            message: "Started exterior inspection, found minor issues with gutters",
            timestamp: "2024-02-05T10:30:00Z",
          },
        ],
      },
      {
        id: 2,
        title: "Update Property Documentation",
        description:
          "Review and update all property documentation for the residential complex, including tenant records and maintenance logs.",
        assignedTo: "super@demo.com",
        assignedBy: "admin@demo.com",
        status: "pending",
        priority: "medium",
        dueDate: "2024-02-25",
        createdAt: "2024-02-03",
        updatedAt: "2024-02-03",
        progress: 0,
        category: "documentation",
        propertyId: "prop-002",
        propertyName: "Sunset Apartments",
        comments: [],
      },
      {
        id: 3,
        title: "Safety Compliance Review",
        description:
          "Conduct comprehensive safety compliance review for all managed properties, ensure fire safety and emergency protocols are up to date.",
        assignedTo: "super@demo.com",
        assignedBy: "admin@demo.com",
        status: "completed",
        priority: "high",
        dueDate: "2024-01-30",
        createdAt: "2024-01-15",
        updatedAt: "2024-01-28",
        progress: 100,
        category: "compliance",
        propertyId: null,
        propertyName: "All Properties",
        comments: [
          {
            id: 1,
            author: "super@demo.com",
            message: "Completed review of all 12 properties. All compliance issues resolved.",
            timestamp: "2024-01-28T16:45:00Z",
          },
        ],
      },
    ]

    const storedTasks = localStorage.getItem("tasks")
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks))
    } else {
      setTasks(mockTasks)
      localStorage.setItem("tasks", JSON.stringify(mockTasks))
    }
    setLoading(false)
  }, [])

  const saveTasks = (updatedTasks) => {
    setTasks(updatedTasks)
    localStorage.setItem("tasks", JSON.stringify(updatedTasks))
  }

  const createTask = (taskData) => {
    const newTask = {
      ...taskData,
      id: Date.now(),
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      progress: 0,
      status: "pending",
      comments: [],
    }
    const updatedTasks = [...tasks, newTask]
    saveTasks(updatedTasks)
    return newTask
  }

  const updateTask = (id, updates) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            ...updates,
            updatedAt: new Date().toISOString().split("T")[0],
          }
        : task,
    )
    saveTasks(updatedTasks)
  }

  const updateTaskProgress = (id, progress) => {
    const status = progress === 100 ? "completed" : progress > 0 ? "in-progress" : "pending"
    updateTask(id, { progress, status })
  }

  const addTaskComment = (taskId, comment) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            comments: [
              ...task.comments,
              {
                id: Date.now(),
                author: comment.author,
                message: comment.message,
                timestamp: new Date().toISOString(),
              },
            ],
            updatedAt: new Date().toISOString().split("T")[0],
          }
        : task,
    )
    saveTasks(updatedTasks)
  }

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id)
    saveTasks(updatedTasks)
  }

  const getTasksByAssignee = (email) => {
    return tasks.filter((task) => task.assignedTo === email)
  }

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status)
  }

  const getOverdueTasks = () => {
    const today = new Date().toISOString().split("T")[0]
    return tasks.filter((task) => task.dueDate < today && task.status !== "completed")
  }

  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter((task) => task.status === "completed").length
    const inProgress = tasks.filter((task) => task.status === "in-progress").length
    const pending = tasks.filter((task) => task.status === "pending").length
    const overdue = getOverdueTasks().length

    return {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }

  const getTasksByPriority = (priority) => {
    return tasks.filter((task) => task.priority === priority)
  }

  const getRecentTasks = (limit = 5) => {
    return [...tasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, limit)
  }

  const value = {
    tasks,
    loading,
    createTask,
    updateTask,
    updateTaskProgress,
    addTaskComment,
    deleteTask,
    getTasksByAssignee,
    getTasksByStatus,
    getOverdueTasks,
    getTaskStats,
    getTasksByPriority,
    getRecentTasks,
  }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export const useTasks = () => {
  const context = useContext(TaskContext)
  if (!context) {
    console.log("[v0] TaskProvider not available yet, using fallback")
    return {
      tasks: [],
      loading: false,
      createTask: () => {},
      updateTask: () => {},
      updateTaskProgress: () => {},
      addTaskComment: () => {},
      deleteTask: () => {},
      getTasksByAssignee: () => [],
      getTasksByStatus: () => [],
      getOverdueTasks: () => [],
      getTaskStats: () => ({
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        overdue: 0,
        completionRate: 0,
      }),
      getTasksByPriority: () => [],
      getRecentTasks: () => [],
    }
  }
  return context
}
