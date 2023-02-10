import express from "express";

import errors from "../const/errors.js";

import { getGames } from "../controllers/Games.js";

const router = express.Router();

router.all("/games", async (req, res) => {
    if (req.method === "GET") return await getGames(req, res);
    return res.status(errors[405].code).send(errors[405]);
});

export default router;