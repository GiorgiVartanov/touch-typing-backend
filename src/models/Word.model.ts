import mongoose, { Document, Schema } from "mongoose"

export interface WordState {
  word: string
  count: number
}

export interface WordInterface extends WordState, Document {}

const wordSchema: Schema<WordInterface> = new Schema<WordInterface>({
  word: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
})

export default mongoose.model<WordInterface>("Word", wordSchema)
