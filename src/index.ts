import express, { Express, Router, Request, Response } from "express"
import dotenv from "dotenv"
import cors from "cors"

import errorHandler from "./middleware/errorMiddleware"
import connectDB from "./config/db"

import authRoutes from "./routes/authRoutes"
import lessonRoutes from "./routes/lessonRoutes"
import typingSettingsRoutes from "./routes/typingSettingRoutes"
import settingsRoutes from "./routes/settingsRoutes"

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 5000

connectDB()

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use("/api/auth", authRoutes)
app.use("/api/lesson", lessonRoutes)
app.use("/api/typingsettings", typingSettingsRoutes)
app.use("/api/settings", settingsRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`)
})
