import asyncHandler from "express-async-handler"
import { Request, Response } from "express"

import Lesson from "../models/Lesson.model"
import generateExercise from "../util/generateExercise"
import permuteArrayInPlace from "../util/permuteArrayInPlace"

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

export const getExercise = asyncHandler(async (req: Request, res: Response) => {
  const { letter } = req.query as { letter: string }

  if (!georgianLetters.includes(letter)) {
    res.status(400)
    throw new Error("provide a Georgian letter only!")
  }

  const only_letter_syllables: { lesson_name: string; words: string[] } = await Lesson.findOne({
    lesson_name: `letter_${letter}`,
  })

  const one_except_letter_syllables: { lesson_name: string; words: string[] } =
    await Lesson.findOne({ lesson_name: `mostly_${letter}` })

  if (!only_letter_syllables || !one_except_letter_syllables) {
    res.status(400)
    throw new Error("something went wrong")
  }

  const data = generateExercise({
    word_array_1: only_letter_syllables.words,
    word_array_2: one_except_letter_syllables.words,
    subset_size: 25,
  })

  res.status(200).json(data)
})

export const getAssessment = asyncHandler(async (req: Request, res: Response) => {
  const { assessment_level } = req.query as { assessment_level: string }

  if (![1, 2, 3, 4, 5, 6].includes(Number(assessment_level))) {
    res.status(400)
    throw new Error("provide a correct level!")
  }

  const assessment_data: { lesson_name: string; words: string[] } = await Lesson.findOne({
    lesson_name: `assessment_${assessment_level}`,
  })

  if (!assessment_data) {
    res.status(400)
    throw new Error("something went wrong")
  }

  permuteArrayInPlace(assessment_data.words)

  res.status(200).json(assessment_data.words.slice(0, 100).join(" "))
})
