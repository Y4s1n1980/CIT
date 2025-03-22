// tools/formatServiceAccountEnv.js
const fs = require('fs');
const raw = fs.readFileSync('./config/serviceAccountKey.json', 'utf8');
const json = JSON.parse(raw);
json.private_key = json.private_key.replace(/\n/g, '\\n');
console.log(JSON.stringify(json, null, 2));
