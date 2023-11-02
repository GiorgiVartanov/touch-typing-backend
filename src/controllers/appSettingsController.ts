import { Request, Response, NextFunction } from "express"
import asyncHandler from "express-async-handler"

import User from "../models/User.model"
import { ProtectedRequest } from "../middleware/authMiddleware"

const availableAppSettings = ["preferredTheme", "isProfilePublic", "favoriteLayout"]

export const setAppSettings = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { appSettingToChange, value } = req.body
  const user = req.user

  if (!availableAppSettings.includes(appSettingToChange)) {
    res.status(400)
    throw new Error("unrecognized app setting")
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
