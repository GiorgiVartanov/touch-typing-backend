import express, { Express, Router, Request, Response } from "express"
import dotenv from "dotenv"
import cors from "cors"
import http from "http"

import errorHandler from "./middleware/errorMiddleware"
import connectDB from "./config/db"
import { ServerSocket } from "./socket/socket"

import appSettingsRoutes from "./routes/appSettingsRoutes"
import authRoutes from "./routes/authRoutes"
import practiceRoutes from "./routes/practiceRoutes"
import typingSettingsRoutes from "./routes/typingSettingRoutes"
import userRoutes from "./routes/userRoutes"
import matchRoutes from "./routes/matchRoutes"
import LayoutRoutes from "./routes/layoutRoutes"
import LessonRoutes from "./routes/lessonRoutes"

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 5000

//server handling
const httpServer = http.createServer(app)

//start the socket
new ServerSocket(httpServer)

connectDB()

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use("/appsettings", appSettingsRoutes)
app.use("/auth", authRoutes)
app.use("/practice", practiceRoutes)
app.use("/typingsettings", typingSettingsRoutes)
app.use("/user", userRoutes)
app.use("/match", matchRoutes)
app.use("/layout", LayoutRoutes)
app.use("/lesson", LessonRoutes)

app.use(errorHandler)

httpServer.listen(PORT, () => console.log(`Listening on port ${PORT}`))
