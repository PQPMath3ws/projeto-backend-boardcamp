import express from "express";

import errors from "../const/errors.js";

import { getRentals, postRentals } from "../controllers/Rentals.js";

const router = express.Router();

router.all("/rentals", async (req, res) => {
    if (req.method === "GET") return await getRentals(req, res);
    if (req.method === "POST") return await postRentals(req, res);
    return res.status(errors[405].code).send(errors[405]);
});

export default router;