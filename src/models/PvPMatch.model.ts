import mongoose, { Document, Schema } from "mongoose"

export interface PvPMatchInterface extends Document {
  opponents: mongoose.Types.ObjectId[]
  winner: mongoose.Types.ObjectId
  timestamp: Date
}

const pvpMatchSchema: Schema<PvPMatchInterface> = new Schema<PvPMatchInterface>({
  opponents: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  winner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model<PvPMatchInterface>("PvPMatch", pvpMatchSchema)
