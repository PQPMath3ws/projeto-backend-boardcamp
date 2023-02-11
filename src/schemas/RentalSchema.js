import Joi from "joi";

const RentalSchema = Joi.object({
    customerId: Joi.number().integer().min(1).required(),
    gameId: Joi.number().integer().min(1).required(),
    rentDate: Joi.date().required(),
    daysRented: Joi.number().integer().min(1).required(),
    returnDate: Joi.date().allow(null).optional(),
    originalPrice: Joi.number().integer(),
    delayFee: Joi.number().integer().allow(null).optional(),
});

async function validateRentalSchema(rental) {
    try {
        await RentalSchema.validateAsync(rental);
        return {
            status: "ok",
            message: "game validated successfully",
        };
    } catch (error) {
        return {
            status: "error",
            message: error.details[0].message,
        };
    }
}

export { validateRentalSchema };