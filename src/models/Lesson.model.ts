import mongoose, { Document, Schema } from "mongoose"

export interface LessonInterface extends Document {
  image?: string
  title: string
  description: string
  approximateDuration?: number
  level: "Beginner" | "Intermediate" | "Expert" | "Advanced"
  text: string
  wordSeparator?: string
}

const lessonSchema: Schema<LessonInterface> = new Schema<LessonInterface>({
  image: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  approximateDuration: {
    type: Number,
    required: true,
    default: 0,
  },
  level: {
    type: String,
    required: true,
    enum: ["Beginner", "Intermediate", "Expert", "Advanced"],
  },
  text: {
    type: String,
    required: true,
  },
  wordSeparator: {
    type: String,
  },
})

export default mongoose.model<LessonInterface>("Lesson", lessonSchema)
