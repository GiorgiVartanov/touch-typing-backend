import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import { getLayout, getSelectedLayout, getLayouts, selectLayout, addLayout } from "../controllers/layoutController"

router.get("/getselected", protect, getSelectedLayout)
router.get("/get/:id", getLayout)
router.get("/search", getLayouts)
router.post("/select", protect, selectLayout)
router.post("/add", protect, addLayout)

export default router
