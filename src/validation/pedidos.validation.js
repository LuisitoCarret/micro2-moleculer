import Joi from "joi";

export const pedidosSchema = Joi.object({
    pedidos: Joi.array()
      .items(
        Joi.object({
          id_pedido: Joi.number().strict().integer().positive().required(),
          status: Joi.string().valid("pendiente", "en camino", "completado", "cancelado").required(),
        })
      )
      .required(),
  });
  