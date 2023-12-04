import { Request, Response, NextFunction } from "express"
import asyncHandler from "express-async-handler"
import { ProtectedRequest } from "../middleware/authMiddleware"

import User from "../models/User.model"

// get friends (users who are friends with the passed user (friends == follow each other))
export const getUserFriends = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params

  if (!username) {
    res.status(400)
    throw new Error("username was not provided")
  }

  const user = await User.findOne({ username: username })

  const userFriendsIds = user.friends

  const userFriendsData = await Promise.all(
    userFriendsIds.map(async (friendId) => {
      return await User.findById(friendId)
    })
  )

  const userFriends = userFriendsData.map((friend) => ({
    username: friend.username,
    _id: friend._id,
    rating: friend.rating,
  }))

  res.status(200).json({ data: userFriends })
})

// get followings (users who are followed by the passed user)
export const getUserFollowings = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params

  if (!username) {
    res.status(400)
    throw new Error("username was not provided")
  }

  const user = await User.findOne({ username: username })

  const userFollowingsIds = user.follows

  const userFollowingsData = await Promise.all(
    userFollowingsIds.map(async (followId) => {
      return await User.findById(followId)
    })
  )

  const userFollowings = userFollowingsData.map((follow) => ({
    username: follow.username,
    _id: follow._id,
    rating: follow.rating,
  }))

  res.status(200).json({ data: userFollowings })
})

// get followers (users who follow passed users)
export const getUserFollowers = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params

  if (!username) {
    res.status(400)
    throw new Error("username was not provided")
  }

  const user = await User.findOne({ username: username })

  const userFollowersIds = user.followers

  const userFollowersData = await Promise.all(
    userFollowersIds.map(async (followerId) => {
      return await User.findById(followerId)
    })
  )

  const userFollowers = userFollowersData.map((follower) => ({
    username: follower.username,
    _id: follower._id,
    rating: follower.rating,
  }))

  res.status(200).json({ data: userFollowers })
})

export const followUser = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { username } = req.params
  const currentUser = req.user

  if (!username) {
    res.status(400)
    throw new Error("username was not provided")
  }

  const userToFollow = await User.findOne({ username: username })

  // if user tries to follow same user for a second time
  if (currentUser.follows.includes(userToFollow._id)) {
    res.status(400)
    throw new Error(`${username} is already followed by ${currentUser.username}`)
  }

  // if followed user is already following
  if (currentUser.followers.includes(userToFollow._id)) {
    User.updateOne(
      { _id: currentUser._id },
      { $set: { friends: [...currentUser.friends, userToFollow._id] } }
    ).exec()
  }

  User.updateOne(
    { _id: currentUser._id },
    { $set: { follows: [...currentUser.follows, userToFollow._id] } }
  ).exec()
  User.updateOne(
    { _id: userToFollow._id },
    { $set: { followers: [...userToFollow.followers, currentUser._id] } }
  ).exec()

  res.status(200).json({ message: `${currentUser.username} follows ${userToFollow.username}` })
})

export const unfollowUser = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { username } = req.params
  const currentUser = req.user

  if (!username) {
    res.status(400)
    throw new Error("username was not provided")
  }

  const userToUnFollow = await User.findOne({ username: username })

  // if user tries to unfollow user that they are not following
  if (!currentUser.follows.includes(userToUnFollow._id)) {
    res.status(400)
    throw new Error(`${username} is not followed by ${currentUser.username}`)
  }

  // if user unfollows their friend
  if (currentUser.friends.includes(userToUnFollow._id)) {
    User.updateOne(
      { _id: currentUser._id },
      {
        $set: {
          friends: currentUser.friends.filter((friendId) => friendId !== userToUnFollow._id),
        },
      }
    ).exec()
  }

  console.log(
    currentUser.follows,
    currentUser.follows.filter((followId) => followId !== userToUnFollow._id)
  )

  User.updateOne(
    { _id: currentUser._id },
    { $set: { follows: currentUser.follows.filter((followId) => followId !== userToUnFollow._id) } }
  ).exec()

  User.updateOne(
    { _id: userToUnFollow._id },
    {
      $set: {
        followers: userToUnFollow.followers.filter((followerId) => followerId !== currentUser._id),
      },
    }
  ).exec()

  res.status(200).json({
    message: `${currentUser.username} unfollows ${userToUnFollow.username}`,
  })
})
