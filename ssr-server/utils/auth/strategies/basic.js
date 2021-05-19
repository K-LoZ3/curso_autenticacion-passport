const passport = require('passport'); // Para implementar la estrategia.
const { BasicStrategy } = require('passport-http'); // La estrategia.
const boom = require('@hapi/boom'); // Para manejar errores.
const axios = require('axios'); // Para hacer peticiones/request a otros servidores.
// Para este caso a la api-server.
const { config } = require('../../../config/index'); // Para las variables de entorno.

// Implementamos la estrategia.
passport.use(
  // Configuramos/definimos la estrategia.
  new BasicStrategy(async function(email, password, cb) {
    try {
      // Usamos axios para obtener la data y el status de la ruta que definimos
      // en el objeto que pasamos a axios.
      // Este objeto debe tener la info de la peticion (Url, Method, auth porque usa barer token,
      // data porque necesita el apiKeyToken que pasamos por body normalmente).
      const { data, status } = await axios({
        url: `${config.apiUrl}/api/auth/sign-in`,
        method: 'post',
        auth: {
          password,
          username: email,
        },
        data: {
          apiKeyToken: config.apiKeyToken,
        },
      });

      // Verificamos que estos sean correctos.
      if (!data || status !== 200) {
        return cb(boom.unauthorized(), false);
      }

      // Si son correctos llamamos al siguiente middleware.
      return cb(null, data);
    } catch (error) {
      cb(error);
    }
  })
);