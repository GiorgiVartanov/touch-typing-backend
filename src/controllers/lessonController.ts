import { Request, Response, NextFunction } from "express"
import asyncHandler from "express-async-handler"
import { ProtectedRequest } from "../middleware/authMiddleware"

import generateFakeWords from "../util/generateFakeWords"

import Lesson from "../models/Lesson.model"

// creates lesson for a passed values inside body
export const createLesson = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  if (req.user.accountType !== "Admin") {
    res.status(400)
    throw new Error("Unauthorized")
  }

  const { title, description, approximateDuration, level, text } = req.body

  const lesson = await Lesson.create({
    title: title,
    description: description,
    approximateDuration: approximateDuration,
    level: level,
    text: text,
  })

  if (!lesson) {
    res.status(400)
    throw new Error("something went wrong")
  }

  res.status(200).json({ message: `${title} was added` })
})

// returns lessons for a passed text query (page system may be implemented latter)
export const getLessons = asyncHandler(async (req: Request, res: Response) => {
  const { text } = req.query

  let data

  if (text) {
    data = await Lesson.find({ title: { $regex: text } })
  } else {
    data = await Lesson.find()
  }

  if (!data) {
    res.status(400)
    throw new Error("Something went wrong")
  }

  const categorizedLessons = {
    Beginner: [],
    Intermediate: [],
    Expert: [],
    Advanced: [],
  }

  data.forEach((lesson) => {
    switch (lesson.level) {
      case "Beginner":
        categorizedLessons.Beginner.push(lesson)
        break
      case "Intermediate":
        categorizedLessons.Intermediate.push(lesson)
        break
      case "Expert":
        categorizedLessons.Expert.push(lesson)
        break
      case "Advanced":
        categorizedLessons.Advanced.push(lesson)
        break
      default:
        break
    }
  })

  res.status(200).json({ data: categorizedLessons })
})

// returns fake words
export const getFakeWords = asyncHandler(async (req: Request, res: Response) => {
  const {
    letter,
    amount,
    minAmountOfSyllables,
    maxAmountOfSyllables,
    minLengthOfWord,
    maxLengthOfWord,
  } = req.query

  const fakeWords = generateFakeWords(
    (letter as string) || undefined,
    Number(amount) || undefined,
    Number(minAmountOfSyllables) || undefined,
    Number(maxAmountOfSyllables) || undefined,
    Number(minLengthOfWord) || undefined,
    Number(maxLengthOfWord) || undefined
  )

  res.status(200).json({ data: fakeWords })
})

// returns lesson for a passed _id
export const getLesson = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const data = await Lesson.findById(id)

  if (!data) {
    res.status(400)
    throw new Error("Something went wrong")
  }

  res.status(200).json(data)
})
