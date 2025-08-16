"use client"

import { createContext, useContext, useState, useEffect } from "react"

const UserContext = createContext()

export function UserProvider({ children }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load mock users data
    const mockUsers = [
      {
        id: 1,
        name: "Admin User",
        email: "admin@demo.com",
        role: "admin",
        status: "active",
        lastLogin: "2024-01-15",
        createdAt: "2023-06-01",
      },
      {
        id: 2,
        name: "Super User",
        email: "super@demo.com",
        role: "supervisor",
        status: "active",
        lastLogin: "2024-01-14",
        createdAt: "2023-07-15",
      },
      {
        id: 3,
        name: "Client User",
        email: "client@demo.com",
        role: "client",
        status: "active",
        lastLogin: "2024-01-13",
        createdAt: "2023-08-20",
      },
    ]

    const storedUsers = localStorage.getItem("users")
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers))
    } else {
      setUsers(mockUsers)
      localStorage.setItem("users", JSON.stringify(mockUsers))
    }
    setLoading(false)
  }, [])

  const addUser = (userData) => {
    const newUser = {
      ...userData,
      id: Date.now(),
      createdAt: new Date().toISOString().split("T")[0],
      status: "active",
      lastLogin: null,
    }
    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
  }

  const updateUser = (id, userData) => {
    const updatedUsers = users.map((user) => (user.id === id ? { ...user, ...userData } : user))
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
  }

  const deleteUser = (id) => {
    const updatedUsers = users.filter((user) => user.id !== id)
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
  }

  const getUser = (id) => {
    return users.find((user) => user.id === Number.parseInt(id))
  }

  return (
    <UserContext.Provider
      value={{
        users,
        loading,
        addUser,
        updateUser,
        deleteUser,
        getUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUsers = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUsers must be used within a UserProvider")
  }
  return context
}
