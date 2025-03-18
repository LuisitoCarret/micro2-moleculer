import logger from "../validation/logger.js";
import rutasAsignadas from "../models/rutasAsignadas.model.js";
import Pedidos from "../models/pedidos.model.js";
import Clientes from "../models/clientes.model.js";
import Direcciones from "../models/direcciones.model.js";
import Rutas from "../models/rutas.model.js";
import Joi from "joi";
import { rutaSchema } from "../validation/ruta.validation.js";


const getRutaSchema=Joi.number().integer().positive().required();

export const getRuta = async (id) => {
  logger.info("Iniciando servicio  getRuta");
  try {
    const {error}=getRutaSchema.validate(id);

    if (error) {
      logger.warn(`Validación fallida: ${error.message}`);
      throw new Error(`ID de ruta inválido: ${error.message}`);
    }

    const ruta = await rutasAsignadas.findByPk(id, {
      include: [
        {
          model: Rutas,
          attributes: ["nombre_ruta"],
        },
        {
          model: Pedidos,
          include: [
            {
              model: Clientes,
              attributes: ["nombre", "telefono"],
              include: [
                {
                  model: Direcciones,
                  attributes: ["direccioncompleta"],
                },
              ],
            },
          ],
          attributes: ["id_pedido", "status", "kilostortillas"],
        },
      ],
    });

    if (!ruta) {
      logger.warn("Ruta no encontrada");
      throw new Error("Ruta no encontrada");
    }

    // Formateamos los datos para la respuesta JSON
    const rutaFormateada = {
      id: ruta.id_rutaasignada,
      nombre: ruta.Ruta.nombre_ruta,
      fechaAsignada: ruta.fecha_asignacion,
      kilometraje: `${ruta.kilometros} km`,
      tiempoEstimado: `${ruta.tiempo} hrs`,
      estado: ruta.status || "No iniciado",
      pedidos: ruta.Pedidos.map((pedido) => ({
        id: pedido.id_pedido,
        nombre: `Pedido ${pedido.id_pedido}: ${
          pedido.Cliente?.nombre || "Sin nombre"
        }`,
        direccion: pedido.Cliente?.Direcciones
          ? pedido.Cliente.Direcciones[0]?.direccioncompleta
          : "Sin dirección",
        kilosTortilla: `${pedido.kilostortillas} kg`,
        telefono: pedido.Cliente ? pedido.Cliente.telefono : "Sin teléfono",
        status: pedido.status || "Pendiente",
      })),
    };

    logger.info("Ruta asignada obtenida correctamente");
    return rutaFormateada;
  } catch (error) {
    logger.error("Error al obtener ruta asignada:", error);
    throw new Error("Error al obtener los datos. Inténtelo de nuevo.");
  }
};


export const updateRuta = async (ctx) => {
  logger.info("Iniciando servicio updateRuta");

  const { error } = rutaSchema.validate(ctx.params);
  if (error) {
    logger.warn(`Validación fallida: ${error.message}`);
    throw new Error(`Datos inválidos: ${error.message}`);
  }

  const { id, estado } = ctx.params;
  try {
    const rutaup = await rutasAsignadas.findByPk(id);

    if (!rutaup) {
      logger.warn("Ruta no encontrada, algo salio mal dentro del servicio");
      throw new Error("Ruta no encontrada");
    }

    rutaup.status = estado;
    await rutaup.save();

    logger.info(`Estado de la ruta ${id} actualizado a: ${estado}`);
    return { mensaje: "Estado de la ruta actualizado correctamente" };
  } catch (error) {
    logger.error("Error al actualizar estado de la ruta:", error);
    throw new Error("Error al actualizar estado de la ruta.");
  }
};


export const updatePedidos = async (ctx) => {

  const { error } = updatePedidos.validate(ctx.params);
  if (error) {
    logger.warn(`Validación fallida: ${error.message}`);
    throw new Error(`Datos inválidos: ${error.message}`);
  }

  const { pedidos } = ctx.params;
  
  if (!pedidos || !Array.isArray(pedidos)) {
    logger.warn("El cuerpo de la solicitud debe incluir un arreglo 'pedidos'");
    throw new Error(
      "El cuerpo de la solicitud debe incluir un arreglo 'pedidos'."
    );
  }

  try {
    // Iteramos sobre la lista de pedidos y actualizamos su estado
    for (const pedidoData of pedidos) {
      const { id, estado } = pedidoData;

      const pedido = await Pedidos.findByPk(id);
      if (pedido) {
        pedido.status = estado;
        await pedido.save();
        logger.info(`Pedido ${id} actualizado a estado: ${estado}`);
      } else {
        logger.warn(`Pedido con ID ${id} no encontrado, se omitió.`);
      }
    }

    return { mensaje: "Estados de los pedidos actualizados correctamente" };
  } catch (error) {
    logger.error("Error al actualizar estados de los pedidos:", error);
    throw new Error("Error al actualizar estados de los pedidos.");
  }
};
