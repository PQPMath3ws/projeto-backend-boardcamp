import express from "express";

import errors from "../const/errors.js";

import { getRentals } from "../controllers/Rentals.js";

const router = express.Router();

router.all("/rentals", async (req, res) => {
    if (req.method === "GET") return await getRentals(req, res);
    return res.status(errors[405].code).send(errors[405]);
});

export default router;