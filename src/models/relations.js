import logger from "../validation/logger.js";
import Clientes from "./clientes.model.js";
import Direcciones from "./direcciones.model.js";
import Pedidos from "./pedidos.model.js";
import rutasAsignadas from "./rutasAsignadas.model.js";
import Rutas from "./rutas.model.js";
import rutasDirecciones from "./rutasDirecciones.model.js";
import Repartidores from "./repartidor.model.js";

export default function associateModels() {
  try {
    // Relación: Pedidos → Rutas Asignadas
    Pedidos.belongsTo(rutasAsignadas, { foreignKey: 'rutaasignadaid' });
    rutasAsignadas.hasMany(Pedidos, { foreignKey: 'rutaasignadaid' });

    // Relación: Rutas Asignadas → Rutas
    rutasAsignadas.belongsTo(Rutas, { foreignKey: 'id_ruta' });
    Rutas.hasMany(rutasAsignadas, { foreignKey: 'id_ruta' });

    // Relación: Rutas Direcciones → Rutas
    rutasDirecciones.belongsTo(Rutas, { foreignKey: 'id_ruta' });
    Rutas.hasMany(rutasDirecciones, { foreignKey: 'id_ruta' });

    // Relación: Pedidos → Clientes
    Pedidos.belongsTo(Clientes, { foreignKey: 'cliente_id' });
    Clientes.hasMany(Pedidos, { foreignKey: 'cliente_id' });

    // Relación: Direcciones → Clientes
    Direcciones.belongsTo(Clientes, { foreignKey: 'id_cliente' });
    Clientes.hasMany(Direcciones, { foreignKey: 'id_cliente' });

    // Relación: Rutas Direcciones → Direcciones
    rutasDirecciones.belongsTo(Direcciones, { foreignKey: 'id_direccion' });
    Direcciones.hasMany(rutasDirecciones, { foreignKey: 'id_direccion' });

    // Relación: Rutas Asignadas → Repartidores
    rutasAsignadas.belongsTo(Repartidores, { foreignKey: 'id_repartidor' });
    Repartidores.hasMany(rutasAsignadas, { foreignKey: 'id_repartidor' });

    logger.info("Relaciones entre modelos definidas correctamente.");
  } catch (error) {
    logger.error("Error al asociar modelos:", error);
    throw new Error("No se pudieron asociar los datos.");
  }
}