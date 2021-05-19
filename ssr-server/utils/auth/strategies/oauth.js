const passport = require('passport'); // Para usar estrategia.
const axios = require('axios'); // Para hacer un request.
const boom = require('@hapi/boom'); // Para errores.
const { OAuth2Strategy } = require('passport-oauth'); // Para la estrategia de oauth 2.0.

// Para las variables de entorno.
const { config } = require('../../../config');

// Estas estan en la documentacion de google de OAuth 2.0.
const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token';
const GOOGLE_URSERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

const oAuth2Strategy = new OAuth2Strategy({ // Seria como el encabezado de la estrategia. O seteamos variables.
  authorizationURL: GOOGLE_AUTHORIZATION_URL,
  tokenURL: GOOGLE_TOKEN_URL,
  clientID: config.googleClientId,
  clientSecret: config.googleClientSecret,
  callbackURL: '/auth/google-oauth/callback',
}, 
// Profile se supone que nos lo envia google. De esta manera obtenemos los datos necesarios.
// Mas adelante implementamos como obtener los datos de google/profile.
async function(accessToken, refreshToken, profile, cb) {
  const { data, status } = await axios({ // Para enviar los datos a la api-server y logear al user.
    url: `${config.apiUrl}/api/auth/sign-provider`,
    method: 'post',
    data: {
      name: profile.name,
      email: profile.email,
      password: profile.id,
      apiKeyToken: config.apiKeyToken,
    },
  });

  // Si todo esta bien, verificamos que haya datos y sea estatus 200.
  if (!data || status !== 200) {
    return cb(boom.unauthorized(), false);
  }

  // Si sale bien retornamos la data.
  return cb(null, data);
});

// Implementamos como oauth define el profile.
oAuth2Strategy.userProfile = function(accessToken, done) {
  // Con esto hacemos una peticion a la pagina de google para que nos de la info del profile.
  this._oauth2.get(GOOGLE_URSERINFO_URL, accessToken, (err, body) => {
    if (err) { // Manejamos errores.
      return done(err);
    }

    try {
      // Obtenemos los datos que llegan al body si google los envia.
      const { sub, name, email } = JSON.parse(body);

      // Los asignamos a la variable profile.
      const profile = {
        id: sub,
        name,
        email,
      }

      // Retornamos el profile si todo esta bien.
      done(null, profile);
    } catch (parseEerror) { // Manejamos errores.
      return done(parseEerror);
    }
  });
}

// Implementamos la estrategia, o la nombramos o la establecemos.
// Esto va como si fuera un middleware.
passport.use('google-oauth', oAuth2Strategy);