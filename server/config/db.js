const mysql = require("mysql")
const dotenv = require("dotenv")
const fs = require("fs")
const path = require("path")

dotenv.config()

let db

function handleDisconnect() {
  try {
    db = mysql.createConnection({
      host: "localhost",
      user: process.env.DB_USER,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
    })

    db.connect((err) => {
      if (err) {
        console.error("❌ Error connecting to DB:", err.message)
        // Retry after 2s
        setTimeout(handleDisconnect, 2000)
        return
      }

      console.log("✅ Database connected successfully.")

      try {
        // Run schema only at first connection
        const initSqlPath = path.join(__dirname, "init.sql")
        if (fs.existsSync(initSqlPath)) {
          const initSql = fs.readFileSync(initSqlPath, "utf8")

          const statements = initSql
            .split(";")
            .map((stmt) => stmt.trim())
            .filter((stmt) => stmt.length > 0)

          statements.forEach((sql, index) => {
            db.query(sql, (err) => {
              if (err) {
                console.error(`❌ Error executing SQL statement ${index + 1}: ${err.sqlMessage}`)
              } else {
                console.log(`✅ SQL statement ${index + 1} executed successfully.`)
              }
            })
          })
        }
      } catch (fileErr) {
        console.error("⚠️ Error reading/executing init.sql:", fileErr.message)
      }
    })

    db.on("error", (err) => {
      console.error("⚠️ DB error:", err.message)
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        console.log("🔄 Reconnecting to DB...")
        handleDisconnect()
      } else {
        throw err
      }
    })
  } catch (outerErr) {
    console.error("❌ Unexpected DB error:", outerErr.message)
    // Retry after 5s if something unexpected breaks
    setTimeout(handleDisconnect, 5000)
  }
}

// Start DB connection
handleDisconnect()

module.exports = { db }
