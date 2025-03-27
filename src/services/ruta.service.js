import {
  getRutas,
  updateRuta,
  updatePedidos,
} from "../controllers/rutas.controller.js";
import logger from "../validation/logger.js";

export default {
  name: "rutas",
  actions: {
    getOne: async (ctx) => {
      const idRepartidorHeader = ctx.meta.headers["id-repartidor"];

      if (!idRepartidorHeader) {
        logger.error("No se recibió el encabezado 'id-repartidor'");
        ctx.meta.$statusCode = 400;
        ctx.meta.$statusMessage = "Faltan dato";
        return { message: "No se recibieron todos los datos. Verifique su solicitud" };
      }

      const id_repartidor = parseInt(idRepartidorHeader, 10);

      return await getRutas(id_repartidor,ctx);
    },
    putRuta: async (ctx) => {
      const idRepartidorHeader = ctx.meta.headers["id-repartidor"];

      if (!idRepartidorHeader) {
        logger.error("No se recibió el encabezado 'id-repartidor'");
        ctx.meta.$statusCode = 400;
        ctx.meta.$statusMessage = "Falta dato";
        return { message: "No se encontro el dato solicitado." };
      }

      const id_repartidor = parseInt(idRepartidorHeader, 10);
      return await updateRuta(ctx, id_repartidor);
    },
    putPedidos: async (ctx) => {
      const idRepartidorHeader = ctx.meta.headers["id-repartidor"];
      const idRutaAsignadaHeader = ctx.meta.headers["id-rutaasignada"];

      if (!idRepartidorHeader || !idRutaAsignadaHeader) {
        logger.error("Faltan encabezados 'id-repartidor' o 'id-rutaasignada'");
        ctx.meta.$statusCode = 400;
        ctx.meta.$statusMessage = "Faltan datos";
        return { message: "Solicitud incompleta. Datos requeridos ausentes." };
      }

      const id_repartidor = parseInt(idRepartidorHeader, 10);
      const id_rutaasignada = parseInt(idRutaAsignadaHeader, 10);

      return await updatePedidos(ctx, id_repartidor,id_rutaasignada);
    },
  },
};
