import { getPostgresClient, openPostgresClient, releaseClient } from "../config/database.js";

import errors from "../const/errors.js";
import queries from "../const/queries.js";

async function getCustomers(req, res) {
    await openPostgresClient(async (error) => {
        if (error) {
            return res.status(errors["500.1"].code).send(errors["500.1"]);
        }
        const { cpf } = req.query;
        try {
            let query = await getPostgresClient().query(queries.select("*", "customers", cpf ? `"cpf" LIKE '${cpf.split(" ")[0]}%'` : null));
            releaseClient();
            return res.status(200).send(query.rows);
        } catch (error) {
            return res.status(errors["500.2"].code).send(errors["500.2"]);
        }
    });
    return;
}

export { getCustomers };