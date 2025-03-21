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


const getRutaSchema=Joi.number().integer().positive().required();

export const getRutas = async (id_repartidor) => {
  logger.info("Iniciando servicio getRutasPorRepartidor");
  console.log("ID repartidor recibido:", id_repartidor);

  const { error } = getRutaSchema.validate(id_repartidor);
  if (error) {
    logger.warn(`Validación fallida: ${error.message}`);
    throw new Error("Datos inválidos. Inténtelo de nuevo");
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
    
    console.log("Rutas asignadas encontradas:", rutasAsignadasList.length);

    if (!rutasAsignadasList.length) {
      logger.warn("No se encontraron rutas asignadas para este repartidor");
      throw new Error("No se encontraron los datos solicitados. Intentelo de nuevo");
    }

    const rutasFormateadas = rutasAsignadasList.map((ruta, indexRuta) => {
      console.log(`\n---- Ruta ${indexRuta + 1} ----`);
      console.log("ID Ruta asignada:", ruta.id_rutaasignada);
      console.log("Nombre ruta:", ruta.Ruta?.nombre_ruta || "No llega nombre_ruta");
      console.log("Fecha asignación:", ruta.fecha_asignacion);
      console.log("Kilómetros:", ruta.kilometros);
      console.log("Tiempo estimado:", ruta.tiempo);
      console.log("Status:", ruta.status);

      const primerPedido = ruta.Pedidos[0];
      console.log("Primer pedido:", primerPedido ? primerPedido.id_pedido : "No hay pedidos");
      const direccionGeneral = primerPedido?.direccion || 
                               primerPedido?.Cliente?.Direcciones[0]?.direccioncompleta || 
                               "Dirección no disponible";
      console.log("Dirección general:", direccionGeneral);
      

      ruta.Pedidos.forEach((pedido, indexPedido) => {
        console.log(`  - Pedido ${indexPedido + 1}:`);
        console.log("    ID pedido:", pedido.id_pedido);
        console.log("    Nombre cliente:", pedido.Cliente?.nombre || "Sin nombre");
        console.log("    Teléfono:", pedido.Cliente?.telefono || "Sin teléfono");
        console.log("    Dirección:", pedido.direccion || pedido.Cliente?.Direcciones[0]?.direccioncompleta || "Dirección no disponible");
        console.log("    Kilos tortillas:", pedido.kilostortillas);
        console.log("    Hora entrega:", pedido.horaentrega);
        console.log("    Status:", pedido.status);
      });

      return {
        id: ruta.id_rutaasignada,
        nombre: ruta.Ruta.nombre_ruta,
        fechaAsignada: ruta.fecha_asignacion,
        direccion: (ruta.Pedidos[0]?.Cliente?.Direcciones[0]?.direccioncompleta) || "Dirección no disponible",
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

    console.log("Respuesta final enviada:", JSON.stringify(respuestaFinal, null, 2));
    logger.info("Rutas asignadas del repartidor obtenidas correctamente");
    return respuestaFinal;

  } catch (error) {
    logger.error({ err: error }, "Error al obtener las rutas asignadas del repartidor");
    throw new Error("Error al obtener los datos. Inténtelo de nuevo.");
  }
};



export const updateRuta = async (ctx,id_repartidor) => {
  logger.info("Iniciando servicio updateRutaByRepartidor");

  const {id_ruta,estado}=ctx.params;

  const {error}=rutaSchema.validate({id_ruta,estado});

  if(error){
    logger.warn("Validación fallida al actualizar ruta:", error.details[0].message);
    throw new Error("El formato es incorrecto. Intentelo de nuevo");
  }

  if (!id_repartidor || !id_ruta || !estado) {
    logger.warn("Se requieren 'id_repartidor', 'id_ruta' y 'estado'");
    throw new Error("Faltan datos. Intentelo de nuevo");
  }

  try {
    // Verificamos que la ruta esté asignada a ese repartidor
    const rutaAsignada = await rutasAsignadas.findOne({
      where: { id_rutaasignada: id_ruta, id_repartidor },
    });

    if (!rutaAsignada) {
      logger.warn(`La ruta ${id_ruta} no está asignada al repartidor ${id_repartidor}`);
      throw new Error("Dato no encontrado. Intentelo de nuevo");
    }

   const sanitizeRuta=sanitizeHtml(estado, { allowedTags: [], allowedAttributes: {} });
    // Actualizamos
    rutaAsignada.status = sanitizeRuta;
    await rutaAsignada.save();

    logger.info(`Ruta ${id_ruta} del repartidor ${id_repartidor} actualizada a: ${estado}`);
    return { mensaje: "Actualizacion realizada con exito" };
  } catch (error) {
    logger.error({ err: error }, "Error al actualizar estado de la ruta");
    throw new Error("No se pudieron actualizar los datos. Intentelo de nuevo");
  }
};



export const updatePedidos = async (ctx,id_repartidor,id_rutaasignada) => {

  const { pedidos } = ctx.params;     // Pedidos desde el cuerpo

  const {error}=pedidosSchema.validate({pedidos});

  if (error) {
    logger.warn(`Error de validación de pedidos: ${error.message}`);
    throw new Error("Datos inválidos. Intentelo de nuevo");
  }


  if (!id_rutaasignada || !pedidos) {
    logger.warn("El ID de ruta asignada y los pedidos son obligatorios.");
    throw new Error ("Faltan datos. Por favor ingrese todos los datos");
  }

  try {

    const rutaAsignada = await rutasAsignadas.findOne({
      where: { id_rutaasignada, id_repartidor },
    });

    if (!rutaAsignada) {
      logger.warn(`La ruta ${id_rutaasignada} no pertenece al repartidor ${id_repartidor}`);
      throw new Error("Dato incorrecto o no disponible en esta solicitud");
    }

    for (const pedidoData of pedidos) {
      const { id_pedido, status } = pedidoData;

      if (!id_pedido || !status) {
        logger.warn(`Faltan datos en el pedido: ${JSON.stringify(pedidoData)}`);
        throw new Error("Faltan datos por agregar. Intentelo de nuevo");
        continue; // Saltar al siguiente pedido si faltan datos
      }

      const pedido = await Pedidos.findOne({
        where: { id_pedido, rutaasignadaid: id_rutaasignada }, // Corregido con el nombre correcto de la columna
      });

      const sanitizeStatus=sanitizeHtml(status,{ allowedTags: [], allowedAttributes: {} });
      if (pedido) {
        // Actualizar el estado del pedido
        pedido.status = sanitizeStatus;
        await pedido.save();
        logger.info(`Pedido ${id_pedido} actualizado a estado: ${status}`);
      } else {
        logger.warn(`Pedido ${id_pedido} no encontrado en ruta asignada ${id_rutaasignada}.`);
      }
    }

    return { mensaje: "Actualizacion realizada con exito" };
  } catch (error) {
    logger.error({ err: error }, "Error al actualizar pedidos");
    throw new Error("No se puedo actualizar los datos. Intentelo de nuevo");
  }
};

