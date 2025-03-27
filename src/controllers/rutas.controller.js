import logger from "../validation/logger.js";
import rutasAsignadas from "../models/rutasAsignadas.model.js";
import Pedidos from "../models/pedidos.model.js";
import Clientes from "../models/clientes.model.js";
import Direcciones from "../models/direcciones.model.js";
import Rutas from "../models/rutas.model.js";
import rutasDirecciones from "../models/rutasDirecciones.model.js";
import Joi from "joi";
import sanitizeHtml from "sanitize-html";
import { rutaSchema } from "../validation/ruta.validation.js";
import { pedidosSchema } from "../validation/pedidos.validation.js";


const getRutaSchema=Joi.number().strict().integer().positive().required();

export const getRutas = async (id_repartidor,ctx) => {
  logger.info("Iniciando servicio getRutasPorRepartidor");

  const { error } = getRutaSchema.validate(id_repartidor);
  if (error) {
    logger.warn(`Validación fallida: ${error.message}`);
    ctx.meta.$statusCode = 400;
    ctx.meta.$statusMessage = "Validación fallida";
    return { message: "Datos invalidos. Intentelo de nuevo." };
  }

  try {
    const rutasAsignadasList = await rutasAsignadas.findAll({
      where: { id_repartidor },
      include: [
        {
          model: Rutas,
          attributes: ["nombre_ruta"],
          include: [
            {
              model: rutasDirecciones,
              include: [
                {
                  model: Direcciones,
                  attributes: ["direccioncompleta"],
                },
              ],
            },
          ],
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
          attributes: [
            "id_pedido",
            "status",
            "kilostortillas",
            "direccion",
            "horaentrega",
          ],
        },
      ],
    });
    

    if (!rutasAsignadasList.length) {
      logger.warn("No se encontraron rutas asignadas para este repartidor");
      ctx.meta.$statusCode = 404;
      ctx.meta.$statusMessage = "No encontrado";
      return { message: "No se encontraron los datos solicitados." };
    }

    const rutasFormateadas = rutasAsignadasList.map((ruta, indexRuta) => {
      return {
        id: ruta.id_rutaasignada,
        nombre: ruta.Ruta.nombre_ruta,
        fechaAsignada: ruta.fecha_asignacion,
        direccion: ruta.Pedidos[0]?.Cliente?.Direcciones[0]?.direccioncompleta || "Dirección no disponible",
        totalEntregas: ruta.Pedidos.length,
        kilometraje: `${ruta.kilometros} km`,
        tiempoEstimado: `${ruta.tiempo} hrs`,
        estado: ruta.status || "No iniciado",
        pedidos: ruta.Pedidos.map((pedido, index) => ({
          id: pedido.id_pedido,
          nombre: `Pedido ${index + 1}: ${pedido.Cliente?.nombre || "Sin nombre"}`,
          direccion: pedido.direccion || pedido.Cliente?.Direcciones[0]?.direccioncompleta || "Dirección no disponible",
          kilosTortilla: `${pedido.kilostortillas} kg`,
          horaEntrega: pedido.horaentrega,
          telefono: pedido.Cliente?.telefono || "Sin teléfono",
          status: pedido.status || "Pendiente",
        })),
      };
    });

    const respuestaFinal = {
      id_repartidor,
      rutas_asignadas: rutasFormateadas,
    };

    logger.info("Rutas asignadas del repartidor obtenidas correctamente");
    return respuestaFinal;

  } catch (error) {
    logger.error({ err: error }, "Error al obtener las rutas asignadas del repartidor");
    ctx.meta.$statusCode = 500;
    ctx.meta.$statusMessage = "Error interno del servidor";
    return { message: "Error al obtener los datos. Intentelo de nuevo." };
  }
};



export const updateRuta = async (ctx,id_repartidor) => {
  logger.info("Iniciando servicio updateRutaByRepartidor");

  const {id_ruta,estado}=ctx.params;

  if (typeof id_ruta !== "string" || !/^\d+$/.test(id_ruta)) {
    logger.warn(`ID de ruta con formato inválido: ${id_ruta}`);
    ctx.meta.$statusCode = 400;
    ctx.meta.$statusMessage = "Dato inválido";
    return { message: "El dato ingresado no es correcto. Intentelo de nuevo" };
  }


  const parsedRutaId = Number(id_ruta);

  const {error}=rutaSchema.validate({id_ruta:parsedRutaId,estado});

  if(error){
    logger.warn("Validación fallida al actualizar ruta:", error.details[0].message);
    ctx.meta.$statusCode = 400;
    ctx.meta.$statusMessage = "Validación fallida";
    return { message: "El formato es incorrecto. Intentelo de nuevo." };
  }

  try {
    // Verificamos que la ruta esté asignada a ese repartidor
    const rutaAsignada = await rutasAsignadas.findOne({
      where: { id_rutaasignada: parsedRutaId, id_repartidor },
    });

    if (!rutaAsignada) {
      logger.warn(`La ruta ${parsedRutaId} no está asignada al repartidor ${id_repartidor}`);
      ctx.meta.$statusCode = 404;
      ctx.meta.$statusMessage = "No encontrado";
      return { message: "Dato no encontrado. Intentelo de nuevo." };
    }

   const sanitizeRuta=sanitizeHtml(estado, { allowedTags: [], allowedAttributes: {} });
    // Actualizamos
    rutaAsignada.status = sanitizeRuta;
    await rutaAsignada.save();

    logger.info(`Ruta ${parsedRutaId} del repartidor ${id_repartidor} actualizada a: ${estado}`);
    return { mensaje: "Operacion realizada con exito" };
  } catch (error) {
    logger.error({ err: error }, "Error al actualizar estado de la ruta");
    ctx.meta.$statusCode = 500;
    ctx.meta.$statusMessage = "Error interno del servidor";
    return { message: "No se pudieron actualizar los datos. Intentelo de nuevo." };
  }
};



export const updatePedidos = async (ctx,id_repartidor,id_rutaasignada) => {

  const { pedidos } = ctx.params;     // Pedidos desde el cuerpo

  const {error}=pedidosSchema.validate({pedidos});

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
      logger.warn(`La ruta ${id_rutaasignada} no pertenece al repartidor ${id_repartidor}`);
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
        logger.warn(`ID de pedido inválido o datos faltantes: ${JSON.stringify(pedidoData)}`);
        ctx.meta.$statusCode = 400;
        ctx.meta.$statusMessage = "Dato inválido";
        return { message: "Los datos del pedido no son válidos. Inténtelo de nuevo." };
      }

      const pedido = await Pedidos.findOne({
        where: { id_pedido:parsedId, rutaasignadaid: id_rutaasignada }, // Corregido con el nombre correcto de la columna
      });

      const sanitizeStatus=sanitizeHtml(status,{ allowedTags: [], allowedAttributes: {} });
      if (pedido) {
        // Actualizar el estado del pedido
        pedido.status = sanitizeStatus;
        await pedido.save();
        logger.info(`Pedido ${parsedId} actualizado a estado: ${status}`);
      } else {
        logger.warn(`Pedido ${parsedId} no encontrado en ruta asignada ${id_rutaasignada}.`);
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

