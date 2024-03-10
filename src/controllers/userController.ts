import { Request, Response, NextFunction } from "express"
import asyncHandler from "express-async-handler"

import User from "../models/User.model"
import { ProtectedRequest } from "../middleware/authMiddleware"

// gets user's data
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params

  const user = await User.findOne({ username: username })

  const userFriends = await Promise.all(
    user.friends.map(async (friendId) => {
      const friend = await User.findById(friendId)
      return friend.username
    })
  )

  const userToSend = {
    username: user.username,
    friends: userFriends,
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
