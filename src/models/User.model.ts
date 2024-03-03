import mongoose, { Document, Schema } from "mongoose"

export interface UserInterface extends Document {
  username: string
  password: string
  rating?: number
  accountType?: "User" | "Admin"
  friends: mongoose.Types.ObjectId[]
  sentFriendRequests: mongoose.Types.ObjectId[]
  pvpHistory: mongoose.Types.ObjectId[]
  history: mongoose.Types.ObjectId[]
  typingSettings: {
    selectedFont: "sans" | "serif" | "cursive" | "sanet"
    fontSize: "auto" | "small" | "medium" | "large" | "extra large"
  }
  appSettings: {
    language: "Eng" | "Geo"
    theme: "System Default" | "Dark" | "Light"
  }
  timestamp: Date
}

const userSchema: Schema<UserInterface> = new Schema<UserInterface>({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
  },
  accountType: {
    type: String,
    required: true,
    enum: ["User", "Admin"],
  },
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  sentFriendRequests: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  pvpHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: "PvPMatch",
    },
  ],
  history: [
    {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
    },
  ],
  typingSettings: {
    font: {
      type: String,
      enum: ["sans", "serif", "cursive", "sanet"],
      default: "sans",
    },
    fontSize: {
      type: String,
      default: "medium",
      enum: ["small", "medium", "large", "extra large"],
    },
  },
  appSettings: {
    language: {
      type: String,
      enum: ["Eng", "Geo"],
      default: "Geo",
    },
    theme: {
      type: String,
      enum: ["System Default", "Dark", "Light"],
      default: "System Default",
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model<UserInterface>("User", userSchema)
