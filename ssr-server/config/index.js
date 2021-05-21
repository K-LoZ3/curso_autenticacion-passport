require('dotenv').config(); // Para traer las variables de entorno.

// Definimos las variables de entrono en variables de js.
const config = {
  dev: process.env.NODE_ENV !== 'production',
  port: process.env.PORT || 8000,
  apiUrl: process.env.API_URL,
  apiKeyToken: process.env.API_KEY_TOKEN,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  sessionSecret: process.env.SESSION_SECRET,
  twitterConsumerKey: process.env.TWITTER_CONSUMER_KEY,
  twitterConsumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  twitterBearerToken: process.env.TWITTER_BEARER_TOKEN,
  linkedinClientId: process.env.LINKEDIN_CLIENT_ID,
  linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET,
};

module.exports = { config: config };