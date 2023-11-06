import mongoose, { Document, Schema } from "mongoose"

export interface AchievementInterface extends Document {
  name: string
  description: string
  points: number
}

const achievementSchema: Schema<AchievementInterface> = new Schema<AchievementInterface>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
})

export default mongoose.model<AchievementInterface>("Achievement", achievementSchema)
