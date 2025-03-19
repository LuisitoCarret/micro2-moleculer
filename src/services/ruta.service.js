import { getRutas, updateRuta,updatePedidos} from "../controllers/rutas.controller.js"


export default{
    name:"rutas",
    actions:{
        getOne:async (ctx)=>{
            return await getRutas(ctx.params.id);
        },
        putRuta:async(ctx)=>{
            return await updateRuta(ctx);
        },
        putPedidos:async(ctx)=>{
            return await updatePedidos(ctx);
        }
    }
};