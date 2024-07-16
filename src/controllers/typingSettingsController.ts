import { Response } from "express"
import asyncHandler from "express-async-handler"

import { ProtectedRequest } from "../middleware/authMiddleware"

const availableTypingSettings = [
  "font",
  "fontSize",
  "keyboardLanguage",
  "keyboardType",
  "keyboardSize",
  "showColoredKeys",
  "showKeyboardWhileTyping",
]

export const setTypingSettings = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { typingSettingToChange, value } = req.body
  const user = req.user

  if (!availableTypingSettings.includes(typingSettingToChange)) {
    res.status(400)
    throw new Error(`unrecognized typing setting ${typingSettingToChange}`)
  }

  const updatedTypingSettings = {
    ...user.typingSettings,
    [typingSettingToChange]: value,
  }

  user.typingSettings = updatedTypingSettings

  try {
    const savedUser = await user.save()

    if (!savedUser) {
      res.status(400).json({ message: "Could not save data" })
      return
    }

    res.status(200).json({ message: "setting were successfully updated" })
  } catch (error) {
    res.status(500).json({ message: "unexpected error" })
  }
})

export const setLayout = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const user = req.user
  const { layout } = req.body

  user.selectedLayout = layout

  try {
    const savedUser = await user.save()

    if (!savedUser) {
      res.status(400).json({ message: "Could not save data" })
      return
    }

    res.status(200).json({ message: "layout updated" })
  } catch (error) {
    res.status(500).json({ message: "unexpected error" })
  }
})

export const getTypingSettings = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const user = req.user

  const typingSettings = user.typingSettings

  if (!typingSettings) {
    res.status(400)
    throw new Error("Something went wrong")
  }

  res.status(200).json(typingSettings)
})
