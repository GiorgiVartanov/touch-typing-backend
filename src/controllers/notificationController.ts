import { Request, Response, NextFunction } from "express"
import asyncHandler from "express-async-handler"
import { Socket } from "socket.io"

import User, { UserInterface } from "../models/User.model"
import Notification, { NotificationInterface } from "../models/Notification.model"
import { ProtectedRequest } from "../middleware/authMiddleware"

export const getNotifications = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const user = req.user

  const userNotifications = await Notification.find({ receiver: user }).sort({ timestamp: -1 })

  const notificationsToSend = await Promise.all(
    userNotifications.map(async (notification) => {
      const sender = await User.findById(notification.sender)

      return {
        _id: notification._id,
        notificationType: notification.notificationType,
        sender: sender.username,
        status: notification.status,
        text: notification.text,
        read: notification.read,
        timestamp: notification.timestamp,
      }
    })
  )
  res.status(200).json({ data: notificationsToSend })
})

export const sendFriendRequest = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const sender = req.user
  const { username } = req.body

  const receiver = await User.findOne({ username: username })

  if (receiver.friends.includes(sender._id)) {
    res.status(400)
    throw new Error("you are already friends")
  }

  const wasAlreadySent = await Notification.findOne({
    notificationType: "friendRequest",
    receiver: receiver._id,
    sender: sender._id,
    status: "pending",
  })

  if (wasAlreadySent) {
    res.status(400)
    throw new Error(
      "you have already sent friend notification for this user, wait for them to respond"
    )
  }

  const notification = {
    notificationType: "friendRequest",
    receiver: receiver._id,
    sender: sender._id,
    text: `${sender.username} sent you a friend request`,
    timestamp: new Date(),
  }

  const newNotification = await Notification.create(notification)

  if (!newNotification) {
    res.status(400)
    throw new Error("something went wrong while sending friends request")
  }

  sender.sentFriendRequests = [...sender.sentFriendRequests, receiver._id]

  sender.save()

  res.status(200).json({ message: "friend request successfully sent" })
})

export const acceptFriendRequest = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const currentUser = req.user
  const { notificationId } = req.body

  const notification = await Notification.findById(notificationId)

  if (!notification) {
    res.status(400)
    throw new Error("notification with this id does not exist")
  }

  if (!notification.receiver.equals(currentUser._id)) {
    res.status(400)
    throw new Error("error")
  }

  if (currentUser.friends.includes(notification.sender)) {
    res.status(400)
    throw new Error("this user is already your friend")
  }

  const sender = await User.findById(notification.sender)

  currentUser.friends = [...currentUser.friends, sender._id]
  sender.sentFriendRequests = sender.sentFriendRequests.filter(
    (friend) => friend._id !== currentUser._id
  )
  sender.friends = [...sender.friends, currentUser._id]
  notification.status = "accepted"

  await currentUser.save()
  await sender.save()
  await notification.save()

  res.status(200).json({
    message: "friend request accepted successfully",
  })
})

export const declineFriendRequest = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const currentUser = req.user
  const { senderUsername } = req.body

  const sender = await User.findOne({ username: senderUsername })

  const friendRequestNotification = await Notification.findOne({
    sender: sender._id,
    receiver: currentUser._id,
    notificationType: "friendRequest",
    active: false,
  })

  if (!friendRequestNotification) {
    res.status(400)
    throw new Error("this notification does not exist")
  }

  // notification.status = "declined"

  await friendRequestNotification.save()

  res.status(200).json({
    message: "friend request denied successfully",
  })
})
