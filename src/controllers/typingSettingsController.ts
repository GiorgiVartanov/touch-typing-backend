import { Request, Response, NextFunction } from "express"
import asyncHandler from "express-async-handler"

import User from "../models/User.model"
import { ProtectedRequest } from "../middleware/authMiddleware"

export const setTypingSettings = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { typingSettingToChange, value } = req.body
  const user = req.user

  const currentUser = await User.findById(user._id)

  if (!currentUser) {
    res.status(400)
    throw new Error("unexpected error")
  }

  const updatedTypingSettings = {
    ...currentUser.typingSettings,
    [typingSettingToChange]: value,
  }

  currentUser.typingSettings = updatedTypingSettings

  const savedUser = await currentUser.save()

  if (savedUser) {
    res.status(200).json({ success: true })
  } else {
    res.status(400)
    throw new Error("Something went wrong, could not save data")
  }
})
