import { Request, Response, NextFunction } from "express"
import asyncHandler from "express-async-handler"

import generateFakeWords from "../util/generateFakeWords"
import generateRandomNumber from "../util/generateRandomNumber"

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
