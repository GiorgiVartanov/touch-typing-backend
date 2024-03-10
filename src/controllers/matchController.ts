import { Request, Response } from "express"
import asyncHandler from "express-async-handler"

import Match from "../models/Match.model"

export const getMatch = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const data = await Match.findById(id)

  if (!data) {
    res.status(400)
    throw new Error("Something went wrong")
  }

  res.status(200).json(data)
})

export const getMatches = async (req: Request, res: Response) => {
  const { username } = req.query

  let data

  if (username) {
    var query = {}
    query["players." + String(username)] = { $exists: true }

    data = await Match.find(query)
  } else data = await Match.find()

  if (!data) {
    res.status(400)
    throw new Error("Something went wrong")
  }

  res.status(200).json(data)
}
