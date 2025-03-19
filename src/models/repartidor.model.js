import { DataTypes } from "sequelize";
import sequelize from "../config/sequalize.config.js"

const Repartidores=sequelize.define('Repartidores',{
    id_repartidor:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:null
    },
    nombre:{
        type:DataTypes.STRING,
        allowNull:null
    },
},{
    timestamps:false,
    tableName:'repartidores'
})

export default Repartidores;