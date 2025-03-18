import ApiGateway from "moleculer-web";
import helmet from "helmet";
//import csurf from "csurf";
//import cookieParser from "cookie-parser";
//import jwt from "jsonwebtoken";
//import { checkPermission } from "../validation/rbac.js";

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
          allowedHeaders: ["Content-Type", "Authorization"],
          credentials: true,
        },
        rateLimit: {
          window: 60 * 1000,
          limit: 5,
          headers: true,
        },
        aliases: {
          "GET /rutas/:id": "rutas.getOne",
          "PUT /rutas/:id":"rutas.putRuta",
          "PUT /rutas/pedidos/:id":"rutas.putPedidos"
        },
         //onBeforeCall(ctx, route, req, res) {
          //res.setHeader("X-CSRF-Token", req.csrfToken());
       
        //},
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
