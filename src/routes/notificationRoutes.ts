import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import {
  getNotifications,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
} from "../controllers/notificationController"

router.get("/", protect, getNotifications)
router.post("/friend/send", protect, sendFriendRequest)
router.post("/friend/accept", protect, acceptFriendRequest)
router.post("/friend/decline", protect, declineFriendRequest)

export default router
