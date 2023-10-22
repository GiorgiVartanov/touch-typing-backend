import express, { Express, Router, Request, Response } from "express"
import dotenv from "dotenv"
import cors from "cors"

import errorHandler from "./middleware/errorMiddleware"
import connectDB from "./config/db"

import authRoutes from "./routes/authRoutes"
import lessonRoutes from "./routes/lessonRoutes"

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 5000

connectDB()

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use("/api/auth", authRoutes)
app.use("/api/lesson", lessonRoutes)

console.log(process.env.NODE_ENV)

app.use(errorHandler)

app.listen(port, () => console.log(`server started on port ${port}`))
