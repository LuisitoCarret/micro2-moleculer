import logger from "../validation/logger.js";
import rutasAsignadas from "../models/rutasAsignadas.model.js";
import Pedidos from "../models/pedidos.model.js";
import Clientes from "../models/clientes.model.js";
import Direcciones from "../models/direcciones.model.js";
import Rutas from "../models/rutas.model.js";
import Joi from "joi";
import { rutaSchema } from "../validation/ruta.validation.js";
import { pedidosSchema } from "../validation/pedidos.validation.js";


const getRutaSchema=Joi.number().integer().positive().required();

export const getRutas = async (id_repartidor) => {
  logger.info("Iniciando servicio getRutasPorRepartidor");
  
  const { error } = getRutaSchema.validate(id_repartidor);
  if (error) {
    logger.warn(`Validación fallida: ${error.message}`);
    throw new Error(`Datos inválidos: ${error.message}`);
  }

  try {
    const rutasAsignadasList = await rutasAsignadas.findAll({
      where: { id_repartidor },
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

    if (!rutasAsignadasList.length) {
      logger.warn("No se encontraron rutas asignadas para este repartidor");
      throw new Error("No se encontraron rutas asignadas");
    }

    const rutasFormateadas = rutasAsignadasList.map((ruta) => ({
      id: ruta.id_rutaasignada,
      nombre: ruta.Ruta.nombre_ruta,
      fechaAsignada: ruta.fecha_asignacion,
      kilometraje: `${ruta.kilometros} km`,
      tiempoEstimado: `${ruta.tiempo} hrs`,
      estado: ruta.status || "No iniciado",
      pedidos: ruta.Pedidos.map((pedido) => ({
        id: pedido.id_pedido,
        nombre: `Pedido ${pedido.id_pedido}: ${pedido.Cliente?.nombre || "Sin nombre"}`,
        direccion: pedido.Cliente?.Direcciones
          ? pedido.Cliente.Direcciones[0]?.direccioncompleta
          : "Sin dirección",
        kilosTortilla: `${pedido.kilostortillas} kg`,
        telefono: pedido.Cliente ? pedido.Cliente.telefono : "Sin teléfono",
        status: pedido.status || "Pendiente",
      })),
    }));

    const respuestaFinal = {
      id_repartidor,
      rutas_asignadas: rutasFormateadas,
    };

    logger.info("Rutas asignadas del repartidor obtenidas correctamente");
    return respuestaFinal;

  } catch (error) {
    logger.error("Error al obtener rutas asignadas del repartidor:", error);
    throw new Error("Error al obtener los datos. Inténtelo de nuevo.");
  }
};


export const updateRuta = async (ctx,id_repartidor) => {
  logger.info("Iniciando servicio updateRutaByRepartidor");

  const {id_ruta,estado}=ctx.params;

  if (!id_repartidor || !id_ruta || !estado) {
    logger.warn("Faltan datos");
    throw new Error("Se requieren 'id_repartidor', 'id_ruta' y 'estado'");
  }

  try {
    // Verificamos que la ruta esté asignada a ese repartidor
    const rutaAsignada = await rutasAsignadas.findOne({
      where: { id_rutaasignada: id_ruta, id_repartidor },
    });

    if (!rutaAsignada) {
      logger.warn(`La ruta ${id_ruta} no está asignada al repartidor ${id_repartidor}`);
      throw new Error("Ruta no encontrada para ese repartidor");
    }

    // Actualizamos
    rutaAsignada.status = estado;
    await rutaAsignada.save();

    logger.info(`Ruta ${id_ruta} del repartidor ${id_repartidor} actualizada a: ${estado}`);
    return { mensaje: "Estado de la ruta actualizado correctamente" };
  } catch (error) {
    logger.error("Error al actualizar estado de la ruta:", error);
    throw new Error("Error al actualizar estado de la ruta.");
  }
};



export const updatePedidos = async (ctx,id_repartidor,id_rutaasignada) => {

  const { pedidos } = ctx.params;       // Pedidos desde el cuerpo

  if (!id_rutaasignada || !pedidos) {
    throw new Error("El ID de ruta asignada y los pedidos son obligatorios.");
  }

  if (!Array.isArray(pedidos)) {
    throw new Error("El campo 'pedidos' debe ser un arreglo.");
  }

  try {

    const rutaAsignada = await rutasAsignadas.findOne({
      where: { id_rutaasignada, id_repartidor },
    });

    if (!rutaAsignada) {
      logger.warn(`La ruta ${id_rutaasignada} no pertenece al repartidor ${id_repartidor}`);
      throw new Error("Ruta no asignada a este repartidor.");
    }

    for (const pedidoData of pedidos) {
      const { id_pedido, status } = pedidoData;

      if (!id_pedido || !status) {
        logger.warn(`Faltan datos en el pedido: ${JSON.stringify(pedidoData)}`);
        continue; // Saltar al siguiente pedido si faltan datos
      }

      const pedido = await Pedidos.findOne({
        where: { id_pedido, rutaasignadaid: id_rutaasignada }, // Corregido con el nombre correcto de la columna
      });

      if (pedido) {
        // Actualizar el estado del pedido
        pedido.status = status;
        await pedido.save();
        logger.info(`Pedido ${id_pedido} actualizado a estado: ${status}`);
      } else {
        logger.warn(`Pedido ${id_pedido} no encontrado en ruta asignada ${id_rutaasignada}.`);
      }
    }

    return { mensaje: "Estados de los pedidos actualizados correctamente." };
  } catch (error) {
    logger.error("Error al actualizar pedidos:", error.message);
    throw new Error("Error al actualizar estados de los pedidos.");
  }
};

