// server/prepareFirebaseAdmin.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../config/serviceAccountKey.json');

if (!fs.existsSync(filePath)) {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) {
      throw new Error("❌ Variable FIREBASE_SERVICE_ACCOUNT no definida");
    }

    const json = JSON.parse(raw);

    if (typeof json.private_key !== 'string') {
      throw new Error("❌ Clave privada no válida");
    }

    json.private_key = json.private_key.replace(/\\n/g, '\n');

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
    console.log("✅ serviceAccountKey.json generado en tiempo de ejecución");
  } catch (err) {
    console.error("🚨 Error preparando Firebase Admin:", err.message);
    process.exit(1);
  }
}

require('./index.js');
