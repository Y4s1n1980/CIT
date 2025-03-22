// tools/validateEnvVars.js

function validateRequiredEnvVars(vars = []) {
    const missing = [];
  
    for (const name of vars) {
      if (!process.env[name]) {
        console.warn(`⚠️ Falta la variable de entorno: ${name}`);
        missing.push(name);
      }
    }
  
    if (missing.length) {
      console.error(`\u274C Variables faltantes: ${missing.join(", ")}`);
      return false;
    }
  
    return true;
  }
  
  module.exports = { validateRequiredEnvVars };
  