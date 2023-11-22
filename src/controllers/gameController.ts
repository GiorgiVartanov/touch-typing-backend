import {Request, Response} from "express"
import asyncHandler from "express-async-handler"

import Game from "../models/Game.model";

export const getGame = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const data = await Game.find({ guid: { $regex: id } })

    if (!data) {
        res.status(400)
        throw new Error("Something went wrong")
    }

    res.status(200).json(data)
})

export const getGames = (async (req: Request, res: Response) => {

    const data = await Game.find()

    if (!data) {
        res.status(400)
        throw new Error("Something went wrong")
    }

    res.status(200).json(data)
})