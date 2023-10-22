import mongoose, { Document, Schema } from "mongoose"

export interface GroupInterface extends Document {
  name: string
  members: mongoose.Types.ObjectId[]
  guildType: "Learning" | "Casual" | "Hardcore"
  motto: string
}

const groupSchema: Schema<GroupInterface> = new Schema<GroupInterface>({
  name: {
    type: String,
    required: true,
  },
  guildType: {
    type: String,
    enum: ["Learning", "Casual", "Hardcore"],
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  motto: {
    type: String,
    required: false,
    default: "Welcome",
  },
})

export default mongoose.model<GroupInterface>("Guild", groupSchema)
