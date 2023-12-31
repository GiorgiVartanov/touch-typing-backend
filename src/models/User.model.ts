import mongoose, { Document, Schema } from "mongoose"

export interface UserInterface extends Document {
  username: string
  password: string
  rating?: number
  biography?: string
  accountType?: "User" | "Admin"
  guild?: mongoose.Types.ObjectId
  friends: mongoose.Types.ObjectId[]
  completedAchievements: mongoose.Types.ObjectId[]
  pvpHistory: mongoose.Types.ObjectId[]
  lessons: {
    stats: { beginner: number; intermediate: number; expert: number; advanced: number }
    history: mongoose.Types.ObjectId[]
    completed: mongoose.Types.ObjectId[]
  }
  typingSettings: {
    selectedFont: "sans" | "serif"
    amountOfShownLines: string
    alignText: "left" | "center" | "right"
    fontSize: string
    lineSpacing: string
    letterSpacing: string
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
  biography: {
    type: String,
  },
  accountType: {
    type: String,
    required: true,
    enum: ["User", "Admin"],
  },
  guild: {
    type: Schema.Types.ObjectId,
    ref: "Guild",
  },
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  completedAchievements: [
    {
      type: Schema.Types.ObjectId,
      ref: "Achievement",
    },
  ],
  pvpHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: "PvPMatch",
    },
  ],
  lessons: {
    stats: {
      beginner: {
        type: Number,
      },
      intermediate: {
        type: Number,
      },
      expert: {
        type: Number,
      },
      advanced: {
        type: Number,
      },
    },
    history: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
  },
  typingSettings: {
    font: {
      type: String,
      enum: ["sans", "serif"],
      default: "sans",
    },
    amountOfShownLines: {
      type: String,
      default: "5",
      enum: ["3", "4", "5", "6", "7"],
    },
    alignText: {
      type: String,
      enum: ["left", "center", "right"],
      default: "left",
    },
    fontSize: {
      type: String,
      default: "Auto",
      enum: ["Auto", "8", "9", "10", "11", "12", "14", "18", "24", "30", "36"],
      // auto will be 1.25rem, others will be in pixels
    },
    lineHeight: {
      type: String,
      default: "Auto",
      enum: ["Auto", "8", "9", "10", "11", "12", "14", "18", "24", "30", "36"],
    },
    letterSpacing: {
      type: String,
      default: "0",
      enum: ["0", "1", "2", "3", "4", "5", "6"],
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
