const passport = require('passport'); // Para implementar la estrategia.
const axios = require('axios'); // Para la peticion a movie-api.
const { Strategy: LinkedInStrategy} = require('passport-linkedin-oauth2'); // Estrategia a usar.
const boom = require('@hapi/boom'); // Para el manejo de errores.
const { get } = require('lodash');

// Variables de entorno.
const { config } = require('../../../config');

passport.use(new LinkedInStrategy({
  clientID: config.linkedinClientId,
  clientSecret: config.linkedinClientSecret,
  callbackURL: "/auth/linkedin/callback", // ruta para que google nos envie los datos.
}, async function(accessToken, refreshToken, profile, done) {
  try {
    // Hacemos peticion para crear el user en la base de datos.
    // Y ademas crear el token.
    const { data, status } = await axios({
      url: `${config.apiUrl}/api/auth/sign-provider`,
      method: "post",
      data: { // Para que tenga la info del user.
        name: profile.displayName,
        email: get(profile, 'emails.0.value', `${profile.username}@linkedin.com`),
        password: profile.id,
        apiKeyToken: config.apiKeyToken,
      },
    });

    // Manejamos el error.
    if(!data || status !== 200){
      done(boom.unauthorized(), false);
    }

    // Si todo esta bien enviamos la data.
    done(null, data);
  } catch (error) {
    done(error);
  }
}));