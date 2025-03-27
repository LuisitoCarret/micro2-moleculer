import { Sequelize } from "sequelize";
import "dotenv/config"; 
import pg from "pg";
import logger from "../validation/logger.js";

const sequelize = new Sequelize(process.env.DATABASE, process.env.USER,process.env.PASSWORD, {
  host: process.env.SERVER,
  port:process.env.PORT,
  dialect: "postgres",
  dialectModule:pg,
  ssl:true,
  logging:false
});

const conectarDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Conexión a la base de datos establecida con éxito.");
  } catch (error) {
    logger.error({ err: error }, "Error en la conexion a la base de datos");
  }
};

conectarDB();

export default sequelize;
