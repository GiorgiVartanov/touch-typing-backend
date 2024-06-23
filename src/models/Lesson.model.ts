import mongoose, { Document, Schema } from "mongoose"

export interface LessonState {
  lesson_name: string
  words: string[]
}

export interface LessonInterface extends LessonState, Document {}

const lessonSchema: Schema<LessonInterface> = new Schema<LessonInterface>({
  lesson_name: {
    type: String,
    required: true,
  },
  words: {
    type: [String],
    required: true,
  },
})

export default mongoose.model<LessonInterface>("Lesson", lessonSchema)
