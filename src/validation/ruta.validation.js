import Joi from "joi";

export const rutaSchema=Joi.object({
    id:Joi.number().positive().integer().required(),
    estado:Joi.string().min(20).required()
})