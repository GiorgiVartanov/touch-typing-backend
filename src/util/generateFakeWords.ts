import path from "path"
import fs from "fs"

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
const generateFakeWords = (
  letter?: string,
  amountOfWords: number = 10,
  minAmountOfSyllables: number = 2,
  maxAmountOfSyllables: number = 4,
  minLengthOfWord: number = 3,
  maxLengthOfWord: number = 10
): string => {
  const fakeWords = []

  let selectedLetter = letter

  if (!letter) selectedLetter = georgianLetters[generateRandomNumber(0, georgianLetters.length - 1)]

  const filePath = path.join(__dirname, "..", "data", "letters", `${selectedLetter}.letter.json`)

  const data: { word: string; frequency: number; length: 2 } = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  )

  const length = data.length

  for (let i = 0; i < amountOfWords; i++) {
    const amountOfSyllables = generateRandomNumber(minAmountOfSyllables, maxAmountOfSyllables)

    let generatedWord = ""

    for (let j = 0; j < amountOfSyllables; j++) {
      const randomSyllableIndex = generateRandomNumber(0, length - 1)

      generatedWord += data[randomSyllableIndex].word
    }

    fakeWords.push(generatedWord)
  }

  return fakeWords.join(" ")
}

export default generateFakeWords

const generateRandomNumber = (min: number, max: number) => {
  if (min > max) return 0

  return Math.floor(Math.random() * (max - min + 1)) + min
}
