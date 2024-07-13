import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import asyncHandler from "express-async-handler"

import { ProtectedRequest } from "../middleware/authMiddleware"

import Layout from "../models/Layout.model"
import User from "../models/User.model"

// register user
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, password, confirmPassword } = req.body

  const usernameError = []
  const passwordError = []
  const confirmPasswordError = []

  if (!username) {
    usernameError.push("Please add username")
  }

  if (!password) {
    passwordError.push("Please add password")
  }

  if (!confirmPassword) {
    confirmPasswordError.push("Please confirm password")
  }

  if (username.length < 6) {
    usernameError.push("Username is too short")
  }

  if (username.length > 24) {
    usernameError.push("Username is too long")
  }

  if (password.length < 6) {
    passwordError.push("Password is too short")
  }

  if (password.length > 40) {
    passwordError.push("Password is too long")
  }

  if (password !== confirmPassword) {
    passwordError.push("passwords do not match")
    confirmPasswordError.push("passwords do not match")
  }

  // check if user exists
  const userExists = await User.findOne({ username })

  if (userExists) {
    usernameError.push("user with this username already exists")
  }

  if (usernameError.length > 0 || passwordError.length > 0 || confirmPasswordError.length > 0) {
    res.status(400).json({
      usernameError,
      passwordError,
      confirmPasswordError,
      message: "incorrect credentials",
    })
    return
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

  const geoLayout = await Layout.findById(user.selectedLayout.Geo)
  const enLayout = await Layout.findById(user.selectedLayout.Eng)

  const layout = { Geo: geoLayout, Eng: enLayout }

  if (user) {
    res.status(201).json({
      user: {
        _id: user.id,
        username: user.username,
        accountType: user.accountType,
        pvpHistory: user.pvpHistory,
        selectedLayout: layout,
        appSettings: user.appSettings,
        typingSettings: user.typingSettings,
        completedAssessments: user.completedAssessments,
        completedLessons: user.completedLessons,
        createdLayoutCounter: user.createdLayoutCounter,
      },
      token: generateToken(user._id),
    })
    return
  } else {
    res.status(400).json({ message: "invalid user data" })
    return
  }
})

// logs in user
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body

  const usernameError = []
  const passwordError = []

  if (!username) {
    usernameError.push("Please, add username")
  }

  if (!password) {
    passwordError.push("Please, add password")
  }

  if (usernameError.length > 0 || passwordError.length > 0) {
    res.status(400).json({ usernameError, passwordError })
    return
  }

  const user = await User.findOne({ username: username })

  if (!user) {
    res
      .status(400)
      .json({ usernameError: ["user with this username does not exist"], passwordError: [] })
    return
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    const geoLayout = await Layout.findById(user.selectedLayout.Geo)
    const enLayout = await Layout.findById(user.selectedLayout.Eng)

    const layout = { Geo: geoLayout, Eng: enLayout }

    res.status(201).json({
      user: {
        _id: user.id,
        username: user.username,
        accountType: user.accountType,
        pvpHistory: user.pvpHistory,
        selectedLayout: layout,
        appSettings: user.appSettings,
        typingSettings: user.typingSettings,
        completedAssessments: user.completedAssessments,
        completedLessons: user.completedLessons,
        createdLayoutCounter: user.createdLayoutCounter,
      },
      token: generateToken(user._id),
    })
    return
  } else {
    res.status(400).json({ usernameError: [], passwordError: ["incorrect password"] })
    return
  }
})

// generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" }) // it will expire in 1 day (24hours)
}
