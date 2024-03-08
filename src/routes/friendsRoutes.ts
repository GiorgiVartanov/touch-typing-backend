import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { removeFriend, getFriends, getFriendsSuggestions } from "../controllers/friendsController"

router.patch("/remove", protect, removeFriend)
router.get("/list/:username", getFriends)
router.get("/suggestions", protect, getFriendsSuggestions)

export default router
