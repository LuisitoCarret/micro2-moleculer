import { DataTypes } from "sequelize";
import sequelize from "../config/sequalize.config.js"

const Clientes=sequelize.define('Clientes',{
    id_cliente:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false
    },
    nombre:{
        type:DataTypes.STRING,
        allowNull:false
    },
    telefono:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
},{
    timestamps:false,
    tableName:'clientes'
});

export default Clientes;