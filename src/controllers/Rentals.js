import { getPostgresClient, openPostgresClient, releaseClient } from "../config/database.js";

import errors from "../const/errors.js";
import queries from "../const/queries.js";

async function getRentals(req, res) {
    await openPostgresClient(async (error) => {
        if (error) {
            return res.status(errors["500.1"].code).send(errors["500.1"]);
        }
        const { customerId } = req.query;
        try {
            const query = await getPostgresClient().query(queries.select("*", "rentals", customerId && !Number.isNaN(Number(customerId)) ? `"id" = ${customerId}` : null));
            const gamesQuery = await getPostgresClient().query(queries.select("*", "games"));
            const costumersQuery = await getPostgresClient().query(queries.select("*", "customers"));
            query.rows.forEach(row => {
                row.customer = costumersQuery.rows.find(customerRow => row.customerId === customerRow.id);
                row.game = gamesQuery.rows.find(gameRow => row.gameId === gameRow.id);
                delete row.customerId;
                delete row.gameId;
            });
            releaseClient();
            return res.status(200).send(query.rows);
        } catch (error) {
            releaseClient();
            return res.status(errors["500.2"].code).send(errors["500.2"]);
        }
    });
    return;
}

export { getRentals };