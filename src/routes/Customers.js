import express from "express";

import errors from "../const/errors.js";

import { getCustomers } from "../controllers/Customers.js";

const router = express.Router();

router.all("/customers", async (req, res) => {
    if (req.method === "GET") return await getCustomers(req, res);
    return res.status(errors[405].code).send(errors[405]);
});

export default router;