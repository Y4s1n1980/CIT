// tools/formatServiceAccountEnv.js
const fs = require("fs");

const raw = fs.readFileSync("./config/serviceAccountKey.json", "utf8");
const json = JSON.parse(raw);

// Escapar saltos reales a \\n
json.private_key = json.private_key.replace(/\n/g, "\\n");

// Copiar al portapapeles (opcional)
require("child_process").spawnSync("clip").stdin.end(JSON.stringify(json));

console.log("✅ Pegá este valor en Render env var FIREBASE_SERVICE_ACCOUNT 👇👇👇");
console.log(JSON.stringify(json));
