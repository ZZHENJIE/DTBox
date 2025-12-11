import { createWebHashHistory, createRouter } from "vue-router";

const routes = [
  { path: "/", name: "home", component: () => import("../views/home.vue") },
  {
    path: "/about",
    name: "about",
    component: () => import("../views/about.vue"),
  },
  {
    path: "/calendar/ipo/iposcoop",
    name: "ipo_iposcoop",
    component: () => import("../views/calendar/ipo/iposcoop.vue"),
  },
  {
    path: "/calendar/economy/finviz",
    name: "economy_finviz",
    component: () => import("../views/calendar/economy/finviz.vue"),
  },
  {
    path: "/calendar/spac/research",
    name: "spac_research",
    component: () => import("../views/calendar/spac/research.vue"),
  },
  {
    path: "/screener/finviz/query",
    name: "screener_finviz_query",
    component: () => import("../views/screener/finviz/query.vue"),
  },
  {
    path: "/screener/finviz/result",
    name: "screener_finviz_result",
    component: () => import("../views/screener/finviz/result.vue"),
  },
  {
    path: "/screener/finviz/script",
    name: "screener_finviz_script",
    component: () => import("../views/screener/finviz/script.vue"),
  },
  {
    path: "/experimental/chart",
    name: "experimental_chart",
    component: () => import("../views/experimental/chart.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not_found",
    component: () => import("../views/not_found.vue"),
  },
];

export default createRouter({
  history: createWebHashHistory("/static/"),
  routes,
});
