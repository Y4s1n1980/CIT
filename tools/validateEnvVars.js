// tools/validateEnvVars.js
// tools/validateEnvVars.js

module.exports = function validateRequiredEnvVars(required = []) {
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.warn("⚠️ Variables de entorno faltantes:");
    missing.forEach(key => console.warn(`❌ ${key}`));
    if (process.env.NODE_ENV === 'production') process.exit(1);
  } else {
    console.log("✅ Todas las variables requeridas están definidas.");
  }
};

  