import generateRandomNumber from "./generateRandomNumber"

const permuteArrayInPlace = <T>(array: T[]) => {
  let N = array.length
  for (let i = 0; i < N; ++i) {
    const j = generateRandomNumber(i, N - 1)
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

export default permuteArrayInPlace
