import { onRequestPost as __api_auth_login_js_onRequestPost } from "C:\\Users\\agape_ibeel\\Desktop\\nomin cargo\\functions\\api\\auth\\login.js"
import { onRequestPost as __api_auth_register_js_onRequestPost } from "C:\\Users\\agape_ibeel\\Desktop\\nomin cargo\\functions\\api\\auth\\register.js"
import { onRequestGet as __api_upload_js_onRequestGet } from "C:\\Users\\agape_ibeel\\Desktop\\nomin cargo\\functions\\api\\upload.js"
import { onRequestPost as __api_upload_js_onRequestPost } from "C:\\Users\\agape_ibeel\\Desktop\\nomin cargo\\functions\\api\\upload.js"
import { onRequest as __api_banners_js_onRequest } from "C:\\Users\\agape_ibeel\\Desktop\\nomin cargo\\functions\\api\\banners.js"
import { onRequest as __api_containers_js_onRequest } from "C:\\Users\\agape_ibeel\\Desktop\\nomin cargo\\functions\\api\\containers.js"
import { onRequest as __api_init_db_js_onRequest } from "C:\\Users\\agape_ibeel\\Desktop\\nomin cargo\\functions\\api\\init-db.js"
import { onRequest as __api_notifications_js_onRequest } from "C:\\Users\\agape_ibeel\\Desktop\\nomin cargo\\functions\\api\\notifications.js"
import { onRequest as __api_orders_js_onRequest } from "C:\\Users\\agape_ibeel\\Desktop\\nomin cargo\\functions\\api\\orders.js"

export const routes = [
    {
      routePath: "/api/auth/login",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_login_js_onRequestPost],
    },
  {
      routePath: "/api/auth/register",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_register_js_onRequestPost],
    },
  {
      routePath: "/api/upload",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_upload_js_onRequestGet],
    },
  {
      routePath: "/api/upload",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_upload_js_onRequestPost],
    },
  {
      routePath: "/api/banners",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_banners_js_onRequest],
    },
  {
      routePath: "/api/containers",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_containers_js_onRequest],
    },
  {
      routePath: "/api/init-db",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_init_db_js_onRequest],
    },
  {
      routePath: "/api/notifications",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_notifications_js_onRequest],
    },
  {
      routePath: "/api/orders",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_orders_js_onRequest],
    },
  ]