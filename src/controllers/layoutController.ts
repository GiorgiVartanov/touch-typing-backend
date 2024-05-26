import { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { LayoutInterface } from "../models/Layout.model"
import { ProtectedRequest } from "../middleware/authMiddleware"
import {  isValidObjectId } from "mongoose"

import Layout from "../models/Layout.model"
import User from "../models/User.model"

export const getLayout = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const data = await Layout.findById(id)
    res.status(200).json(data)
  } catch (error) {
    res.status(400)
    throw new Error(error)
  }
})

export const getSelectedLayout = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const user = req.user

  const geoLayout = await Layout.findById(user.selectedLayout.Geo)
  const enLayout = await Layout.findById(user.selectedLayout.Eng)

  const layout = { Geo:geoLayout, Eng:enLayout }

  try {
    res.status(200).json(layout)
  } catch (error) {
    res.status(400)
    throw new Error(error)
  } 
})

export const getLayouts = asyncHandler(async(req: Request, res: Response) => {
  const {
    text,
    language,
    page,
  } = req.query

  const pageSize = 20

  const searchQuery: any = {}

  if (text) {
    searchQuery.title = { $regex: text as string, $options: "i" }
  }

  if (language && language !== "All") {
    searchQuery.language = language as string
  }


  const totalAmount: number = await Layout.countDocuments(searchQuery)
  const totalPages: number = Math.ceil(totalAmount / pageSize)

  const skip = parseInt(page as string) * pageSize
  const data: LayoutInterface[] = await Layout.find(searchQuery).skip(skip).limit(pageSize)

  const currentPage: number = parseInt(page as string)
  const hasNextPage: boolean = currentPage < totalPages

  let nextPage

  if (hasNextPage) {
    nextPage = currentPage + 1
  } else {
    nextPage = undefined
  }

  if (!data) {
    res.status(400)
    throw new Error("Something went wrong")
  }

  res.status(200).json({ data, pagination: { totalPages, currentPage, nextPage, hasNextPage } })
})

export const selectLayout = asyncHandler(async(req: ProtectedRequest, res: Response) => {
  const user = req.user

  const {id, language} = req.body

  const availableLanguages = ["Eng", "Geo"]

  if(!isValidObjectId(id)) {
    res.status(400)
    throw new Error("Passed id is not valid")
  }

  if(!availableLanguages.includes(language)) {
    res.status(400)
    throw new Error("Wrong language")
  }

  try {
    user.selectedLayout[language] = id
    user.save()
  } catch (error) {
    res.status(400)
    throw new Error("Something went wrong")
  }
})

export const addLayout = asyncHandler(async(req: ProtectedRequest, res:Response) => {
  const { layout: {keyboard, language, title} } = req.body
  const user = req.user

  console.log(keyboard[0])

   if(keyboard.length !== 61) {
    res.status(400)
    throw new Error("something went wrong")
  }

  try {
    const newLayout = await Layout.create({
      keyboard: keyboard,
      language: language,
      title: title,
      public: false, // make it changeable 
      official: false,
      creator: user._id,
    })
  
    user.createdLayouts = [...user.createdLayouts, newLayout._id]

    await user.save()

    res.status(200).json({ message: `${title} layout was successfully posted` })
  } catch (error) {
    res.status(400)
    throw new Error(`something went wrong: ${error}`)
  }
})
