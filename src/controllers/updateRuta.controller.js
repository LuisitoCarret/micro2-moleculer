import sanitizeHtml from "sanitize-html";
import { rutaSchema } from "../validation/ruta.validation.js";
import logger from "../validation/logger.js";
import rutasAsignadas from "../models/rutasAsignadas.model.js";

export const updateRuta = async (ctx,id_repartidor) => {
    logger.info("Iniciando servicio updateRutaByRepartidor");
  
    const {id_ruta,estado}=ctx.params;
  
    const {error}=rutaSchema.validate({id_ruta,estado});
  
    if(error){
      logger.warn("Validacion fallida al actualizar ruta:", error.details[0].message);
      ctx.meta.$statusCode = 400;
      ctx.meta.$statusMessage = "Validacion fallida";
      return { message: "El formato es incorrecto. Intentelo de nuevo." };
    }
  
    const parsedRutaId = Number(id_ruta); 
  
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