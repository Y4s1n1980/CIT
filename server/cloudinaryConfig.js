// server/cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // Tu cloud_name de Cloudinary
  api_key: process.env.CLOUDINARY_API_KEY,        // Tu api_key de Cloudinary
  api_secret: process.env.CLOUDINARY_API_SECRET,  // Tu api_secret de Cloudinary
});

module.exports = cloudinary;

