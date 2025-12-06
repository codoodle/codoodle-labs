import "./main.css";

import { dom, library } from "@fortawesome/fontawesome-svg-core";
import { faIceCream } from "@fortawesome/free-solid-svg-icons";

dom.watch();
library.add(faIceCream);

console.log("Vanilla package loaded");
