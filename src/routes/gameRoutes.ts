import express, { Router } from "express"

import { getGame, getGames } from "../controllers/gameController"

const router: Router = express.Router()

router.get("/", getGames);
router.get("/:id", getGame);

export default router;