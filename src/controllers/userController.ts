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
