const generateFakeWordsByFrequency = (
  letter: string,
  amountOfWords: number = 10,
  minAmountOfSyllables: number = 2,
  maxAmountOfSyllables: number = 4,
  minLengthOfWord: number = 3,
  maxLengthOfWord: number = 10
): string[] => {
  const fakeWords = []
  const data = require(`../data/letters/${letter}.letter.json`)

  const totalWeight = data.reduce(
    (total: number, item: { word: string; frequency: number; letter: number }) =>
      total + item.frequency,
    0
  ) // sum of all frequencies, (its probably better to do it without weights (frequencies) unless weights of some elements will be decreased (square or cubic root of their frequencies for example))

  const length = data.length

  for (let i = 0; i < amountOfWords; i++) {
    const amountOfSyllables = generateRandomNumber(minAmountOfSyllables, maxAmountOfSyllables)

    let generatedWord = ""

    for (let j = 0; j < amountOfSyllables; j++) {
      const syllableWeightToAdd = generateRandomNumber(0, totalWeight - 1)

      for (let k = 0; k < length; k++) {
        if (syllableWeightToAdd > data[k].frequency) {
          generatedWord += data[k].word
          break
        }
      }
    }

    fakeWords.push(generatedWord)
  }

  return fakeWords
}

export default generateFakeWordsByFrequency

const generateRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
