//generates unique N-GRAMS of all the syllables consisting of a given letter.
const generateNGrams = (
    data: {
      letter: string
      amount: number
      syllableList: { word: string; frequency: number; length: number }[]
    },
    gramLen: number
): String[]  => {
  
    const NGrams = new Set<String>()
    data.syllableList.forEach( (el)=>{    
      const word = el.word 
      const lettInd = word.indexOf(data.letter)
      for(let i = Math.max(lettInd - gramLen + 1, 0); i + gramLen <= word.length && i <= lettInd; ++i){
        let tmpWord = ""
        for(let j = 0; j < gramLen; ++j)
          tmpWord += word[i+j]
        NGrams.add(tmpWord)
      }    
    })
  
    return Array.from(NGrams)
}
  
export default generateNGrams
