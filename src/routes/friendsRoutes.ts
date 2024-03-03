import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { removeFriend, getFriends } from "../controllers/friendsController"

router.patch("/remove", protect, removeFriend)
router.get("/list/:username", getFriends)

export default router
