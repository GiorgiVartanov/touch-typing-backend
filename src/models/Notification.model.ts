import mongoose, { Document, Schema } from "mongoose"

export interface NotificationInterface extends Document {
  notificationType: "friendRequest" | "alert" | "matchInvite"
  receiver: mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId
  status: "pending" | "accepted" | "rejected"
  text: string
  read: boolean
  active: boolean
  timestamp: Date
}

const notificationSchema: Schema<NotificationInterface> = new Schema<NotificationInterface>({
  notificationType: {
    type: String,
    required: true,
    enum: ["friendRequest", "alert"],
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    required: false,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model<NotificationInterface>("Notification", notificationSchema)
