import logger from "../validation/logger.js";
import rutasAsignadas from "../models/rutasAsignadas.model.js";
import Pedidos from "../models/pedidos.model.js";
import Clientes from "../models/clientes.model.js";
import Direcciones from "../models/direcciones.model.js";
import Rutas from "../models/rutas.model.js";
import rutasDirecciones from "../models/rutasDirecciones.model.js";
import Joi from "joi";

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