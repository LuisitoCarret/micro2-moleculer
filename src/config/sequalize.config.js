import { Sequelize } from "sequelize";
import "dotenv/config"; 
import pg from "pg";

const sequelize = new Sequelize(process.env.DATABASE, process.env.USER,process.env.PASSWORD, {
  host: process.env.SERVER,
  port:process.env.PORT,
  dialect: "postgres",
  dialectModule:pg,
  ssl:true
 
});



export default sequelize;
