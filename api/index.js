import { ServiceBroker } from "moleculer";
import logger from "../src/validation/logger.js";
import rutaService from "../src/services/ruta.service.js";
import apiService from "../src/services/api.service.js";
import associateModels from "../src/models/relations.js";

associateModels(); 

const broker = new ServiceBroker({
    errorHandler:(err)=>{
      console.log("Error capturado en broker:", err);
      logger.error("Error global en el broker:", {
        message: err.message,
        stack: err.stack,
      });
    },    
  });
  
  broker.createService(rutaService);
  logger.info("Servicio 'planesService' creado correctamente.");
  broker.createService(apiService);
  logger.info("Servicio 'apiService' creado correctamente.");
  
  const start = async () => {
    try {
      logger.info("Iniciando el broker y servicios")
      await broker.start();
      logger.info("Broker y servicios iniciados con éxito");
    } catch (error) {
      logger.error({ err: error }, "Error al iniciar el broker y los servicios");
    }
  };
  
  start();
  