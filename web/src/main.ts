import { createApp } from "vue";
import "./assets/style.css";
import App from "./App.vue";
import router from "./utils/router";
import "vfonts/OpenSans.css";

const app = createApp(App);
app.use(router);
app.mount("#app");
