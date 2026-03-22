import { onRequestPost as __api_orders_js_onRequestPost } from "C:\\Users\\agape\\OneDrive\\바탕 화면\\nomin cargo\\functions\\api\\orders.js"
import { onRequestGet as __api_tracking_js_onRequestGet } from "C:\\Users\\agape\\OneDrive\\바탕 화면\\nomin cargo\\functions\\api\\tracking.js"
import { onRequestPost as __api_upload_js_onRequestPost } from "C:\\Users\\agape\\OneDrive\\바탕 화면\\nomin cargo\\functions\\api\\upload.js"

export const routes = [
    {
      routePath: "/api/orders",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_orders_js_onRequestPost],
    },
  {
      routePath: "/api/tracking",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_tracking_js_onRequestGet],
    },
  {
      routePath: "/api/upload",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_upload_js_onRequestPost],
    },
  ]