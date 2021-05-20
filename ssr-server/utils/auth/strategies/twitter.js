const passport = require('passport'); // Para implementar la estrategia.
const axios = require('axios'); // Para hacer peticiones a la api-server/movie-api.
const boom = require('@hapi/boom'); // Para menejo de errores.
const { get } = require('lodash'); // Para obtener un valor de un objeto sin problemas. Esta ya viene instalada con node.
const { Strategy: TwitterStrategy } = require('passport-twitter'); // La estrategia de twitter.

// Para las variables de entorno.
const { config } = require('../../../config');

passport.use(new TwitterStrategy({
  // Los 2 primeros parametros son requeridos ya que la estrategia no es OAuth 2.0.
  // Esta es auth 1.0, como la que hicimos de google por primera vez.
  consumerKey: config.twitterConsumerKey,
  consumerSecret: config.twitterConsumerSecret,
  callbackURL: '/auth/twitter/callback', // La ruta a la que nos enviaran la data del user.
  includeEmail: true, // Para que nos envie el email.
}, async function(token, tokenSecret, profile, cb) { // En profile nos envia la data.
  const { data, status } = await axios({ // Para hacer una peticion a la api-server cuando lleguen los datos.
    url: `${config.apiUrl}/api/auth/sign-provider`,
    method: 'post',
    data: {
      name: profile.displayName, // Nombre del user.
      // El email es porque primero buscamos dentro de profile en el campo emails el indice 0 en al campo value.
      // Luego si este no existe cree un email nuevo con el nombre de usuario y @twitter.com
      email: get(profile, 'emails.0.value', `${profile.username}@twitter.com`),
      password: `${profile.id}`, // Esta sera la contraseña.
      apiKeyToken: config.apiKeyToken, // Token para el scope.
    },
  });

  // Si no llegan datos manejamos el error.
  if (!data || status !== 200) {
    return cb(boom.unauthorized(), false);
  }

  // enviamos la data si todo esta bien.
  return cb(null, data);
}));