import "./main.css";

import { dom, library } from "@fortawesome/fontawesome-svg-core";
import { faReact } from "@fortawesome/free-brands-svg-icons";
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
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { routeTree } from "./routeTree.gen";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const router = createRouter({ routeTree });
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

dom.watch();
library.add(
  faReact,
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
