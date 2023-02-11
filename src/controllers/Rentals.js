import { getPostgresClient, openPostgresClient, releaseClient } from "../config/database.js";

import errors from "../const/errors.js";
import queries from "../const/queries.js";

import { validateRentalSchema } from "../schemas/RentalSchema.js";

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

async function postRentals(req, res) {
    const { customerId, gameId, daysRented } = req.body;
    if (Number.isNaN(Number(customerId)) || Number.isNaN(Number(gameId)) || Number.isNaN(Number(daysRented))) {
        errors[400].message = "invalid customer id format";
        return res.status(errors[400].code).send(errors[400]);
    } else {
        await openPostgresClient(async (error) => {
            if (error) {
                return res.status(errors["500.1"].code).send(errors["500.1"]);
            }
            try {
                const customerQuery = await getPostgresClient().query(queries.select("*", "customers", `"id" = ${Number.parseInt(customerId)}`));
                if (customerQuery.rows.length === 0) {
                    releaseClient();
                    errors[400].message = "customer not found";
                    return res.status(errors[400].code).send(errors[400]);
                } else {
                    const gameQuery = await getPostgresClient().query(queries.select("*", "games", `"id" = ${Number.parseInt(gameId)}`));
                    if (gameQuery.rows.length === 0) {
                        releaseClient();
                        errors[400].message = "game not found";
                        return res.status(errors[400].code).send(errors[400]);
                    } else {
                        const rental = {
                            customerId: Number(customerId),
                            gameId: Number(gameId),
                            rentDate: new Date(),
                            originalPrice: gameQuery.rows[0].pricePerDay * Number.parseInt(daysRented),
                            daysRented: Number.parseInt(daysRented),
                            returnDate: null,
                            delayFee: null,
                        };
                        const result = await validateRentalSchema(rental);
                        if (result.status !== "ok") {
                            releaseClient();
                            errors[400].message = result.message;
                            return res.status(errors[400].code).send(errors[400]);
                        } else {
                            const existingRentalsQuery = await getPostgresClient().query(queries.select("*", "rentals", `"gameId" = ${Number.parseInt(gameId)} AND "returnDate" IS NULL`));
                            if (existingRentalsQuery.rows.length > gameQuery.rows[0].stockTotal) {
                                releaseClient();
                                errors[400].message = "game out of stock to rent";
                                return res.status(errors[400].code).send(errors[400]);
                            } else {
                                await getPostgresClient().query(queries.insert("rentals", `"customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee"`, [rental.customerId, rental.gameId, rental.rentDate.toISOString(), rental.daysRented, rental.returnDate, rental.originalPrice, rental.delayFee]));
                                releaseClient();
                                return res.status(201).send();
                            }
                        }
                    }
                }
            } catch (error) {
                releaseClient();
                return res.status(errors["500.2"].code).send(errors["500.2"]);
            }
        });
    }
    return;
}

async function postRentalsReturn(req, res) {
    const { id } = req.params;
    if (Number.isNaN(Number(id))) {
        errors[400].message = "invalid rental id format";
        return res.status(errors[400].code).send(errors[400]);
    } else {
        await openPostgresClient(async (error) => {
            if (error) {
                return res.status(errors["500.1"].code).send(errors["500.1"]);
            }
            try {
                const existingRentalQuery = await getPostgresClient().query(queries.select("*", "rentals", `"id" = ${Number.parseInt(id)}`));
                if (existingRentalQuery.rows.length === 0) {
                    releaseClient();
                    errors["404.2"].message = "rental not found";
                    return res.status(errors["404.2"].code).send(errors["404.2"]);
                } else {
                    if (existingRentalQuery.rows[0].returnDate) {
                        releaseClient();
                        errors[400].message = "rental already returned";
                        return res.status(errors[400].code).send(errors[400]);
                    } else {
                        const returnDate = new Date();
                        let delayFee = null;
                        const difference = new Date(returnDate.getTime() - existingRentalQuery.rows[0].rentDate.getTime());
                        if (difference.getDate() > existingRentalQuery.rows[0].daysRented) {
                            const existingGameQuery = await getPostgresClient().query(queries.select(`"pricePerDay"`, "games", `"id" = ${existingRentalQuery.rows[0].gameId}`));
                            delayFee = existingGameQuery.rows[0].pricePerDay * (difference.getDate() - existingRentalQuery.rows[0].daysRented);
                        }
                        await getPostgresClient().query(queries.update("rentals", [`"returnDate" = '${returnDate.toISOString().split("T")[0]}'`, `"delayFee" = ${delayFee}`], `"id" = ${id}`));
                        releaseClient();
                        return res.status(200).send();
                    }
                }
            } catch (error) {
                releaseClient();
                return res.status(errors["500.2"].code).send(errors["500.2"]);
            }
        });
    }
    return;
}

async function deleteRentals(req, res) {
    const { id } = req.params;
    if (Number.isNaN(Number(id))) {
        errors[400].message = "invalid rental id format";
        return res.status(errors[400].code).send(errors[400]);
    } else {
        await openPostgresClient(async (error) => {
            if (error) {
                return res.status(errors["500.1"].code).send(errors["500.1"]);
            }
            try {
                const existingRentalQuery = await getPostgresClient().query(queries.select("*", "rentals", `"id" = ${Number.parseInt(id)}`));
                if (existingRentalQuery.rows.length === 0) {
                    releaseClient();
                    errors["404.2"].message = "rental not found";
                    return res.status(errors["404.2"].code).send(errors["404.2"]);
                } else {
                    if (!existingRentalQuery.rows[0].returnDate) {
                        releaseClient();
                        errors[400].message = "rental not returned yet";
                        return res.status(errors[400].code).send(errors[400]);
                    } else {
                        await getPostgresClient().query(queries.delete("rentals", `"id" = ${Number.parseInt(id)}`));
                        releaseClient();
                        return res.status(200).send();
                    }
                }
            } catch (error) {
                releaseClient();
                return res.status(errors["500.2"].code).send(errors["500.2"]);
            }
        });
    }
    return;
}

export { deleteRentals, getRentals, postRentals, postRentalsReturn };