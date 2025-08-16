"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useTasks } from "./task-context"
import { useAuth } from "./auth-context"

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const taskContext = useTasks()
  const authContext = useAuth()
  const [notifications, setNotifications] = useState([])

  const tasks = taskContext?.tasks || []
  const getOverdueTasks = taskContext?.getOverdueTasks || (() => [])
  const user = authContext?.user

  useEffect(() => {
    if (!user || !tasks) return

    // Generate notifications based on tasks
    const generateNotifications = () => {
      const newNotifications = []
      const overdueTasks = getOverdueTasks()

      // Overdue task notifications for admins
      if (user.role === "admin" && overdueTasks.length > 0) {
        newNotifications.push({
          id: `overdue-${Date.now()}`,
          type: "warning",
          title: "Overdue Tasks Alert",
          message: `${overdueTasks.length} task${overdueTasks.length > 1 ? "s are" : " is"} overdue and require attention.`,
          timestamp: new Date().toISOString(),
          read: false,
          actionable: true,
          data: { overdueTasks },
        })
      }

      // Task assignments for supervisors
      if (user.role === "supervisor") {
        const myTasks = tasks.filter((task) => task.assignedTo === user.email)
        const pendingTasks = myTasks.filter((task) => task.status === "pending")
        const dueSoonTasks = myTasks.filter((task) => {
          const dueDate = new Date(task.dueDate)
          const today = new Date()
          const diffTime = dueDate - today
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          return diffDays <= 3 && diffDays > 0 && task.status !== "completed"
        })

        if (pendingTasks.length > 0) {
          newNotifications.push({
            id: `pending-${Date.now()}`,
            type: "info",
            title: "New Task Assignments",
            message: `You have ${pendingTasks.length} new task${pendingTasks.length > 1 ? "s" : ""} assigned to you.`,
            timestamp: new Date().toISOString(),
            read: false,
            actionable: true,
            data: { pendingTasks },
          })
        }

        if (dueSoonTasks.length > 0) {
          newNotifications.push({
            id: `due-soon-${Date.now()}`,
            type: "warning",
            title: "Tasks Due Soon",
            message: `${dueSoonTasks.length} task${dueSoonTasks.length > 1 ? "s are" : " is"} due within 3 days.`,
            timestamp: new Date().toISOString(),
            read: false,
            actionable: true,
            data: { dueSoonTasks },
          })
        }
      }

      // Task completion notifications for admins
      if (user.role === "admin") {
        const recentlyCompleted = tasks.filter((task) => {
          const updatedDate = new Date(task.updatedAt)
          const today = new Date()
          const diffTime = today - updatedDate
          const diffHours = diffTime / (1000 * 60 * 60)
          return task.status === "completed" && diffHours <= 24
        })

        if (recentlyCompleted.length > 0) {
          newNotifications.push({
            id: `completed-${Date.now()}`,
            type: "success",
            title: "Tasks Completed",
            message: `${recentlyCompleted.length} task${recentlyCompleted.length > 1 ? "s have" : " has"} been completed in the last 24 hours.`,
            timestamp: new Date().toISOString(),
            read: false,
            actionable: false,
            data: { recentlyCompleted },
          })
        }
      }

      setNotifications(newNotifications)
    }

    generateNotifications()
  }, [user])

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const removeNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    console.log("[v0] NotificationProvider not available yet, using fallback")
    return {
      notifications: [],
      unreadCount: 0,
      markAsRead: () => {},
      markAllAsRead: () => {},
      removeNotification: () => {},
      clearAllNotifications: () => {},
    }
  }
  return context
}
