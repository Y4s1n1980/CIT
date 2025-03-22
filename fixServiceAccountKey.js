const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "config/serviceAccountKey.json");

try {
    // 🔧 Crea el directorio si no existe
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!raw) throw new Error("La variable FIREBASE_SERVICE_ACCOUNT no está definida");

    const json = JSON.parse(raw);

    if (json.private_key) {
        json.private_key = json.private_key.replace(/\\n/g, '\n');
    }

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
    console.log("\u2705 Clave privada corregida y archivo creado en:", filePath);
} catch (error) {
    console.error("\u274C Error procesando el archivo:", error.message);
    process.exit(1);
}

