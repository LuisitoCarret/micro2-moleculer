import ApiGateway from "moleculer-web";
import helmet from "helmet";
//import csurf from "csurf";
//import cookieParser from "cookie-parser";
//import jwt from "jsonwebtoken";

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
          limit: 5,
          headers: true,
        },
        aliases: {
          "GET /rutas": "rutas.getOne",
          "PUT /estado":"rutas.putRuta",
          "PUT /pedidos":"rutas.putPedidos"
        },
         onBeforeCall(ctx, route, req, res) {
          ctx.meta.headers=req.headers;
       
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
