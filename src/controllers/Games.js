import { getPostgresClient, openPostgresClient, releaseClient } from "../config/database.js";

import errors from "../const/errors.js";
import queries from "../const/queries.js";

import { validateGameSchema } from "../schemas/GameSchema.js";

async function getGames(req, res) {
    await openPostgresClient(async (error) => {
        if (error) {
            return res.status(errors["500.1"].code).send(errors["500.1"]);
        }
        const { desc, limit, name, offset, order } = req.query;
        try {
            const allowedFieldsToOrder = ["id", "image", "name", "stockTotal", "pricePerDay"];
            const query = await getPostgresClient().query(queries.select("*", "games", name ? `LOWER("name") LIKE LOWER('${name.split(" ")[0]}%')` : null, order && allowedFieldsToOrder.includes(order) ? order : null, order && allowedFieldsToOrder.includes(order) && desc === "true" ? "DESC" : order && allowedFieldsToOrder.includes(order) ? "ASC" : null, !Number.isNaN(Number(limit)) ? Number.parseInt(limit) : null, !Number.isNaN(Number(offset)) ? Number.parseInt(offset) : null));
            releaseClient();
            return res.status(200).send(query.rows);
        } catch (error) {
            releaseClient();
            return res.status(errors["500.2"].code).send(errors["500.2"]);
        }
    });
    return;
}

async function postGames(req, res) {
    const { name, image, stockTotal, pricePerDay } = req.body;
    const game = { name, image, stockTotal: Number.parseInt(stockTotal), pricePerDay: Number.parseInt(pricePerDay) };
    const result = await validateGameSchema(game);
    if (result.status !== "ok") {
        errors[400].message = result.message;
        return res.status(errors[400].code).send(errors[400]);
    } else {
        await openPostgresClient(async (error) => {
            if (error) {
                return res.status(errors["500.1"].code).send(errors["500.1"]);
            }
            try {
                const existingGameQuery = await getPostgresClient().query(queries.select("*", "games", `"name" = '${name}'`));
                if (existingGameQuery.rows.length > 0) {
                    releaseClient();
                    errors[409].message = "game already registered on database.";
                    return res.status(errors[409].code).send(errors[409]);
                } else {
                    await getPostgresClient().query(queries.insert("games", `"name", "image", "stockTotal", "pricePerDay"`, [game.name, game.image, game.stockTotal, game.pricePerDay]));
                    releaseClient();
                    return res.status(201).send();
                }
            } catch (error) {
                releaseClient();
                return res.status(errors["500.2"].code).send(errors["500.2"]);
            }
        });
    }
    return;
}

export { getGames, postGames };