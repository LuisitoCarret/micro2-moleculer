import { DataTypes } from "sequelize";
import sequelize from "../config/sequalize.config.js";

const Pedidos = sequelize.define(
  "Pedidos",
  {
    id_pedido: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    rutaasignadaid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kilostortillas: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "pedidos",
  }
);

export default Pedidos;
