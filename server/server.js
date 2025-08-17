const express = require("express")
const cors = require("cors") // Added cors import
const app = express()
require("dotenv").config()

const PORT = process.env.PORT || 5000

app.use(cors());

// Middleware
app.use(express.json())

// Routes (inside routes folder)
const dashboardRoutes = require("./routes/dashboardRoutes")
const inspectionRoutes = require("./routes/inspectionRoutes")
const propertyRoutes = require("./routes/propertyRoutes")
const userRoutes = require("./routes/userRoutes")

app.use("/api/dashboard", dashboardRoutes)
app.use("/api/inspections", inspectionRoutes)
app.use("/api/properties", propertyRoutes)
app.use("/api/users", userRoutes)

// Root test route
app.get("/", (req, res) => {
  res.send("<h1>Its working</h1>")
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
