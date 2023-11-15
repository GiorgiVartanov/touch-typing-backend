/*
  ---- UndeRz ----
  I haven't come up with the perfect solution and, therefore, will proceed with an heuristic:
  ** prioritise syllable count over word length, that is, 
  ++ if both constraints can't be satisfied, I'll make the syllable count happy. (but I'll try to make both "content").
*/
import generateRandomNumber from "./generateRandomNumber"

const generateFakeWordsByFrequency = (
  data: {
    letter: string
    amount: number
    syllableList: { word: string; frequency: number; length: number }[]
  },
  amountOfWords: number = 10,
  minAmountOfSyllables: number = 2,
  maxAmountOfSyllables: number = 4,
  minLengthOfWord: number = 3, 
  maxLengthOfWord: number = 10 // has been implemented thouroughly with a great precision (subtleties)
): string  => {
  const fakeWords = []  

  //I can try this many times to satisfy every single restriction.
  const tryThisManyTimes = 100

  //prefixSum "partitions" the syllables by frequencies. (used for binary search afterwards).
  const prefixSum = []
  data.syllableList.forEach((val,index)=>
    prefixSum.push(prefixSum.length ? val.frequency + prefixSum[index-1] : val.frequency)
  )

  const length = data.syllableList.length

  const totalWeight = prefixSum[length - 1]

  for (let i = 0; i < amountOfWords; i++) {
    const amountOfSyllables = generateRandomNumber(minAmountOfSyllables, maxAmountOfSyllables)

    let generatedWord = ""

    for (let j = 0, k = 0; j < amountOfSyllables; ++j) {
      const uniformRandom = generateRandomNumber(1, totalWeight)
      
      //the syllable is sought by binary search
      let l = 0
      let r = length
      while( l + 1 < r ){
        let m = Math.floor( (l + r) / 2 )
        if (prefixSum[m] < uniformRandom)
          l = m + 1
        else 
          r = m;
      }

      //if the word length constraint isn't satisfied, I'll try again for at most "tryThisManyTimes"...
      if(generatedWord.length + data.syllableList[l].word.length > maxLengthOfWord && k < tryThisManyTimes){
        ++k; --j;
        continue;
      } else if(j === amountOfSyllables - 1 && generatedWord.length + data.syllableList[l].word.length < minLengthOfWord) {
        ++k; --j;
        continue;
      }
      generatedWord += data.syllableList[l].word
    }

    fakeWords.push(generatedWord)
  }

  return fakeWords.join(" ")
}

export default generateFakeWordsByFrequency