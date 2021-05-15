require('dotenv').config(); // Para traer las variables de entorno.

// Definimos las variables de entrono en variables de js.
const config = {
  dev: process.env.NODE_ENV !== 'production',
  port: process.env.PORT || 8000,
  apiUrl: process.env.API_URL,
  apiKeyToken: process.env.API_KEY_TOKEN
};

module.exports = { config: config };