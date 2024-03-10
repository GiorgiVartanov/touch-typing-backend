import { Request, Response, NextFunction } from "express"
import asyncHandler from "express-async-handler"
import { ProtectedRequest } from "../middleware/authMiddleware"

import { TextInterface } from "../models/Text.model"
import generateFakeWords from "../util/generateFakeWords"
import generateRandomNumber from "../util/generateRandomNumber"

import Text from "../models/Text.model"
import Letter from "../models/Letter.model"
import Word from "../models/Word.model"

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

// creates text for a passed values
export const createPracticeText = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  if (req.user.accountType !== "Admin") {
    res.status(400)
    throw new Error("Unauthorized")
  }

  const { title, description, level, text } = req.body

  const practiceText = await Text.create({
    title: title,
    description: description,
    level: level,
    text: text,
  })

  if (!practiceText) {
    res.status(400)
    throw new Error("something went wrong")
  }

  res.status(200).json({ message: `${title} was added` })
})

// returns texts for a passed text query (page system may be implemented latter)
export const getPracticeTexts = asyncHandler(async (req: Request, res: Response) => {
  const {
    text,
    level,
    author,
    textLengthMin,
    textLengthMax,
    writtenAfter,
    writtenBefore,
    addedAfter,
    addedBefore,
    page,
  } = req.query

  const pageSize = 20

  const searchQuery: any = {}

  if (text) {
    searchQuery.title = { $regex: text as string, $options: "i" }
  }

  if (level) {
    if (level === "Any") {
      searchQuery.level = ""
    } else {
      searchQuery.level = level as string
    }
  }

  if (author) {
    searchQuery.author = author as string
  }

  if (textLengthMin || textLengthMax) {
    searchQuery.textLength = {}
    if (textLengthMin) {
      searchQuery.textLength.$gte = parseInt(textLengthMin as string)
    }
    if (textLengthMax) {
      searchQuery.textLength.$lte = parseInt(textLengthMax as string)
    }
  }

  if (writtenAfter || writtenBefore) {
    searchQuery.written = {}
    if (writtenAfter) {
      searchQuery.written.$gte = new Date(writtenAfter as string)
    }
    if (writtenBefore) {
      searchQuery.written.$lte = new Date(writtenBefore as string)
    }
  }

  if (addedAfter || addedBefore) {
    searchQuery.added = {}
    if (addedAfter) {
      searchQuery.added.$gte = new Date(addedAfter as string)
    }
    if (addedBefore) {
      searchQuery.added.$lte = new Date(addedBefore as string)
    }
  }

  const totalAmount: number = await Text.countDocuments(searchQuery)
  const totalPages: number = Math.ceil(totalAmount / pageSize)

  const skip = parseInt(page as string) * pageSize
  const data: TextInterface[] = await Text.find(searchQuery).skip(skip).limit(pageSize)

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

// returns text for a passed _id
export const getPracticeTextById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const data = await Text.findById(id)

  if (!data) {
    res.status(400)
    throw new Error("Something went wrong")
  }

  res.status(200).json(data)
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

//returns randomly selected words
export const getWords = asyncHandler(async (req: Request, res: Response) => {
  const { amount } = req.query

  const data = await Word.aggregate([{ $sample: { size: Number(amount) } }])

  if (!data) {
    res.status(400)
    throw new Error("Something went wrong")
  }

  res.status(200).json(data)
})
