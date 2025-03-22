// tools/checkFirebaseKey.js
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../server/config/serviceAccountKey.json");

if (fs.existsSync(filePath)) {
  console.log("✅ serviceAccountKey.json ya existe. No se necesita regenerar.");
  process.exit(0);
}

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!raw) {
  console.error("❌ ERROR: La variable FIREBASE_SERVICE_ACCOUNT no está definida.");
  process.exit(1);
}

try {
  const json = JSON.parse(raw);
  if (json.private_key && typeof json.private_key === "string") {
    json.private_key = json.private_key.replace(/\\n/g, "\n");
  } else {
    throw new Error("Clave privada no válida");
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
  console.log("✅ serviceAccountKey.json creado exitosamente.");
} catch (err) {
  console.error("❌ ERROR al procesar FIREBASE_SERVICE_ACCOUNT:", err.message);
  process.exit(1);
}
