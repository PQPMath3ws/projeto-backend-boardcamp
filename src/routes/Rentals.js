import express from "express";

import errors from "../const/errors.js";

import { deleteRentals, getRentals, postRentals, postRentalsReturn } from "../controllers/Rentals.js";

const router = express.Router();

router.all("/rentals", async (req, res) => {
    if (req.method === "GET") return await getRentals(req, res);
    if (req.method === "POST") return await postRentals(req, res);
    return res.status(errors[405].code).send(errors[405]);
});

router.all("/rentals/:id", async (req, res) => {
    if (req.method === "DELETE") return await deleteRentals(req, res);
    return res.status(errors[405].code).send(errors[405]);
});

router.all("/rentals/:id/return", async (req, res) => {
    if (req.method === "POST") return await postRentalsReturn(req, res);
    return res.status(errors[405].code).send(errors[405]);
});

export default router;