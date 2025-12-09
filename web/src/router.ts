import { createWebHashHistory, createRouter } from "vue-router";

const routes = [
  { path: "/", component: () => import("./components/home.vue") },
  { path: "/about", component: () => import("./components/about.vue") },
];

export default createRouter({
  history: createWebHashHistory("/static/"),
  routes,
});
