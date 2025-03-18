import { DataTypes } from "sequelize";
import sequelize from "../config/sequalize.config.js"

const Direcciones=sequelize.define('Direcciones',{
    id_direccion:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false
    },
    direccioncompleta:{
        type:DataTypes.STRING,
        allowNull:false
    },
    id_cliente:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
},{
    timestamps:false,
    tableName:'direcciones'
});


export default Direcciones;