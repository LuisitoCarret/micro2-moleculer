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
        throw new Error("No se recibieron todos los datos");
      }

      const id_repartidor = parseInt(idRepartidorHeader, 10);

      return await getRutas(id_repartidor);
    },
    putRuta: async (ctx) => {
      const idRepartidorHeader = ctx.meta.headers["id-repartidor"];

      if (!idRepartidorHeader) {
        logger.error("No se recibió el encabezado 'id-repartidor'");
        throw new Error("Falta el encabezado 'id-repartidor'");
      }

      const id_repartidor = parseInt(idRepartidorHeader, 10);
      return await updateRuta(ctx, id_repartidor);
    },
    putPedidos: async (ctx) => {
      const idRepartidorHeader = ctx.meta.headers["id-repartidor"];
      const idRutaAsignadaHeader = ctx.meta.headers["id-rutaasignada"];

      if (!idRepartidorHeader || !idRutaAsignadaHeader) {
        logger.error("Faltan encabezados 'id-repartidor' o 'id-rutaasignada'");
        throw new Error("Faltan encabezados requeridos");
      }

      const id_repartidor = parseInt(idRepartidorHeader, 10);
      const id_rutaasignada = parseInt(idRutaAsignadaHeader, 10);

      return await updatePedidos(ctx, id_repartidor,id_rutaasignada);
    },
  },
};
