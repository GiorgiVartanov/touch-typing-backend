import { Request, Response, NextFunction } from "express"
import asyncHandler from "express-async-handler"

import User from "../models/User.model"
import Layout from "../models/Layout.model"
import { ProtectedRequest } from "../middleware/authMiddleware"
import jwt from "jsonwebtoken"

const getUserFromToken = async (req: Request) => {
  const token = req.headers.authorization?.split(" ")[1] // Assuming the token is sent as "Bearer <token>"
  if (!token) return null

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string)
    const user = await User.findById(decoded.id)
    return user
  } catch (error) {
    return null
  }
}

// gets user's data
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params

  const user = await User.findOne({ username: username })

  const createdLayouts = await Layout.find({ _id: { $in: user.createdLayouts } })

  const userToSend = {
    username: user.username,
    selectedLayout: user.selectedLayout,
    createdLayouts: createdLayouts,
    accountType: user.accountType,
  }

  if (!user) {
    const error = new Error("user with this username does not exist")
    res.status(400).json({ error })
    return
  }

  res.status(200).json({ data: userToSend, message: "user data successfully fetched" })
})

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { username, sort, sortDirection } = req.query

  const selectedFields = {
    username: 1,
  }

  const sortOptions = ["alphabetical", "elo"]
  const sortCriteria: any = {}

  const searchQuery: any = {}

  if (username) {
    searchQuery.username = { $regex: username as string, $options: "i" }
  }

  if (sort) {
    if (!sortOptions.includes(sort as string)) {
      const error = new Error("invalid sorting option")
      res.status(400).json({ error })
      return
    }

    switch (sort) {
      case "alphabetical":
        sortCriteria.username = sortDirection === "desc" ? -1 : 1
        break
      case "elo":
        sortCriteria.elo = sortDirection === "desc" ? -1 : 1
        break
      default:
        break
    }
  }

  const users = await User.find(searchQuery).select(selectedFields).sort(sortCriteria)

  const usernames = users.map((user) => user.username)

  res.status(200).json({ data: usernames, message: "users successfully fetched" })
})

export const getAllUsersWithRating = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find()

  const usersnames_and_rating = users.reduce((accumulate, item) => {
    accumulate.push({ username: item.username, rating: item.rating })
    return accumulate
  }, [])

  res
    .status(200)
    .json({ data: usersnames_and_rating, message: "all the users have successfuly been fetched" })
})

export const incrementLayoutCounter = asyncHandler(async (req: Request, res: Response) => {
  console.log("got in here")
  const user = await getUserFromToken(req)
  console.log("out of here")
  if (!user) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }
  console.log(user)
  user.createdLayoutCounter = (user.createdLayoutCounter || 0) + 1

  await user.save()

  res.status(200).json({
    message: "Layout counter incremented successfully",
    createdLayoutCounter: user.createdLayoutCounter,
  })
})
