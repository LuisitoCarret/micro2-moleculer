import Joi from "joi";

export const pedidosSchema = Joi.object({
    pedidos: Joi.array()
      .items(
        Joi.object({
          id_pedido: Joi.number().integer().positive().required(),
          status: Joi.string().min(15).required(),
        })
      )
      .required(),
  });
  