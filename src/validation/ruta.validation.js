import Joi from "joi";

export const rutaSchema=Joi.object({
    id_ruta:Joi.number().positive().integer().required(),
    estado:Joi.string().min(15).required()
})