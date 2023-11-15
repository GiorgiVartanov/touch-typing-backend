import generateRandomNumber from "./generateRandomNumber";

// generated fake words for a passed props
// black list is not added yet (will remove/change inappropriate words that will get generated, ideally it should check if inappropriate word is not a substring of a normal word (like english word class), but its not necessary)
const generateFakeWords = (
  data: {
    letter: string
    amount: number
    syllableList: { word: string; frequency: number; length: number }[]
  },
  amountOfWords: number = 10,
  minAmountOfSyllables: number = 2,
  maxAmountOfSyllables: number = 4,
  minLengthOfWord: number = 3, // not implemented yet
  maxLengthOfWord: number = 10 // not implemented yet
): string => {
  const fakeWords = [] // stores all generated words

  const length = data.syllableList.length // length of syllable list

  // creates a random word in a amountOfWords amount
  for (let i = 0; i < amountOfWords; i++) {
    const amountOfSyllables = generateRandomNumber(minAmountOfSyllables, maxAmountOfSyllables) // amount of syllables in a word that will get generated

    let generatedWord = ""

    // creates a syllables for generated word
    for (let j = 0; j < amountOfSyllables; j++) {
      const randomSyllableIndex = generateRandomNumber(0, length - 1)

      generatedWord += data.syllableList[randomSyllableIndex].word
    }

    fakeWords.push(generatedWord)
  }

  // returns all generated words as a single string
  return fakeWords.join(" ")
}

export default generateFakeWords