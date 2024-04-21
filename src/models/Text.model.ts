import mongoose, { Document, Schema } from "mongoose"

export interface TextInterface extends Document {
  title: string
  language: "Eng" | "Geo"
  description: string
  author?: string
  level: "Easy" | "Intermediate" | "Normal" | "Hard" | "Expert" | "Advanced"
  text: string
  wordSeparator?: string
  publishedOn: Date
  timestamp: Date

}

const textSchema: Schema<TextInterface> = new Schema<TextInterface>({
  title: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: false,
    default: "Eng"
  },
  description: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
    default: "Unknown",
  },
  level: {
    type: String,
    required: true,
    enum: ["Easy", "Intermediate", "Normal", "Hard", "Expert", "Advanced"],
  },
  text: {
    type: String,
    required: true,
  },
  wordSeparator: {
    type: String,
  },
  publishedOn: {
    type: Date,
    default: Date.now,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model<TextInterface>("Text", textSchema)
