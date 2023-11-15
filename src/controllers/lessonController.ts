import { Request, Response, NextFunction } from "express"
import asyncHandler from "express-async-handler"
import { ProtectedRequest } from "../middleware/authMiddleware"

import generateFakeWordsByFrequency from "../util/generateFakeWordsByFrequency"

import Lesson from "../models/Lesson.model"
import Letter from "../models/Letter.model"
import generateNGrams from "../util/generateNGrams"

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
    minAmountOfSyllables, //May act as a different variable (level)
    maxAmountOfSyllables, //May act as a different variable (subLevel)
    minLengthOfWord = 2,
    maxLengthOfWord = 2,
    whatAreYouAskingFor = "" //whether to return fakeWords or NGrams
  } = req.query
  
  if(whatAreYouAskingFor === "NGRAMS"){
    try {
      //"minAmountOfSyllables" instead of "level" and "maxAmountOfSyllables" instead of "subLevel" -- reason: didn't want to create many variables.
      const fakeWords = await getSpecificTraining(String(letter), Number(minAmountOfSyllables), Number(maxAmountOfSyllables) ,Number(amount))
      res.status(200).json({data: fakeWords})
    } catch(error) {
      res.status(400)
      throw new Error(error)
    }
    return
  }
  
  const desiredLetter = letter || "all"

  const letterItem = await Letter.findOne({ letter: desiredLetter })

  try {
    const fakeWords = generateFakeWordsByFrequency(
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

//Generates a lesson for training on a specific letter. 
const getSpecificTraining = async (letter = "ა", level = 1, subLevel = 1, wordCount = 20) => {

  const desiredLetter = letter
  const letterItem = await Letter.findOne({ letter: desiredLetter })

  const text : String[] = []

  //4 different subLevels
  const N_Grams : String[][] = Array.from({length:4}).map(()=>Array<String>())

  //filling in N_Grams according to the "level."
  generateNGrams(letterItem, 2).forEach(word=>N_Grams[0].push(word))

  if( 1 <= level ){
    generateNGrams(letterItem, 3).forEach(word=>N_Grams[1].push(word))

    if( 2 <= level ){
      generateNGrams(letterItem, 4).forEach(word=>N_Grams[2].push(word))

      //expert level has all the syllables of length higher than 4 + n-grams
      if(level === 3)
        letterItem.syllableList.forEach(element => {
          if (element.word.length > 4) 
            N_Grams[3].push(element.word)
        });
    }
  }
  if(N_Grams[0].length != 0) {
    const randArr : Array<number> = [1, 2, 3, 4, 5]
    for(let i = 0; i < Number(wordCount); ++i){
      //higher probability of getting longer words.
      const sylAmount : number = randArr[Math.floor((Number(subLevel) + 1) * (1 - Math.random()**(4/3)) + Math.random()/4)]

      let tmpWord : string = ""

      for(let j = 0; j < sylAmount; ++j){
        //higher probability of getting longer syllables (accoring to the "level")
        const sylLength : number = randArr[Math.floor(level * (1 - Math.random()**(3/2)))] - 1

        tmpWord += N_Grams[sylLength][Math.floor( N_Grams[sylLength].length * Math.random())]
      }      

      text.push(tmpWord)
    }
  }
    
  return text.join(" ")
}