import mongoose, { Document, Schema } from "mongoose"

export interface SentenceState {
    sentence: string
}

export interface SentenceInterface extends SentenceState, Document {}

const sentenceSchema: Schema<SentenceInterface> = new Schema<SentenceInterface>({
  sentence: {
    type: String,
    required: true,
  },
})

export default mongoose.model<SentenceInterface>("Sentence", sentenceSchema)
