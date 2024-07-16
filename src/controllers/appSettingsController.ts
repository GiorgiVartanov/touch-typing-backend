import { Response } from "express"
import asyncHandler from "express-async-handler"

import { ProtectedRequest } from "../middleware/authMiddleware"

const availableAppSettings = ["theme", "language"]

export const setAppSettings = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { appSettingToChange, value } = req.body
  const user = req.user

  if (!availableAppSettings.includes(appSettingToChange)) {
    res.status(400)
    throw new Error(`unrecognized typing setting ${appSettingToChange}`)
  }

  const updatedAppSettings = {
    ...user.appSettings,
    [appSettingToChange]: value,
  }

  user.appSettings = updatedAppSettings

  const savedUser = await user.save()

  if (savedUser) {
    res.status(200).json({ success: true })
  } else {
    res.status(400)
    throw new Error("Something went wrong, could not save data")
  }
})

export const getAppSettings = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const user = req.user

  const appSettings = user.appSettings

  if (!appSettings) {
    res.status(400)
    throw new Error("Something went wrong")
  }

  res.status(200).json(appSettings)
})
