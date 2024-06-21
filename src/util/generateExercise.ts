import permuteArrayInPlace from "./permuteArrayInPlace"

interface Props {
  word_array_1: string[]
  word_array_2: string[]
  subset_size: number
}

const generateExercise = ({ word_array_1, word_array_2, subset_size }: Props) => {
  permuteArrayInPlace(word_array_1)
  permuteArrayInPlace(word_array_2)
  const combinedArray = [
    ...word_array_1.slice(0, subset_size),
    ...word_array_2.slice(0, subset_size),
  ]
  permuteArrayInPlace(combinedArray)
  return combinedArray.join(" ")
}

export default generateExercise
