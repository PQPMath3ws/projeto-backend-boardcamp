import express from "express";

import errors from "../const/errors.js";

const router = express.Router();

router.all("*", (req, res) => {
    return res.status(errors["404.1"].code).send(errors["404.1"]);
});

export default router;