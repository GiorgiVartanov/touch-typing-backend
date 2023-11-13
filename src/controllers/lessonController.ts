import { Request, Response, NextFunction } from "express"
import asyncHandler from "express-async-handler"
import { ProtectedRequest } from "../middleware/authMiddleware"

import generateFakeWords from "../util/generateFakeWords"
import generateRandomNumber from "../util/generateRandomNumber"

import Lesson from "../models/Lesson.model"
import Letter from "../models/Letter.model"
import generateFakeWordsIncremental from "../util/generateFakeWordsIncremental"

const georgianLetters = [
  "ა",
  "ბ",
  "გ",
  "დ",
  "ე",
  "ვ",
  "ზ",
  "თ",
  "ი",
  "კ",
  "ლ",
  "მ",
  "ნ",
  "ო",
  "პ",
  "ჟ",
  "რ",
  "ს",
  "ტ",
  "უ",
  "ფ",
  "ქ",
  "ღ",
  "ყ",
  "შ",
  "ჩ",
  "ც",
  "ძ",
  "წ",
  "ჭ",
  "ხ",
  "ჯ",
  "ჰ",
]

const georgianLettersByFrequency = ['ა', 'ი', 'ე', 'ს', 'რ', 'მ', 'ო', 'დ', 'ვ', 'ნ', 'ლ', 'ბ', 'უ', 'თ', 'გ', 'ხ', 'შ', 'ც', 'კ', 'ტ', 'ქ', 'ყ', 'ზ', 'წ', 'ფ', 'ჩ', 'ღ', 'პ', 'ძ', 'ჯ', 'ჭ', 'ჰ', 'ჟ']

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

  const desiredLetter = letter || georgianLetters[generateRandomNumber(0, georgianLetters.length)]

  const letterItem = await Letter.findOne({ letter: desiredLetter })

  try {
    const fakeWords = generateFakeWords(
      letterItem,
      Number(amount) || undefined,
      Number(minAmountOfSyllables) || undefined,
      Number(maxAmountOfSyllables) || undefined,
      Number(minLengthOfWord) || undefined,
      Number(maxLengthOfWord) || undefined
    )

    res.status(200).json({ data: fakeWords })
  } catch (error) {
    res.status(400)
    throw new Error(error)
  }
})

// returns syllables for incremental learning
export const getFakeWordsIncremental = asyncHandler(async (req: Request, res: Response) => {
  let {
    activeletter,
    amount,
  } = req.query

  // first N (5) letters come together by default, meaning all of them could appear in syllables by default
  const defaultStarterLetters = georgianLettersByFrequency.slice(0, 5)

  if (defaultStarterLetters.includes(activeletter as string)) {
    activeletter = defaultStarterLetters[defaultStarterLetters.length-1]
  }

  const activLetterSyllablesObj = await Letter.findOne({ letter: activeletter })

  try {
    const fakeWordsIncremental = generateFakeWordsIncremental(
      activLetterSyllablesObj,
      Number(amount) || undefined,
    )

    res.status(200).json({ data: fakeWordsIncremental })
  } catch (error) {
    res.status(400)
    throw new Error(error)
  }
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
