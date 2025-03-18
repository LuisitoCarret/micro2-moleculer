import { DataTypes } from "sequelize";
import sequelize from "../config/sequalize.config.js"

const rutasAsignadas=sequelize.define('rutasAsignadas',{
    id_rutaasignada:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false
    },
    id_ruta:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    fecha_asignacion:{
        type:DataTypes.DATE,
        allowNull:false
    },
    kilometros:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    tiempo:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    status:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{
    timestamps:false,
    tableName:'rutasasignadas'
});


export default rutasAsignadas;