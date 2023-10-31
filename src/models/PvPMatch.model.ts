import mongoose, { Document, Schema } from "mongoose"

export interface PvPMatchInterface extends Document {
  player1: mongoose.Types.ObjectId
  player2: mongoose.Types.ObjectId
  winner: "1" | "2"
  timestamp: Date
}

const pvpMatchSchema: Schema<PvPMatchInterface> = new Schema<PvPMatchInterface>({
  player1: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  player2: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  winner: {
    type: String,
    enum: ["1", "2"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model<PvPMatchInterface>("PvPMatch", pvpMatchSchema)
