import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import asyncHandler from "express-async-handler"
import User from "../models/User.model"
import { ProtectedRequest } from "../middleware/authMiddleware"

// register user
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body

  console.log({ username, password })

  if (!username || !password) {
    res.status(400)
    throw new Error("Please add all fields")
  }

  // check if user exists
  const userExists = await User.findOne({ username })

  if (userExists) {
    res.status(400)
    throw new Error("User with this username already exists")
  }

  // hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // create user
  const user = await User.create({
    username: username,
    password: hashedPassword,
    accountType: "User",
  })

  if (user) {
    res.status(201).json({
      user: {
        _id: user.id,
        username: user.username,
        accountType: user.accountType,
      },
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error("Invalid user data")
  }
})

// logs in user
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body

  if (!username || !password) {
    res.status(400)
    throw new Error("Please add all fields")
  }

  const user = await User.findOne({ username: username })

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      user: {
        _id: user.id,
        username: user.username,
        accountType: user.accountType,
      },
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error("Invalid credentials")
  }
})

// generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" }) // it will expire in 1 day (24hours)
}
