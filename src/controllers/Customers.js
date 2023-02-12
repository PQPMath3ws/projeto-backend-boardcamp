import { getPostgresClient, openPostgresClient, releaseClient } from "../config/database.js";

import errors from "../const/errors.js";
import queries from "../const/queries.js";

import { validateCustomerSchema } from "../schemas/CustomerSchema.js";

async function getCustomers(req, res) {
    await openPostgresClient(async (error) => {
        if (error) {
            return res.status(errors["500.1"].code).send(errors["500.1"]);
        }
        const { cpf, desc, limit, offset, order } = req.query;
        try {
            const allowedFieldsToOrder = ["id", "name", "phone", "birthday"];
            const query = await getPostgresClient().query(queries.select("*", "customers", cpf && !Number.isNaN(Number(cpf)) ? `"cpf" LIKE '${cpf}%'` : null, order && allowedFieldsToOrder.includes(order) ? order : null, order && allowedFieldsToOrder.includes(order) && desc === "true" ? "DESC" : order && allowedFieldsToOrder.includes(order) ? "ASC" : null, !Number.isNaN(Number(limit)) ? Number.parseInt(limit) : null, !Number.isNaN(Number(offset)) ? Number.parseInt(offset) : null));
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

async function postCustomers(req, res) {
    const { birthday, cpf, name, phone } = req.body;
    const customer = { name, phone, cpf, birthday: new Date(birthday) };
    const result = await validateCustomerSchema(customer);
    if (result.status !== "ok") {
        errors[400].message = result.message;
        return res.status(errors[400].code).send(errors[400]);
    } else {
        await openPostgresClient(async (error) => {
            if (error) {
                return res.status(errors["500.1"].code).send(errors["500.1"]);
            }
            try {
                const existingCustomerQuery = await getPostgresClient().query(queries.select("*", "customers", `"cpf" = '${cpf}'`));
                if (existingCustomerQuery.rows.length > 0) {
                    releaseClient();
                    errors[409].message = "customer with this cpf already registered on database.";
                    return res.status(errors[409].code).send(errors[409]);
                } else {
                    await getPostgresClient().query(queries.insert("customers", `"name", "phone", "cpf", "birthday"`, [customer.name, customer.phone, customer.cpf, customer.birthday.toISOString()]));
                    releaseClient();
                    return res.status(201).send();
                }
            } catch (error) {
                releaseClient();
                return res.status(errors["500.2"].code).send(errors["500.2"]);
            }
        });
    }
}

async function putCustomerById(req, res) {
    const { id } = req.params;
    if (Number.isNaN(Number(id))) {
        errors[400].message = "invalid customer id format";
        return res.status(errors[400].code).send(errors[400]);
    } else {
        const { name, phone, cpf, birthday } = req.body;
        const customer = { name, phone, cpf, birthday: new Date(birthday) };
        const result = await validateCustomerSchema(customer);
        if (result.status !== "ok") {
            errors[400].message = result.message;
            return res.status(errors[400].code).send(errors[400]);
        } else {
            await openPostgresClient(async (error) => {
                if (error) {
                    return res.status(errors["500.1"].code).send(errors["500.1"]);
                }
                try {
                    const existingCustomerQuery = await getPostgresClient().query(queries.select("*", "customers", `"cpf" = '${cpf}'`));
                    if (existingCustomerQuery.rows.length > 0) {
                        if (existingCustomerQuery.rows[0].id.toString() === id) {
                            await getPostgresClient().query(queries.update("customers", [`"name" = '${customer.name}'`, `"phone" = '${customer.phone}'`, `"cpf" = '${customer.cpf}'`, `"birthday" = '${customer.birthday.toISOString().split("T")[0]}'`], `"id" = ${id}`));
                            releaseClient();
                            return res.status(200).send();
                        } else {
                            releaseClient();
                            errors[409].message = "customer with this cpf already registered on database.";
                            return res.status(errors[409].code).send(errors[409]);
                        }
                    } else {
                        await getPostgresClient().query(queries.update("customers", [`"name" = '${customer.name}'`, `"phone" = '${customer.phone}'`, `"cpf" = '${customer.cpf}'`, `"birthday" = '${customer.birthday.toISOString().split("T")[0]}'`], `"id" = ${id}`));
                        releaseClient();
                        return res.status(200).send();
                    }
                } catch (error) {
                    releaseClient();
                    return res.status(errors["500.2"].code).send(errors["500.2"]);
                }
            });
        }
    }
    return;
}

export { getCustomers, getCustomerById, postCustomers, putCustomerById };