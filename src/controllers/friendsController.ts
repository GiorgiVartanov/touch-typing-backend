import { Request, Response, NextFunction } from "express"
import asyncHandler from "express-async-handler"
import { ProtectedRequest } from "../middleware/authMiddleware"

import User from "../models/User.model"

export const removeFriend = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { username } = req.user
  const { friendUsername: friendToDeleteUsername } = req.body

  const friendToRemove = await User.findOne({ username: friendToDeleteUsername })

  const currentUser = await User.findOne({ username: username })

  // checks if users are friends
  if (
    !friendToRemove.friends
      .map((friend) => friend._id.toString())
      .includes(currentUser._id.toString()) ||
    !currentUser.friends
      .map((friend) => friend._id.toString())
      .includes(friendToRemove._id.toString())
  ) {
    res.status(400)
    throw new Error(`you are not friends with ${friendToDeleteUsername}`)
  }

  // removes current user from friend's friend list
  friendToRemove.friends = friendToRemove.friends.filter(
    (friend) => friend._id.toString() !== currentUser._id.toString()
  )

  // removes friend from current user's friend list
  currentUser.friends = currentUser.friends.filter(
    (friend) => friend._id.toString() !== friendToRemove._id.toString()
  )

  try {
    currentUser.save()
    friendToRemove.save()
  } catch (error) {
    res.status(400)
    throw new Error(
      `something went wrong while deleting ${friendToDeleteUsername}from your friend list, try again latter`
    )
  }

  res
    .status(200)
    .json({ message: `successfully removed ${friendToDeleteUsername} from you friend list` })
})

export const getFriends = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params

  const user = await User.findOne({ username: username })

  if (!user) {
    res.status(400)
    throw new Error("this user does not exist")
  }

  const userFriendsUsernames = await Promise.all(
    user.friends.map(async (friendId) => {
      const friend = await User.findById(friendId)
      return friend.username
    })
  )

  if (!userFriendsUsernames) {
    res.status(400)
    throw new Error("something went wrong")
  }

  res
    .status(200)
    .json({ data: userFriendsUsernames, message: `successfully fetched ${username}'s friends` })
})
