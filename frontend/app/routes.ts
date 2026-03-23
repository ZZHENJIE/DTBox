import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home/index.tsx"),
  route("about", "routes/about/index.tsx"),
  route("profile", "routes/profile/index.tsx"),
  route("no-permission", "routes/no_permission/index.tsx"),
  route("calendar/economy/finviz", "routes/calendar/economy/finviz/index.tsx"),
  route("calendar/ipo/scoop", "routes/calendar/ipo/scoop/index.tsx"),
  route("calendar/spac/research", "routes/calendar/spac/research/index.tsx"),
  route("screener/finviz", "routes/screener/finviz/index.tsx"),
] satisfies RouteConfig;
