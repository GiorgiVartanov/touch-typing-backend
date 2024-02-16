import express, { Express, Router, Request, Response } from "express"
import dotenv from "dotenv"
import cors from "cors"

import errorHandler from "./middleware/errorMiddleware"
import connectDB from "./config/db"

import authRoutes from "./routes/authRoutes"
import lessonRoutes from "./routes/lessonRoutes"
import typingSettingsRoutes from "./routes/typingSettingRoutes"
import appSettingsRoutes from "./routes/appSettingsRoutes"
import matchRoutes from "./routes/matchRoutes"
import { ServerSocket } from "./socket/socket"
import http from 'http'

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 5000

//server handling
const httpServer = http.createServer(app);

//start the socket
new ServerSocket(httpServer);

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
app.use("/api/appsettings", appSettingsRoutes)
app.use("/api/match", matchRoutes)

app.use(errorHandler)

httpServer.listen(PORT, () => console.log(`Listening on port ${PORT}`));