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
  createdLayouts: mongoose.Types.ObjectId[]
  selectedLayout: {
    Eng: mongoose.Types.ObjectId,
    Geo: mongoose.Types.ObjectId,
  }
  typingSettings: {
    selectedFont: "sans" | "serif" | "cursive" | "sanet"
    fontSize: "auto" | "small" | "medium" | "large" | "extra large"
    keyboardType: "ANSI" | "ANSI-ISO" | "ISO"
    keyboardLanguage: "Eng" | "Geo"
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
  selectedLayout: {
    Eng: {
      type: Schema.Types.ObjectId,
      ref: "Layout",
      default: "661a4f84ba6289bbe8874fbf"
    },
    Geo: {
      type: Schema.Types.ObjectId,
      ref: "Layout",
      default: "661a4f9bba6289bbe8874fc1"
    }
  },
  createdLayouts: [
    {
    type: Schema.Types.ObjectId,
    ref: "Layout",
  }
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
    keyboardLanguage: {
      type: String,
      default: "Eng",
      enum: ["Eng", "Geo"]
    },
    keyboardLayout: {
      type: String,
      default: "ANSI",
      enum: ["ANSI" , "ANSI-ISO" , "ISO"]
    }
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
