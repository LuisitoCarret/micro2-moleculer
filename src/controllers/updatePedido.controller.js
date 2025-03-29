import { pedidosSchema } from "../validation/pedidos.validation.js";
import logger from "../validation/logger.js";
import rutasAsignadas from "../models/rutasAsignadas.model.js";
import Pedidos from "../models/pedidos.model.js";
import sanitizeHtml from "sanitize-html";

export const updatePedidos = async (ctx, id_repartidor, id_rutaasignada) => {
  const { pedidos } = ctx.params;

  const { error } = pedidosSchema.validate({ pedidos });

  if (error) {
    logger.warn(`Error de validación de pedidos: ${error.message}`);
    ctx.meta.$statusCode = 400;
    ctx.meta.$statusMessage = "Validación fallida";
    return { message: "Datos inválidos. Inténtelo de nuevo." };
  }

  if (!id_rutaasignada || !pedidos) {
    logger.warn("El ID de ruta asignada y los pedidos son obligatorios.");
    ctx.meta.$statusCode = 400;
    ctx.meta.$statusMessage = "Datos faltantes";
    return { message: "Datos no completos. Intentelo de nuevo." };
  }

  try {
    const rutaAsignada = await rutasAsignadas.findOne({
      where: { id_rutaasignada, id_repartidor },
    });

    if (!rutaAsignada) {
      logger.warn(
        `La ruta ${id_rutaasignada} no pertenece al repartidor ${id_repartidor}`
      );
      ctx.meta.$statusCode = 404;
      ctx.meta.$statusMessage = "No encontrado";
      return { message: "Dato incorrecto o no disponible en esta solicitud" };
    }

    for (const pedidoData of pedidos) {
      const { id_pedido, status } = pedidoData;
      const parsedId = Number(id_pedido);

      if (
        !id_pedido ||
        !status ||
        !Number.isInteger(parsedId) ||
        parsedId <= 0
      ) {
        logger.warn(
          `ID de pedido inválido o datos faltantes: ${JSON.stringify(
            pedidoData
          )}`
        );
        ctx.meta.$statusCode = 400;
        ctx.meta.$statusMessage = "Dato inválido";
        return {
          message: "Los datos del pedido no son válidos. Inténtelo de nuevo.",
        };
      }

      const pedido = await Pedidos.findOne({
        where: { id_pedido: parsedId, rutaasignadaid: id_rutaasignada }, 
      });

      const sanitizeStatus = sanitizeHtml(status, {
        allowedTags: [],
        allowedAttributes: {},
      });
      if (pedido) {
        // Actualizar el estado del pedido
        pedido.status = sanitizeStatus;
        await pedido.save();
        logger.info(`Pedido ${parsedId} actualizado a estado: ${status}`);
      } else {
        logger.warn(
          `Pedido ${parsedId} no encontrado en ruta asignada ${id_rutaasignada}.`
        );
      }
    }

    return { mensaje: "Operacion realizada con exito" };
  } catch (error) {
    logger.error({ err: error }, "Error al actualizar pedidos");
    ctx.meta.$statusCode = 500;
    ctx.meta.$statusMessage = "Error interno del servidor";
    return { message: "No se pudo realizar la operacion. Intentelo de nuevo." };
  }
};
