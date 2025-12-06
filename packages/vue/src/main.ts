import "./main.css";

import { dom, library } from "@fortawesome/fontawesome-svg-core";
import { faVuejs } from "@fortawesome/free-brands-svg-icons";
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";

const app = createApp(App);
app.use(router);
app.mount("#app");

dom.watch();
library.add(faVuejs);
