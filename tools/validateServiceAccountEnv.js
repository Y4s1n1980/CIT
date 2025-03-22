// tools/validateServiceAccountEnv.js
const fs = require("fs");

function validateFirebaseServiceEnv(rawJson) {
  try {
    const parsed = JSON.parse(rawJson);

    if (!parsed.private_key) throw new Error("Falta private_key");
    if (!parsed.private_key.startsWith("-----BEGIN PRIVATE KEY-----\\n")) {
      throw new Error("private_key no tiene el formato correcto (falta BEGIN)");
    }
    if (!parsed.private_key.endsWith("\\n-----END PRIVATE KEY-----\\n")) {
      throw new Error("private_key no tiene el formato correcto (falta END)");
    }

    console.log("\u2705 FIREBASE_SERVICE_ACCOUNT es válido. Clave en formato correcto.");
    return true;
  } catch (error) {
    console.error("\u274C ERROR en FIREBASE_SERVICE_ACCOUNT:", error.message);
    return false;
  }
}

if (require.main === module) {
  const envPath = "server/.env";
  if (!fs.existsSync(envPath)) {
    console.error("\u274C No se encontró server/.env");
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT\s*=\s*(\{[\s\S]*?\})/);
  if (!match) {
    console.error("\u274C FIREBASE_SERVICE_ACCOUNT no está definido o mal formado en server/.env");
    process.exit(1);
  }

  const jsonRaw = match[1];
  const ok = validateFirebaseServiceEnv(jsonRaw);
  if (!ok) process.exit(1);
}

module.exports = validateFirebaseServiceEnv;
