import mongoose, { Document, Schema } from "mongoose"

export interface LetterInterface extends Document {
  letter: string
  amount: number
  syllableList: { word: string; frequency: number; length: number }[]
}

const letterSchema: Schema<LetterInterface> = new Schema<LetterInterface>({
  letter: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  syllableList: [
    {
      _id: false,
      word: {
        type: String,
        required: true,
      },
      frequency: {
        type: Number,
        required: true,
      },
      length: {
        type: Number,
        required: true,
      },
    },
  ],
})

export default mongoose.model<LetterInterface>("Letter", letterSchema)
