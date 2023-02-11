import { getPostgresClient, openPostgresClient, releaseClient } from "../config/database.js";

import errors from "../const/errors.js";
import queries from "../const/queries.js";

import { validateGameSchema } from "../schemas/GameSchema.js";

async function getGames(req, res) {
    await openPostgresClient(async (error) => {
        if (error) {
            return res.status(errors["500.1"].code).send(errors["500.1"]);
        }
        const { name } = req.query;
        try {
            const query = await getPostgresClient().query(queries.select("*", "games", name ? `LOWER("name") LIKE LOWER('${name.split(" ")[0]}%')` : null));
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
    let { name, image, stockTotal, pricePerDay } = req.body;
    const game = { name, image, stockTotal, pricePerDay };
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
                    await getPostgresClient().query(queries.insert("games", `"name", "image", "stockTotal", "pricePerDay"`, [name, image, stockTotal, pricePerDay]));
                    releaseClient();
                    return res.status(201).send();
                }
            } catch (error) {
                console.log(error);
                releaseClient();
                return res.status(errors["500.2"].code).send(errors["500.2"]);
            }
        });
    }
    return;
}

export { getGames, postGames };