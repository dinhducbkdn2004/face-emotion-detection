import { type RouteConfig, index, route } from "@react-router/dev/routes";

// Xác định rõ ràng các route, tránh trùng lặp
export default [
  index("routes/home.tsx"),
] satisfies RouteConfig;
