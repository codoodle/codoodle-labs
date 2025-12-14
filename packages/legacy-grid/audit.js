import { parse } from "@typescript-eslint/typescript-estree";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const EXTENSIONS = new Set([".js", ".ts"]);
const REGEX_REVIEW_RULES = [
  // --- 네트워크 API ---
  { label: "fetch identifier", regex: /\bfetch\b/ },
  { label: "XMLHttpRequest identifier", regex: /\bXMLHttpRequest\b/ },
  { label: "WebSocket identifier", regex: /\bWebSocket\b/ },
  { label: "EventSource identifier", regex: /\bEventSource\b/ },
  { label: "sendBeacon identifier", regex: /\bsendBeacon\b/ },
  { label: "RTCPeerConnection", regex: /RTCPeerConnection/ },
  { label: "RTCDataChannel", regex: /RTCDataChannel/ },
  { label: "indexedDB", regex: /\bindexedDB\b/ },
  { label: "openDatabase", regex: /openDatabase/ },
  { label: "caches API", regex: /\bcaches\b/ },
  { label: "BroadcastChannel", regex: /\bBroadcastChannel\b/ },
  { label: "MessageChannel", regex: /\bMessageChannel\b/ },

  // --- DOM 생성/조작 ---
  { label: "new Image()", regex: /new\s+Image\s*\(/ },
  { label: "createElement", regex: /\bcreateElement\b/ },
  { label: "setAttribute", regex: /\bsetAttribute\b/ },
  { label: "setAttributeNS", regex: /\bsetAttributeNS\b/ },
  { label: "innerHTML assignment", regex: /\binnerHTML\b\s*=/ },
  { label: "outerHTML assignment", regex: /\bouterHTML\b\s*=/ },
  { label: "innerText assignment", regex: /\binnerText\b\s*=/ },
  { label: "textContent assignment", regex: /\btextContent\b\s*=/ },
  { label: "write", regex: /\bwrite\b/ },
  { label: "insertAdjacentHTML", regex: /\binsertAdjacentHTML\b/ },
  { label: "appendChild", regex: /\bappendChild\b/ },
  { label: "removeChild", regex: /\bremoveChild\b/ },
  { label: "replaceChild", regex: /\breplaceChild\b/ },

  // --- DOM 네트워크 관련 ---
  { label: "src", regex: /\bsrc\b/ },
  { label: "href", regex: /\bhref\b/ },
  { label: "iframe", regex: /\biframe\b/ },
  { label: "script", regex: /\bscript\b/ },
  { label: "form", regex: /\bform\b/ },
  { label: "link", regex: /\blink\b/ },
  { label: "style", regex: /\bstyle\b/ },

  // --- 보안/코드실행 ---
  { label: "eval", regex: /\beval\b/ },
  { label: "new Function", regex: /new\s+Function\b/ },
  { label: "with statement", regex: /\bwith\s*\(/ },
  { label: "setTimeout/setInterval string literal", regex: /\b(setTimeout|setInterval)\s*\(\s*['"`]/, },
  { label: "atob identifier", regex: /\batob\b/ },
  { label: "btoa identifier", regex: /\bbtoa\b/ },
  { label: "Worker", regex: /\bWorker\b/ },
  { label: "__proto__ access", regex: /__proto__/ },
  { label: "javascript: protocol", regex: /javascript\s*:/i },
  { label: "data: URL", regex: /data:[^,]*,/i },
  { label: "blob: URL", regex: /blob:/i },

  // --- 글로벌 객체/저장소 ---
  { label: "document identifier", regex: /\bdocument\b/ },
  { label: "window identifier", regex: /\bwindow\b/ },
  { label: "location.search/hash", regex: /\blocation\.(search|hash)\b/ },
  { label: "localStorage/sessionStorage", regex: /\b(local|session)Storage\b/ },
  { label: "document.cookie access", regex: /\bdocument\.cookie\b/ },
  { label: "postMessage identifier", regex: /\bpostMessage\b/ },

  // --- 기타 ---
  { label: "dynamic import keyword", regex: /\bimport\s*\(/ },
  { label: "http/https literal", regex: /https?:\/\// },
];

const confirmed = new Set();
const reviewRequired = new Set();

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

function analyzeAST(code) {
  const ast = parse(code, { sourceType: "module" });

  function visit(node) {
    if (!node || typeof node !== "object") {
      return;
    }

    // === 네트워크 API ===
    if (
      node.type === "CallExpression" &&
      node.callee?.type === "Identifier" &&
      node.callee.name === "fetch"
    ) {
      confirmed.add("fetch");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.name === "fetch" &&
      node.callee.object?.type === "Identifier" &&
      (node.callee.object.name === "window" || node.callee.object.name === "globalThis")
    ) {
      confirmed.add("fetch");
    }

    if (
      node.type === "NewExpression" &&
      node.callee?.type === "Identifier" &&
      node.callee.name === "XMLHttpRequest"
    ) {
      confirmed.add("XMLHttpRequest");
    }

    if (
      node.type === "NewExpression" &&
      node.callee?.type === "Identifier" &&
      node.callee.name === "WebSocket"
    ) {
      confirmed.add("WebSocket");
    }

    if (
      node.type === "NewExpression" &&
      node.callee?.type === "Identifier" &&
      node.callee.name === "EventSource"
    ) {
      confirmed.add("EventSource");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.object?.name === "navigator" &&
      node.callee.property?.name === "sendBeacon"
    ) {
      confirmed.add("sendBeacon");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.name === "sendBeacon" &&
      node.callee.object?.type === "MemberExpression" &&
      node.callee.object.property?.name === "navigator" &&
      node.callee.object.object?.type === "Identifier" &&
      (node.callee.object.object.name === "window" ||
       node.callee.object.object.name === "globalThis")
    ) {
      confirmed.add("sendBeacon");
    }

    if (
      node.type === "NewExpression" &&
      node.callee?.type === "Identifier" &&
      node.callee.name === "RTCPeerConnection"
    ) {
      confirmed.add("RTCPeerConnection");
    }

    if (
      node.type === "NewExpression" &&
      node.callee?.type === "Identifier" &&
      node.callee.name === "RTCDataChannel"
    ) {
      confirmed.add("RTCDataChannel");
    }

    if (
      node.type === "NewExpression" &&
      node.callee?.type === "Identifier" &&
      node.callee.name === "BroadcastChannel"
    ) {
      confirmed.add("BroadcastChannel");
    }

    if (
      node.type === "NewExpression" &&
      node.callee?.type === "Identifier" &&
      node.callee.name === "MessageChannel"
    ) {
      confirmed.add("MessageChannel");
    }

    if (
      node.type === "MemberExpression" &&
      node.object?.type === "Identifier" &&
      node.object.name === "indexedDB"
    ) {
      reviewRequired.add("indexedDB");
    }

    if (
      node.type === "MemberExpression" &&
      node.object?.type === "Identifier" &&
      node.object.name === "caches"
    ) {
      reviewRequired.add("caches API");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "Identifier" &&
      node.callee.name === "openDatabase"
    ) {
      reviewRequired.add("openDatabase");
    }

    // === DOM 생성/조작 ===
    if (
      node.type === "NewExpression" &&
      node.callee?.type === "Identifier" &&
      node.callee.name === "Image"
    ) {
      confirmed.add("DOM new Image");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "createElement"
    ) {
      reviewRequired.add("DOM createElement");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "createElementNS"
    ) {
      reviewRequired.add("DOM createElementNS");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "setAttribute"
    ) {
      reviewRequired.add("DOM setAttribute");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "setAttributeNS"
    ) {
      reviewRequired.add("DOM setAttributeNS");
    }

    if (
      node.type === "AssignmentExpression" &&
      node.left?.type === "MemberExpression" &&
      node.left.property?.type === "Identifier" &&
      node.left.property.name === "innerHTML"
    ) {
      confirmed.add("DOM innerHTML assignment");
    }

    if (
      node.type === "AssignmentExpression" &&
      node.left?.type === "MemberExpression" &&
      node.left.property?.type === "Identifier" &&
      node.left.property.name === "outerHTML"
    ) {
      confirmed.add("DOM outerHTML assignment");
    }

    if (
      node.type === "AssignmentExpression" &&
      node.left?.type === "MemberExpression" &&
      node.left.property?.type === "Identifier" &&
      node.left.property.name === "textContent"
    ) {
      reviewRequired.add("DOM textContent assignment");
    }

    if (
      node.type === "AssignmentExpression" &&
      node.left?.type === "MemberExpression" &&
      node.left.property?.type === "Identifier" &&
      node.left.property.name === "innerText"
    ) {
      reviewRequired.add("DOM innerText assignment");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.object?.type === "Identifier" &&
      node.callee.object.name === "document" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "write"
    ) {
      confirmed.add("DOM document.write");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.name === "write" &&
      node.callee.object?.type === "MemberExpression" &&
      node.callee.object.property?.name === "document" &&
      node.callee.object.object?.type === "Identifier" &&
      (node.callee.object.object.name === "window" ||
       node.callee.object.object.name === "globalThis")
    ) {
      confirmed.add("DOM document.write");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.object?.type === "Identifier" &&
      node.callee.object.name === "document" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "writeln"
    ) {
      confirmed.add("DOM document.writeln");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.name === "writeln" &&
      node.callee.object?.type === "MemberExpression" &&
      node.callee.object.property?.name === "document" &&
      node.callee.object.object?.type === "Identifier" &&
      (node.callee.object.object.name === "window" ||
       node.callee.object.object.name === "globalThis")
    ) {
      confirmed.add("DOM document.writeln");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "insertAdjacentHTML"
    ) {
      confirmed.add("DOM insertAdjacentHTML");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "appendChild"
    ) {
      reviewRequired.add("DOM appendChild");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "removeChild"
    ) {
      reviewRequired.add("DOM removeChild");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "replaceChild"
    ) {
      reviewRequired.add("DOM replaceChild");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "insertBefore"
    ) {
      reviewRequired.add("DOM insertBefore");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "replaceWith"
    ) {
      reviewRequired.add("DOM replaceWith");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "remove"
    ) {
      reviewRequired.add("DOM remove");
    }

    // === DOM 네트워크 관련 ===
    if (
      node.type === "AssignmentExpression" &&
      node.left?.type === "MemberExpression" &&
      node.left.property?.type === "Identifier" &&
      node.left.property.name === "src"
    ) {
      reviewRequired.add("DOM src assignment");
    }

    if (
      node.type === "AssignmentExpression" &&
      node.left?.type === "MemberExpression" &&
      node.left.property?.type === "Identifier" &&
      node.left.property.name === "href"
    ) {
      reviewRequired.add("DOM href assignment");
    }

    // === 보안/코드실행 ===
    if (node.type === "CallExpression" && node.callee?.type === "Identifier") {
      if (node.callee.name === "eval") {
        confirmed.add("eval");
      }
    }

    if (
      node.type === "NewExpression" &&
      node.callee?.type === "Identifier" &&
      node.callee.name === "Function"
    ) {
      confirmed.add("new Function");
    }

    if (node.type === "WithStatement") {
      confirmed.add("with statement");
    }

    if (node.type === "ImportExpression") {
      confirmed.add("dynamic import");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "Identifier" &&
      (node.callee.name === "setTimeout" || node.callee.name === "setInterval") &&
      node.arguments?.length > 0 &&
      (node.arguments[0].type === "Literal" ||
        node.arguments[0].type === "StringLiteral")
    ) {
      confirmed.add("setTimeout/setInterval string literal");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "Identifier" &&
      node.callee.name === "atob"
    ) {
      reviewRequired.add("atob");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "Identifier" &&
      node.callee.name === "btoa"
    ) {
      reviewRequired.add("btoa");
    }

    if (
      node.type === "NewExpression" &&
      node.callee?.type === "Identifier" &&
      node.callee.name === "Worker"
    ) {
      confirmed.add("Worker");
    }

    if (
      node.type === "MemberExpression" &&
      node.property?.type === "Identifier" &&
      node.property.name === "__proto__"
    ) {
      confirmed.add("__proto__ access");
    }

    // === 글로벌 객체/저장소 ===
    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.object?.type === "Identifier" &&
      node.callee.object.name === "window" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "open"
    ) {
      confirmed.add("window.open");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.name === "open" &&
      node.callee.object?.type === "MemberExpression" &&
      node.callee.object.property?.name === "window" &&
      node.callee.object.object?.type === "Identifier" &&
      node.callee.object.object.name === "globalThis"
    ) {
      confirmed.add("window.open");
    }

    if (
      node.type === "MemberExpression" &&
      node.object?.type === "Identifier" &&
      (node.object.name === "localStorage" ||
        node.object.name === "sessionStorage")
    ) {
      reviewRequired.add("localStorage/sessionStorage");
    }

    if (
      node.type === "MemberExpression" &&
      node.property?.type === "Identifier" &&
      (node.property.name === "localStorage" ||
       node.property.name === "sessionStorage") &&
      node.object?.type === "Identifier" &&
      (node.object.name === "window" || node.object.name === "globalThis")
    ) {
      reviewRequired.add("localStorage/sessionStorage");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "postMessage"
    ) {
      reviewRequired.add("postMessage");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "send"
    ) {
      reviewRequired.add("send");
    }

    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.property?.type === "Identifier" &&
      node.callee.property.name === "open"
    ) {
      reviewRequired.add("open");
    }

    for (const key in node) {
      const val = node[key];
      if (Array.isArray(val)) {
        val.forEach(visit);
      } else if (val && typeof val === "object") {
        visit(val);
      }
    }
  }

  visit(ast);
}

function analyzeRegex(code) {
  for (const rule of REGEX_REVIEW_RULES) {
    if (rule.regex.test(code)) {
      reviewRequired.add(rule.label);
    }
  }
}

const target = process.argv[2];
if (!target) {
  console.error("❌ Path required");
  process.exit(1);
}

const files = statSync(target).isDirectory() ? walk(target) : [target];
for (const file of files) {
  const code = readFileSync(file, "utf8");
  analyzeAST(code);
  analyzeRegex(code);

  console.log("\n--- Analysis Results ---");
  console.log(`File: ${relative(process.cwd(), file)}`);
  if (confirmed.size > 0) {
    console.log("❌ Confirmed Dangerous APIs:");
    confirmed.forEach((item) => console.log(`  - ${item}`));
  } else {
    console.log("✅ Confirmed Dangerous APIs: None found.");
  }

  if (reviewRequired.size > 0) {
    console.log("⚠️  Review Required (Potential Risks/APIs):");
    reviewRequired.forEach((item) => console.log(`  - ${item}`));
  } else {
    console.log("✅ Review Required: None found.");
  }

  confirmed.clear();
  reviewRequired.clear();
}
