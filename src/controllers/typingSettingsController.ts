import { Request, Response, NextFunction } from "express"
import asyncHandler from "express-async-handler"

import User from "../models/User.model"
import { ProtectedRequest } from "../middleware/authMiddleware"

const availableTypingSettings = [
  "selectedFont",
  "amountOfShownLines",
  "alignText",
  "fontSize",
  "lineHeight",
  "letterSpacing",
]

export const setTypingSettings = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { typingSettingToChange, value } = req.body
  const user = req.user

  if (!availableTypingSettings.includes(typingSettingToChange)) {
    res.status(400)
    throw new Error("unrecognized typing setting")
  }

  const updatedTypingSettings = {
    ...user.typingSettings,
    [typingSettingToChange]: value,
  }

  user.typingSettings = updatedTypingSettings

  const savedUser = await user.save()

  if (savedUser) {
    res.status(200).json({ success: true })
  } else {
    res.status(400)
    throw new Error("Something went wrong, could not save data")
  }
})
