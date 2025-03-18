import { DataTypes } from "sequelize";
import sequelize from "../config/sequalize.config.js"


const Rutas=sequelize.define('Rutas',{
    id_rutaasignada:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false
    },
    nombre_ruta:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{
    timestamps:false,
    tableName:'rutas'
});


export default Rutas;