import { DataTypes } from "sequelize";
import sequelize from "../config/sequalize.config.js"

const rutasDirecciones=sequelize.define('rutasDirecciones',{
    id_direccion:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false
    },
    id_ruta:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false
    }
    
},{
    timestamps:false,
    tableName:'rutasdirecciones'
});


export default rutasDirecciones;