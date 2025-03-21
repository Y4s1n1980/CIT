const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "config/serviceAccountKey.json");

try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(raw);

    if (json.private_key) {
        json.private_key = json.private_key.replace(/\\n/g, '\n');
    }

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
    console.log("✅ Clave privada corregida con saltos de línea reales en serviceAccountKey.json");
} catch (error) {
    console.error("❌ Error procesando el archivo:", error.message);
}
