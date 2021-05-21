const passport = require('passport'); // Para implementar la estrategia.
const { OAuth2Strategy: GoogleStrategy } = require('passport-google-oauth'); // La estrategia de google directamente.
const axios = require('axios'); // Para hacer request a la api-server.
const boom = require('@hapi/boom'); // Manejo de errores.

// Para las variables de entorno.
const { config } = require('../../../config');

// Implementamos la estrategia.
// En este caso no necesitamos definir las variables con las rutas de google para
// pedir info del user ni nada ya que vienen en la estrategia.
// Solo necesitamos las credenciales que creamos en la api de google.
passport.use(new GoogleStrategy({
    clientID: config.googleClientId,
    clientSecret: config.googleClientSecret,
    callbackURL: "/auth/google/callback", // ruta para que google nos envie los datos.
  },
  async function(accessToken, refreshToken, { _json: profile }, done) {
    try{
      // Hacemos una peticion a la api-server (movies-api) para que cree o busque el user.
      // con esta peticion tambien creamos el JWT.
      const { data, status } = await axios({
          url: `${config.apiUrl}/api/auth/sign-provider`,
          method: "post",
          data: { // Para que tenga la info del user.
              name: profile.name,
              email: profile.email,
              password: profile.sub,
              apiKeyToken: config.apiKeyToken,
          },
      });

      // Manejamos el error.
      if(!data || status !== 200){
          done(boom.unauthorized(), false);
      }

      done(null, data);
    }catch(err){
      done(err);
    }
  }
));