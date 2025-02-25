const sharp = require('sharp');
const fs = require('fs');

// Imagen de entrada (reemplázala con la tuya)
const inputImage = 'fachada-masjid-tordera.jpeg';

// Directorio de salida
const outputDir = 'icons';

// Crear directorio si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Tamaños necesarios
const sizes = [192, 512, 144, 72, 48];

sizes.forEach(size => {
  sharp(inputImage)
    .resize(size, size)
    .toFile(`${outputDir}/icon-${size}x${size}.png`, (err) => {
      if (err) {
        console.error(`❌ Error generando icono ${size}x${size}:`, err);
      } else {
        console.log(`✅ Icono ${size}x${size} generado.`);
      }
    });
});
