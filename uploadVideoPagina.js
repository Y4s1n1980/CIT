const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const upload = async () => {
  const filePath = path.join(__dirname, 'client', 'public', 'videos', 'video-pagina.mp4');

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  try {
    const response = await axios.post('https://cit-backend-iuqy.onrender.com/upload', form, {
      headers: form.getHeaders(),
    });

    console.log('✅ Video subido con éxito:');
    console.log(response.data);
  } catch (error) {
    console.error('❌ Error al subir el video:', error.response?.data || error.message);
  }
};

upload();
