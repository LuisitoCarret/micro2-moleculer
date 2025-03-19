import Clientes from "./clientes.model.js";
import Direcciones from "./direcciones.model.js";
import Pedidos from "./pedidos.model.js";
import rutasAsignadas from "./rutasAsignadas.model.js";
import Rutas from "./rutas.model.js";
import rutasDirecciones from "./rutasDirecciones.model.js";
import Repartidores from "./repartidor.model.js";


try {
    //Rutas Asignadas → Pedidos (1:N)
Pedidos.belongsTo(rutasAsignadas, { foreignKey: 'rutaasignadaid'});
rutasAsignadas.hasMany(Pedidos, { foreignKey: 'rutaasignadaid' });


    //Rutas → Rutas Asignadas (1:N)
rutasAsignadas.belongsTo(Rutas, { foreignKey: 'id_ruta'});
Rutas.hasMany(rutasAsignadas, { foreignKey: 'id_ruta' });

   //Rutas → Rutas Direcciones (1:N)
rutasDirecciones.belongsTo(Rutas, { foreignKey: 'id_ruta'});
Rutas.hasMany(rutasDirecciones, { foreignKey: 'id_ruta' });

   //Clientes → Pedidos (1:N)
Pedidos.belongsTo(Clientes, { foreignKey: 'cliente_id'});
Clientes.hasMany(Pedidos, { foreignKey: 'cliente_id' });

   //Clientes → Direcciones (1:N)
Direcciones.belongsTo(Clientes, { foreignKey: 'id_cliente'});
Clientes.hasMany(Direcciones,{foreignKey:'id_cliente'})

   //Direcciones → Rutas Direcciones (1:N)
rutasDirecciones.belongsTo(Direcciones, { foreignKey: 'id_direccion'});
Direcciones.hasMany(rutasDirecciones, { foreignKey: 'id_direccion' });

  //
  rutasAsignadas.belongsTo(Repartidores,{foreignKey:'id_repartidor'});
  Repartidores.hasMany(rutasAsignadas,{foreignKey:'id_repartidor'});


} catch (error) {
    logger.error("Error al obtener ruta asignada:", error);
    console.error("Error detallado:", error); // Para capturar más detalles
    throw new Error("Error al obtener los datos. Inténtelo de nuevo.");
}


export default function associateModels() {}
