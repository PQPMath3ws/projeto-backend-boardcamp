import Joi from "joi";

const CustomerSchema = Joi.object({
    name: Joi.string().min(3).max(70).required(),
    phone: Joi.string().min(10).max(11).regex(/^\d+$/).required(),
    cpf: Joi.string().min(11).max(11).regex(/^\d+$/).required(),
    birthday: Joi.date().required(),
});

async function validateCustomerSchema(customer) {
    try {
        await CustomerSchema.validateAsync(customer);
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

export { validateCustomerSchema };