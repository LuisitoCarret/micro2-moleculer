import ApiGateway from "moleculer-web";
import helmet from "helmet";

export default {
  name: "api",
  mixins: [ApiGateway],
  settings: {
    routes: [
      {
        path: "/api",
        cors: {
          origin: "*",
          methods: ["GET","PUT"],
          allowedHeaders: ["Content-Type", "Authorization","id-repartidor","id-rutaasingnada"],
          credentials: true,
        },
        rateLimit: {
          window: 60 * 1000,
          limit: 20,
          headers: true,
        },
        aliases: {
          "GET /rutas": "rutas.getOne",
          "PUT /estado":"rutas.putRuta",
          "PUT /pedidos":"rutas.putPedidos"
        },
         onBeforeCall(ctx, route, req, res) {
          ctx.meta.headers=req.headers;
          
          // const token = req.headers["authorization"];
          // if (!token) {
          //   ctx.meta.$statusCode = 401;
          //   ctx.meta.$statusMessage = "Token faltante";
          //   throw new Error("No se proporciono el token de autorizacion.");
          // }

          // try {
          //   const response = axios.post(
          //     "https://api-login-chi.vercel.app/api/auth/verify",
          //     {}, // body vacío
          //     {
          //       headers: {
          //         "Content-Type": "application/json",
          //         Authorization: token,
          //       },
          //     }
          //   );

          //   if (response.data.msg === true) {
          //     ctx.meta.user = response.data.user || { autorizado: true };
          //   } else {
          //     ctx.meta.$statusCode = 401;
          //     ctx.meta.$statusMessage = "Token invalido";
          //     throw new Error("Token no autorizado.");
          //   }
          // } catch (err) {
          //   ctx.meta.$statusCode = 500;
          //   ctx.meta.$statusMessage = "Error de autenticacion";
          //   throw new Error("No se pudo verificar el token.");
          // }
        },
      },
    ],
    use: [
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
          },
        },
        frameguard: { action: "deny" },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
        noSniff: true,
      }),
    ],
  },
};
