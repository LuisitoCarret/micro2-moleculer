import Joi from "joi";

export const pedidosSchema = Joi.object({
    pedidos: Joi.array()
      .items(
        Joi.object({
          id: Joi.number().integer().positive().required(),
          estado: Joi.string().min(3).required(),
        })
      )
      .required(),
  });
  