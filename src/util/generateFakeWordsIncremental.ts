import generateRandomNumber from "./generateRandomNumber"
const georgianLettersByFrequency = [
  "ა",
  "ი",
  "ე",
  "ს",
  "რ",
  "მ",
  "ო",
  "დ",
  "ვ",
  "ნ",
  "ლ",
  "ბ",
  "უ",
  "თ",
  "გ",
  "ხ",
  "შ",
  "ც",
  "კ",
  "ტ",
  "ქ",
  "ყ",
  "ზ",
  "წ",
  "ფ",
  "ჩ",
  "ღ",
  "პ",
  "ძ",
  "ჯ",
  "ჭ",
  "ჰ",
  "ჟ",
]

const generateFakeWordsIncremental = (
  data: {
    letter: string
    amount: number
    syllableList: { word: string; frequency: number; length: number }[]
  },
  amount: number
) => {
  let outputSyllables: string[] = [] // all output syllables

  const activeletter: string = data.letter
  const activeLetterIndex: number =
    georgianLettersByFrequency.indexOf(activeletter)

  const syllables: string[] = data.syllableList.map((syllable) => syllable.word)
  const allowedLetters: string[] = georgianLettersByFrequency.slice(
    0,
    activeLetterIndex + 1
  )

  // filter every syllable that only contains letters up to and including the active letter(from the geo letters frequency list)
  const incrementallyFilteredSyllables = syllables.filter((syllable: string) =>
    syllable
      .split("")
      .every((letter: string) => allowedLetters.includes(letter))
  )

  const incrementalSyllablesLength: number =
    incrementallyFilteredSyllables.length

  // randomly generate sylalbles from filtered list
  outputSyllables = Array.from({ length: amount }, () => {
    return incrementallyFilteredSyllables[
      generateRandomNumber(0, incrementalSyllablesLength - 1)
    ]
  })

  return outputSyllables.join(" ")
}

export default generateFakeWordsIncremental
