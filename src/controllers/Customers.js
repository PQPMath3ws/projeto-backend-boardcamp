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
            const query = await getPostgresClient().query(queries.select("*", "customers", cpf ? `"cpf" LIKE '${cpf.split(" ")[0]}%'` : null));
            releaseClient();
            return res.status(200).send(query.rows);
        } catch (error) {
            releaseClient();
            return res.status(errors["500.2"].code).send(errors["500.2"]);
        }
    });
    return;
}

async function getCustomerById(req, res) {
    const { id } = req.params;
    if (Number.isNaN(Number(id))) {
        errors[400].message = "invalid customer id format";
        return res.status(errors[400].code).send(errors[400]);
    } else {
        await openPostgresClient(async (error) => {
            if (error) {
                return res.status(errors["500.1"].code).send(errors["500.1"]);
            }
            try {
                const query = await getPostgresClient().query(queries.select("*", "customers", `"id" = ${id}`));
                releaseClient();
                if (query.rows.length === 0) {
                    errors["404.2"].message = "customer not found in this server";
                    return res.status(errors["404.2"].code).send(errors["404.2"]);
                } else {
                    return res.status(200).send(query.rows[0]);
                }
            } catch (error) {
                releaseClient();
                return res.status(errors["500.2"].code).send(errors["500.2"]);
            }
        });
    }
    return;
}

export { getCustomers, getCustomerById };