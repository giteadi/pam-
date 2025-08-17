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

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    role: "admin",
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
          role: loginData.role,
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
    <div className="min-h-screen flex items-center justify-center bg-background p-3">
      <div className="w-full max-w-sm">
        {/* Header - Reduced spacing */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-lg mb-3">
            <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">Property Inspector</h2>
          <p className="text-sm text-muted-foreground">Manage your inspections</p>
        </div>

        {/* Card Container - More compact */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          {/* Tab Navigation - Reduced padding */}
          <div className="flex border-b border-border">
            {[
              { id: "login", label: "Login" },
              { id: "register", label: "Register" },
              { id: "forgot", label: "Reset" },
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
                className={`flex-1 py-2.5 px-3 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-accent border-b-2 border-accent bg-accent/5"
                    : "text-muted-foreground hover:text-card-foreground hover:bg-muted/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content - Reduced padding */}
          <div className="p-4">
            {/* Messages - More compact */}
            {error && (
              <div className="mb-3 bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded text-xs">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-3 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-xs">
                {success}
              </div>
            )}

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-card-foreground mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 text-sm bg-input border border-border rounded focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                    placeholder="Enter email"
                    value={loginData.email}
                    onChange={(e) => {
                      console.log("[v0] Login email change:", e.target.value)
                      setLoginData({ ...loginData, email: e.target.value })
                    }}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-card-foreground mb-1">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full px-3 py-2 text-sm bg-input border border-border rounded focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                    placeholder="Enter password"
                    value={loginData.password}
                    onChange={(e) => {
                      console.log("[v0] Login password change:", e.target.value)
                      setLoginData({ ...loginData, password: e.target.value })
                    }}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-card-foreground mb-1">Role</label>
                  <select
                    value={loginData.role}
                    onChange={(e) => setLoginData({ ...loginData, role: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-input border border-border rounded focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                    disabled={loading}
                  >
                    <option value="admin">Admin</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="client">Client</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            )}

            {/* Register Form */}
            {activeTab === "register" && (
              <>
                {otpData.step === "register" && (
                  <form onSubmit={handleRegister} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-card-foreground mb-1">First Name</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 text-sm bg-input border border-border rounded focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
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
                        <label className="block text-xs font-medium text-card-foreground mb-1">Last Name</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 text-sm bg-input border border-border rounded focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                          placeholder="Last"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-card-foreground mb-1">Email</label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 text-sm bg-input border border-border rounded focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                        placeholder="Enter email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-card-foreground mb-1">Password</label>
                      <input
                        type="password"
                        required
                        className="w-full px-3 py-2 text-sm bg-input border border-border rounded focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                        placeholder="Create password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-card-foreground mb-1">Confirm Password</label>
                      <input
                        type="password"
                        required
                        className="w-full px-3 py-2 text-sm bg-input border border-border rounded focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                        placeholder="Confirm password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-card-foreground mb-1">Role</label>
                      <select
                        value={registerData.role}
                        onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-input border border-border rounded focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
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
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium py-2.5 px-4 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-3 h-3 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin"></div>
                          <span>Sending OTP...</span>
                        </div>
                      ) : (
                        "Send Verification Code"
                      )}
                    </button>
                  </form>
                )}

                {otpData.step === "verify-otp" && (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div className="text-center mb-3">
                      <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to</p>
                      <p className="text-xs font-medium text-card-foreground">{otpData.email}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-card-foreground mb-1">Verification Code</label>
                      <input
                        type="text"
                        required
                        maxLength="6"
                        className="w-full px-3 py-2 text-sm bg-input border border-border rounded focus:ring-1 focus:ring-ring focus:border-ring transition-colors text-center tracking-widest font-mono"
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
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium py-2.5 px-4 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                          <div className="w-3 h-3 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin"></div>
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        "Verify & Create Account"
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-xs text-accent hover:text-accent/80 transition-colors"
                        disabled={loading}
                      >
                        Didn't receive code? Resend
                      </button>
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setOtpData({ ...otpData, step: "register" })}
                        className="text-xs text-muted-foreground hover:text-card-foreground transition-colors"
                      >
                        ← Back to registration
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {activeTab === "forgot" && (
              <>
                {/* Step 1: Enter Email */}
                {forgotPasswordData.step === "email" && (
                  <form onSubmit={handleForgotPasswordStep1} className="space-y-3">
                    <div className="text-center mb-3">
                      <p className="text-xs text-muted-foreground">Enter your email to receive a reset code</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-card-foreground mb-1">Email</label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 text-sm bg-input border border-border rounded focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                        placeholder="Enter email"
                        value={forgotPasswordData.email}
                        onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, email: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-muted hover:bg-muted/80 text-muted-foreground font-medium py-2.5 px-4 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-3 h-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </div>
                      ) : (
                        "Send Reset Code"
                      )}
                    </button>
                  </form>
                )}

                {/* Step 2: Verify OTP */}
                {forgotPasswordData.step === "verify-otp" && (
                  <form onSubmit={handleVerifyResetOtp} className="space-y-3">
                    <div className="text-center mb-3">
                      <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to</p>
                      <p className="text-xs font-medium text-card-foreground">{forgotPasswordData.email}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-card-foreground mb-1">Reset Code</label>
                      <input
                        type="text"
                        required
                        maxLength="6"
                        className="w-full px-3 py-2 text-sm bg-input border border-border rounded focus:ring-1 focus:ring-ring focus:border-ring transition-colors text-center tracking-widest font-mono"
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
                      className="w-full bg-muted hover:bg-muted/80 text-muted-foreground font-medium py-2.5 px-4 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-3 h-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></div>
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        "Verify Code"
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResendResetOtp}
                        className="text-xs text-accent hover:text-accent/80 transition-colors"
                        disabled={loading}
                      >
                        Didn't receive code? Resend
                      </button>
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setForgotPasswordData({ ...forgotPasswordData, step: "email" })}
                        className="text-xs text-muted-foreground hover:text-card-foreground transition-colors"
                      >
                        ← Back to email
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 3: Reset Password */}
                {forgotPasswordData.step === "reset-password" && (
                  <form onSubmit={handleResetPassword} className="space-y-3">
                    <div className="text-center mb-3">
                      <p className="text-xs text-muted-foreground">Create a new password for your account</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-card-foreground mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        minLength="8"
                        className="w-full px-3 py-2 text-sm bg-input border border-border rounded focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                        placeholder="Enter new password"
                        value={forgotPasswordData.newPassword}
                        onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, newPassword: e.target.value })}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-card-foreground mb-1">Confirm Password</label>
                      <input
                        type="password"
                        required
                        minLength="8"
                        className="w-full px-3 py-2 text-sm bg-input border border-border rounded focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
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
                        <p className="text-xs text-destructive">Passwords do not match</p>
                      )}

                    {forgotPasswordData.newPassword && forgotPasswordData.newPassword.length < 8 && (
                      <p className="text-xs text-destructive">Password must be at least 8 characters</p>
                    )}

                    <button
                      type="submit"
                      disabled={
                        loading ||
                        forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword ||
                        forgotPasswordData.newPassword.length < 8
                      }
                      className="w-full bg-muted hover:bg-muted/80 text-muted-foreground font-medium py-2.5 px-4 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-3 h-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></div>
                          <span>Resetting...</span>
                        </div>
                      ) : (
                        "Reset Password"
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setForgotPasswordData({ ...forgotPasswordData, step: "verify-otp" })}
                        className="text-xs text-muted-foreground hover:text-card-foreground transition-colors"
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
