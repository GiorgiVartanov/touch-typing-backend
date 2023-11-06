const generateRandomNumber = (min: number, max: number) => {
  if (min > max) return 0

  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default generateRandomNumber
