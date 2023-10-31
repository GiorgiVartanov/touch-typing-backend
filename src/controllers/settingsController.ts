import { Request, Response, NextFunction } from "express"
import asyncHandler from "express-async-handler"

import User from "../models/User.model"
import { ProtectedRequest } from "../middleware/authMiddleware"

export const setSettings = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { settingToChange, value } = req.body
  const user = req.user
})
