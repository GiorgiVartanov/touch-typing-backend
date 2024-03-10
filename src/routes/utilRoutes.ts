import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { getFakeWords, getWords } from "../controllers/utilController"

router.get("/fakewords", getFakeWords)
router.get("/words", getWords)

export default router
