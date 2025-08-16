"use client"

import { useState, useMemo } from "react"
import { useTasks } from "../contexts/task-context"
import { useUsers } from "../contexts/user-context"
import { usePermissions } from "../hooks/use-permissions"

export default function ProgressMonitoring() {
  const { tasks, getTasksByAssignee, getTaskStats, getOverdueTasks, updateTaskProgress, addTaskComment } = useTasks()
  const { users } = useUsers()
  const { hasPermission } = usePermissions()
  const [selectedSupervisor, setSelectedSupervisor] = useState("all")
  const [selectedTimeframe, setSelectedTimeframe] = useState("all")

  const supervisors = users.filter((u) => u.role === "supervisor")
  const stats = getTaskStats()
  const overdueTasks = getOverdueTasks()

  const supervisorMetrics = useMemo(() => {
    return supervisors.map((supervisor) => {
      const supervisorTasks = getTasksByAssignee(supervisor.email)
      const completed = supervisorTasks.filter((t) => t.status === "completed").length
      const inProgress = supervisorTasks.filter((t) => t.status === "in-progress").length
      const pending = supervisorTasks.filter((t) => t.status === "pending").length
      const overdue = supervisorTasks.filter((t) => {
        const today = new Date().toISOString().split("T")[0]
        return t.dueDate < today && t.status !== "completed"
      }).length

      const total = supervisorTasks.length
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
      const avgProgress =
        total > 0 ? Math.round(supervisorTasks.reduce((sum, task) => sum + task.progress, 0) / total) : 0

      return {
        supervisor,
        total,
        completed,
        inProgress,
        pending,
        overdue,
        completionRate,
        avgProgress,
        tasks: supervisorTasks,
      }
    })
  }, [supervisors, tasks])

  const filteredTasks = useMemo(() => {
    let filtered = tasks

    if (selectedSupervisor !== "all") {
      filtered = filtered.filter((task) => task.assignedTo === selectedSupervisor)
    }

    if (selectedTimeframe !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (selectedTimeframe) {
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
        case "quarter":
          filterDate.setMonth(now.getMonth() - 3)
          break
      }

      filtered = filtered.filter((task) => new Date(task.createdAt) >= filterDate)
    }

    return filtered
  }, [tasks, selectedSupervisor, selectedTimeframe])

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-accent/10 text-accent border-accent/20"
      case "in-progress":
        return "bg-secondary/10 text-secondary border-secondary/20"
      case "pending":
        return "bg-primary/10 text-primary border-primary/20"
      case "overdue":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "medium":
        return "bg-secondary/10 text-secondary border-secondary/20"
      case "low":
        return "bg-accent/10 text-accent border-accent/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  if (!hasPermission("canManageUsers")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground">You don't have permission to view progress monitoring.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Progress Monitoring</h1>
              <p className="text-muted-foreground">Monitor task progress and supervisor performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
                className="px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              >
                <option value="all">All Supervisors</option>
                {supervisors.map((supervisor) => (
                  <option key={supervisor.id} value={supervisor.email}>
                    {supervisor.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-accent">{stats.completionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tasks</p>
                <p className="text-2xl font-bold text-secondary">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Tasks</p>
                <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
              </div>
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Supervisor Performance */}
        <div className="bg-card border border-border rounded-xl mb-8">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-serif font-bold text-foreground">Supervisor Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Supervisor</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Total Tasks</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Completed</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">In Progress</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Overdue</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Completion Rate</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Avg Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {supervisorMetrics.map((metric) => (
                  <tr key={metric.supervisor.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-foreground">{metric.supervisor.name}</div>
                        <div className="text-sm text-muted-foreground">{metric.supervisor.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-card-foreground">{metric.total}</td>
                    <td className="px-6 py-4 text-sm text-accent font-medium">{metric.completed}</td>
                    <td className="px-6 py-4 text-sm text-secondary font-medium">{metric.inProgress}</td>
                    <td className="px-6 py-4 text-sm text-destructive font-medium">{metric.overdue}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-accent h-2 rounded-full transition-all duration-300"
                            style={{ width: `${metric.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">{metric.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${metric.avgProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">{metric.avgProgress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Task Activity */}
        <div className="bg-card border border-border rounded-xl">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-serif font-bold text-foreground">Recent Task Activity</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Task</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Assigned To</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Progress</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Due Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTasks
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  .slice(0, 10)
                  .map((task) => {
                    const isOverdue =
                      task.dueDate < new Date().toISOString().split("T")[0] && task.status !== "completed"
                    const status = isOverdue ? "overdue" : task.status

                    return (
                      <tr key={task.id} className="hover:bg-muted/20">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-foreground">{task.title}</div>
                            <div className="text-sm text-muted-foreground">{task.propertyName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-card-foreground">{task.assignedTo}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${task.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">{task.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-card-foreground">{task.dueDate}</td>
                        <td className="px-6 py-4 text-sm text-card-foreground">{task.updatedAt}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
