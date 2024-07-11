import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { getUser, getUsers, getAllUsersWithRating } from "../controllers/userController"

router.get("/search", getUsers)
router.get("/rating", getAllUsersWithRating)
router.get("/:username", getUser)

export default router
