import Joi from "joi";

export const pedidosSchema = Joi.object({
    pedidos: Joi.array()
      .items(
        Joi.object({
          id_pedido: Joi.number().strict().integer().positive().required(),
          status: Joi.string().strict().min(5).max(20).required(),
        })
      )
      .required(),
  });
  