import Joi from "joi";

export const rutaSchema=Joi.object({
    id_ruta:Joi.number().strict().positive().integer().required(),
    estado:Joi.string().strict().min(8).required()
})