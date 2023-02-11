import Joi from "joi";

const GameSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    image: Joi.string().min(20).max(200),
    stockTotal: Joi.number().integer().min(1).required(),
    pricePerDay: Joi.number().integer().min(1).required(),
});

async function validateGameSchema(game) {
    try {
        await GameSchema.validateAsync(game);
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

export { validateGameSchema };