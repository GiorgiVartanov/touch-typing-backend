import express, { Router } from "express";

import { getMatch, getMatches } from "../controllers/matchController";

const router: Router = express.Router();

router.get("/", getMatches);
router.get("/:id", getMatch);

export default router;
