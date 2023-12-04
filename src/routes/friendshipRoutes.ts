import express, { Router } from "express"
import protect from "../middleware/authMiddleware"

const router: Router = express.Router()

import {
  getUserFriends,
  getUserFollowers,
  getUserFollowings,
  followUser,
  unfollowUser,
} from "../controllers/friendshipRoutesController"

router.get("/friends/:username", getUserFriends)
router.get("/followers/:username", getUserFollowers)
router.get("/followings/:username", getUserFollowings)
router.post("/follow/:username", protect, followUser)
router.post("/unfollow/:username", protect, unfollowUser)

export default router
