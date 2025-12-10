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
    path: "/:pathMatch(.*)*",
    name: "not_found",
    component: () => import("../views/not_found.vue"),
  },
];

export default createRouter({
  history: createWebHashHistory("/static/"),
  routes,
});
