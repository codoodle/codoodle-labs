import "./main.css";

import { dom, library } from "@fortawesome/fontawesome-svg-core";
import { faVuejs } from "@fortawesome/free-brands-svg-icons";
import { faCirclePlay, faLightbulb } from "@fortawesome/free-regular-svg-icons";
import {
  faChartLine,
  faCircleCheck,
  faCirclePause,
  faClock,
  faFloppyDisk,
  faGear,
  faPenToSquare,
  faSatelliteDish,
} from "@fortawesome/free-solid-svg-icons";
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";

const app = createApp(App);
app.use(router);
app.mount("#app");

dom.watch();
library.add(
  faVuejs,
  faCirclePlay,
  faLightbulb,
  faSatelliteDish,
  faChartLine,
  faGear,
  faPenToSquare,
  faCirclePause,
  faFloppyDisk,
  faClock,
  faCircleCheck,
);
