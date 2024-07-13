import mongoose, { Document, Schema } from "mongoose"

export interface UserInterface extends Document {
  username: string
  password: string
  rating?: number
  accountType?: "User" | "Admin"
  pvpHistory: mongoose.Types.ObjectId[]
  createdLayouts: mongoose.Types.ObjectId[]
  completedAssessments: number[]
  completedLessons: string[]
  createdLayoutCounter: number
  selectedLayout: {
    Eng: mongoose.Types.ObjectId
    Geo: mongoose.Types.ObjectId
  }
  typingSettings: {
    selectedFont: "sans" | "serif" | "sanet"
    fontSize: "small" | "medium" | "large" | "extra large"
    keyboardSize: "small" | "medium" | "large"
    keyboardType: "ANSI" | "ANSI-ISO" | "ISO"
    keyboardLanguage: "Eng" | "Geo"
    showColoredKeys: boolean
    showKeyboardWhileTyping: boolean
  }
  appSettings: {
    language: "System Default" | "Eng" | "Geo"
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
  completedAssessments: {
    type: [Number],
    required: false,
    default: [],
  },
  completedLessons: {
    type: [String],
    required: false,
    default: [],
  },
  pvpHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: "PvPMatch",
    },
  ],
  createdLayoutCounter: {
    type: Number,
    required: true,
    default: 1,
  },
  selectedLayout: {
    Eng: {
      type: Schema.Types.ObjectId,
      ref: "Layout",
      default: "661a4f84ba6289bbe8874fbf",
    },
    Geo: {
      type: Schema.Types.ObjectId,
      ref: "Layout",
      default: "661a4f9bba6289bbe8874fc1",
    },
  },
  createdLayouts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Layout",
    },
  ],
  typingSettings: {
    font: {
      type: String,
      enum: ["sans", "serif", "sanet"],
      default: "sans",
    },
    fontSize: {
      type: String,
      default: "medium",
      enum: ["small", "medium", "large", "extra large"],
    },
    keyboardLanguage: {
      type: String,
      default: "Geo",
      enum: ["Eng", "Geo"],
    },
    keyboardType: {
      type: String,
      default: "ANSI",
      enum: ["ANSI", "ANSI-ISO", "ISO"],
    },
    keyboardSize: {
      type: String,
      default: "medium",
      enum: ["small", "medium", "large"],
    },
    showColoredKeys: {
      type: Boolean,
      default: true,
    },
    showKeyboardWhileTyping: {
      type: Boolean,
      default: true,
    },
  },
  appSettings: {
    language: {
      type: String,
      enum: ["System Default", "Eng", "Geo"],
      default: "System Default",
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
