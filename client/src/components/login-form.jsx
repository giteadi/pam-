"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { loginUser, registerUser } from "../redux/slices/userSlice"
import { useNavigate } from "react-router-dom"

export default function LoginForm() {
  const [activeTab, setActiveTab] = useState("login")
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { loading, error, user } = useSelector((state) => state.users)
  const [success, setSuccess] = useState("")

  // Login form state - removed role from login data
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Register form state
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client",
  })

  const [otpData, setOtpData] = useState({
    email: "",
    otp: "",
    step: "register", // "register", "verify-otp", "complete"
  })

  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
    step: "email", // "email", "verify-otp", "reset-password", "complete"
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setSuccess("")

    try {
      console.log("[v0] Attempting login with:", loginData)
      const result = await dispatch(
        loginUser({
          email: loginData.email,
          password: loginData.password,
        }),
      ).unwrap()

      console.log("[v0] Login successful:", result)
      navigate("/dashboard")
    } catch (err) {
      console.log("[v0] Login error:", err)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setSuccess("")

    if (registerData.password !== registerData.confirmPassword) {
      return
    }

    try {
      const response = await fetch("http://localhost:4000/api/users/send-otp-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: registerData.email }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setOtpData({
          email: registerData.email,
          otp: "",
          step: "verify-otp",
        })
        setSuccess("OTP sent to your email. Please verify to complete registration.")
      } else {
        throw new Error(data.msg || "Failed to send OTP")
      }
    } catch (err) {
      console.log("[v0] Registration error:", err)
      setSuccess("")
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setSuccess("")

    console.log("[v0] OTP verification started with:", {
      email: otpData.email,
      otp: otpData.otp,
      otpLength: otpData.otp.length,
    })

    try {
      const verifyResponse = await fetch("http://localhost:4000/api/users/verify-otp-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: otpData.email,
          otp: otpData.otp,
        }),
      })

      console.log("[v0] Verify response status:", verifyResponse.status)

      if (!verifyResponse.ok) {
        throw new Error(`HTTP error! status: ${verifyResponse.status}`)
      }

      const verifyData = await verifyResponse.json()
      console.log("[v0] Verify response data:", verifyData)

      if (verifyData.success) {
        console.log("[v0] OTP verified, creating user account...")
        // Create user account
        const result = await dispatch(
          registerUser({
            email: registerData.email,
            password: registerData.password,
            firstName: registerData.firstName,
            lastName: registerData.lastName,
            role: registerData.role,
            otp: otpData.otp,
          }),
        ).unwrap()

        console.log("[v0] User registration result:", result)
        setSuccess("Registration successful! Please login with your credentials.")
        setActiveTab("login")
        setRegisterData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "client",
        })
        setOtpData({
          email: "",
          otp: "",
          step: "register",
        })
      } else {
        throw new Error(verifyData.msg || "Invalid OTP")
      }
    } catch (err) {
      console.log("[v0] OTP verification error:", err)
    }
  }

  const handleResendOtp = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/users/send-otp-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: otpData.email }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setSuccess("OTP resent to your email.")
      } else {
        throw new Error(data.msg || "Failed to resend OTP")
      }
    } catch (err) {
      console.log("[v0] Resend OTP error:", err)
    }
  }

  const handleForgotPasswordStep1 = async (e) => {
    e.preventDefault()
    setSuccess("")

    try {
      const response = await fetch("http://localhost:4000/api/users/send-password-reset-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotPasswordData.email }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setForgotPasswordData({
          ...forgotPasswordData,
          step: "verify-otp",
        })
        setSuccess("Password reset OTP sent to your email.")
      } else {
        throw new Error(data.msg || "Failed to send reset OTP")
      }
    } catch (err) {
      console.log("[v0] Forgot password error:", err)
    }
  }

  const handleVerifyResetOtp = async (e) => {
    e.preventDefault()
    setSuccess("")

    try {
      const response = await fetch("http://localhost:4000/api/users/verify-password-reset-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotPasswordData.email,
          otp: forgotPasswordData.otp,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setForgotPasswordData({
          ...forgotPasswordData,
          step: "reset-password",
        })
        setSuccess("OTP verified. Please enter your new password.")
      } else {
        throw new Error(data.msg || "Invalid OTP")
      }
    } catch (err) {
      console.log("[v0] OTP verification error:", err)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setSuccess("")

    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      setSuccess("")
      return
    }

    if (forgotPasswordData.newPassword.length < 8) {
      setSuccess("")
      return
    }

    try {
      const response = await fetch("http://localhost:4000/api/users/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: forgotPasswordData.email,
          newPassword: forgotPasswordData.newPassword,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setSuccess("Password reset successfully! You can now login with your new password.")
        setActiveTab("login")
        setForgotPasswordData({
          email: "",
          otp: "",
          newPassword: "",
          confirmPassword: "",
          step: "email",
        })
      } else {
        throw new Error(data.msg || "Failed to reset password")
      }
    } catch (err) {
      console.log("[v0] Password reset error:", err)
    }
  }

  const handleResendResetOtp = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/users/send-password-reset-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotPasswordData.email }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setSuccess("Password reset OTP resent to your email.")
      } else {
        throw new Error(data.msg || "Failed to resend OTP")
      }
    } catch (err) {
      console.log("[v0] Resend OTP error:", err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Header - enhanced with better styling and gradients */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Inspector</h1>
          <p className="text-gray-600">Manage your inspections with ease</p>
        </div>

        {/* Card Container - enhanced with better shadows and backdrop blur */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Tab Navigation - improved with better colors and hover effects */}
          <div className="flex border-b border-gray-100">
            {[
              { id: "login", label: "Sign In", icon: "🔐" },
              { id: "register", label: "Register", icon: "👤" },
              { id: "forgot", label: "Reset", icon: "🔑" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSuccess("")
                  setOtpData({
                    email: "",
                    otp: "",
                    step: "register",
                  })
                  setForgotPasswordData({
                    email: "",
                    otp: "",
                    newPassword: "",
                    confirmPassword: "",
                    step: "email",
                  })
                }}
                className={`flex-1 py-4 px-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content - increased padding and improved spacing */}
          <div className="p-6">
            {/* Messages - enhanced with better styling */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center">
                <span className="mr-2">✅</span>
                {success}
              </div>
            )}

            {/* Login Form - removed role dropdown and enhanced styling */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => {
                      console.log("[v0] Login email change:", e.target.value)
                      setLoginData({ ...loginData, email: e.target.value })
                    }}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => {
                      console.log("[v0] Login password change:", e.target.value)
                      setLoginData({ ...loginData, password: e.target.value })
                    }}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-2">🚀</span>
                      Sign In
                    </span>
                  )}
                </button>
              </form>
            )}

            {/* Register Form - enhanced styling while keeping role dropdown */}
            {activeTab === "register" && (
              <>
                {otpData.step === "register" && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                          placeholder="First"
                          value={registerData.firstName}
                          onChange={(e) => {
                            console.log("[v0] Register firstName change:", e.target.value)
                            setRegisterData({ ...registerData, firstName: e.target.value })
                          }}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                          placeholder="Last"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                        placeholder="Enter your email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                        placeholder="Create a password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                        placeholder="Confirm your password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                      <select
                        value={registerData.role}
                        onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                        className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        disabled={loading}
                      >
                        <option value="client">Client</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Sending OTP...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center">
                          <span className="mr-2">📧</span>
                          Send Verification Code
                        </span>
                      )}
                    </button>
                  </form>
                )}

                {otpData.step === "verify-otp" && (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                        <span className="text-2xl">📱</span>
                      </div>
                      <p className="text-sm text-gray-600">Enter the 6-digit code sent to</p>
                      <p className="text-sm font-semibold text-gray-900">{otpData.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code</label>
                      <input
                        type="text"
                        required
                        maxLength="6"
                        className="w-full px-4 py-3 text-lg bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-center tracking-widest font-mono"
                        placeholder="000000"
                        value={otpData.otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                          setOtpData({ ...otpData, otp: value })
                        }}
                        disabled={loading}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otpData.otp.length !== 6}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      onClick={() => {
                        console.log("[v0] Verify button clicked:", {
                          loading,
                          otpLength: otpData.otp.length,
                          disabled: loading || otpData.otp.length !== 6,
                        })
                      }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center">
                          <span className="mr-2">✨</span>
                          Verify & Create Account
                        </span>
                      )}
                    </button>

                    <div className="text-center space-y-2">
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-sm text-green-600 hover:text-green-700 transition-colors font-medium"
                        disabled={loading}
                      >
                        Didn't receive code? Resend
                      </button>
                      <br />
                      <button
                        type="button"
                        onClick={() => setOtpData({ ...otpData, step: "register" })}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        ← Back to registration
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* Forgot Password Form - enhanced styling */}
            {activeTab === "forgot" && (
              <>
                {/* Step 1: Enter Email */}
                {forgotPasswordData.step === "email" && (
                  <form onSubmit={handleForgotPasswordStep1} className="space-y-5">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-3">
                        <span className="text-2xl">🔑</span>
                      </div>
                      <p className="text-sm text-gray-600">Enter your email to receive a reset code</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                        placeholder="Enter your email"
                        value={forgotPasswordData.email}
                        onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, email: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center">
                          <span className="mr-2">📧</span>
                          Send Reset Code
                        </span>
                      )}
                    </button>
                  </form>
                )}

                {forgotPasswordData.step === "verify-otp" && (
                  <form onSubmit={handleVerifyResetOtp} className="space-y-5">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-3">
                        <span className="text-2xl">📱</span>
                      </div>
                      <p className="text-sm text-gray-600">Enter the 6-digit code sent to</p>
                      <p className="text-sm font-semibold text-gray-900">{forgotPasswordData.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Reset Code</label>
                      <input
                        type="text"
                        required
                        maxLength="6"
                        className="w-full px-4 py-3 text-lg bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-center tracking-widest font-mono"
                        placeholder="000000"
                        value={forgotPasswordData.otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                          setForgotPasswordData({ ...forgotPasswordData, otp: value })
                        }}
                        disabled={loading}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || forgotPasswordData.otp.length !== 6}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center">
                          <span className="mr-2">✅</span>
                          Verify Code
                        </span>
                      )}
                    </button>

                    <div className="text-center space-y-2">
                      <button
                        type="button"
                        onClick={handleResendResetOtp}
                        className="text-sm text-orange-600 hover:text-orange-700 transition-colors font-medium"
                        disabled={loading}
                      >
                        Didn't receive code? Resend
                      </button>
                      <br />
                      <button
                        type="button"
                        onClick={() => setForgotPasswordData({ ...forgotPasswordData, step: "email" })}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        ← Back to email
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 3: Reset Password */}
                {forgotPasswordData.step === "reset-password" && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-3">
                        <span className="text-2xl">🔐</span>
                      </div>
                      <p className="text-sm text-gray-600">Create a new password for your account</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        required
                        minLength="8"
                        className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                        placeholder="Enter new password"
                        value={forgotPasswordData.newPassword}
                        onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, newPassword: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        required
                        minLength="8"
                        className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                        placeholder="Confirm new password"
                        value={forgotPasswordData.confirmPassword}
                        onChange={(e) =>
                          setForgotPasswordData({ ...forgotPasswordData, confirmPassword: e.target.value })
                        }
                        disabled={loading}
                      />
                    </div>

                    {forgotPasswordData.newPassword &&
                      forgotPasswordData.confirmPassword &&
                      forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword && (
                        <p className="text-sm text-red-600 flex items-center">
                          <span className="mr-2">⚠️</span>
                          Passwords do not match
                        </p>
                      )}

                    {forgotPasswordData.newPassword && forgotPasswordData.newPassword.length < 8 && (
                      <p className="text-sm text-red-600 flex items-center">
                        <span className="mr-2">⚠️</span>
                        Password must be at least 8 characters
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={
                        loading ||
                        forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword ||
                        forgotPasswordData.newPassword.length < 8
                      }
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Resetting...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center">
                          <span className="mr-2">🔄</span>
                          Reset Password
                        </span>
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setForgotPasswordData({ ...forgotPasswordData, step: "verify-otp" })}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        ← Back to verification
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
