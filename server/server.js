const express = require("express")
const cors = require("cors")
const app = express()
const fileUpload = require("express-fileupload")
require("dotenv").config()

const PORT = process.env.PORT || 5000

// Configure CORS to allow requests from your frontend
app.use(cors())

// Middleware
app.use(express.json())
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 50 * 1024 * 1024 },
  }),
)
app.use(express.urlencoded({ extended: true }))
// Routes (inside routes folder)
const dashboardRoutes = require("./routes/dashboardRoutes")
const inspectionRoutes = require("./routes/inspectionRoutes")
const propertyRoutes = require("./routes/propertyRoutes")
const userRoutes = require("./routes/userRoutes")
const inspectorRoutes = require("./routes/inspectorRoutes")

app.use("/api/dashboard", dashboardRoutes)
app.use("/api/inspections", inspectionRoutes)
app.use("/api/properties", propertyRoutes)
app.use("/api/users", userRoutes)
app.use("/api/inspector", inspectorRoutes)

// Root test route
app.get("/", (req, res) => {
  res.send("<h1>Its working</h1>")
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
