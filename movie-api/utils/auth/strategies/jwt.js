const passport = require('passport'); // Para implementar la estrategia.
const { Stretegy, ExtractJwt } = require('passport-jwt'); // La estrategia.
const boom = require('@hapi/boom'); // Para el manejo de errores.

// Los servicios para buscar usuarios en la base de datos.
const UsersService = require('../../../services/users');
const { config } = require('../../../config');

passport.use(
  new Stretegy({ // Implementamos la estrategia.
    secretOrKey: config.authJWTSecret, // Este es el secrect que tenemos en .env con el que generamos los tokens.
    // Con esto le decimos a la estrategia que saque el jwt del header.
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  },
  async function(tokenPayload, cb) { // El tokenPayload entiendo que lo pasa la estrategia cuado verifica si el secret coincide.
    // Instanciamos los servicios para buscar el user.
    const usersService = new UsersService();

    try {
      // Buscamos el user a traves de email que nos da el jwt cuando lo decodificamos gracias a la estrategia.
      const user = await usersService.getUser({ email: tokenPayload.email });

      // Si el user no esta entonces retornamos un error con ayuda de boom.
      if (!user) {
        return cb(boom.unauthorized(), false);
      }

      // Eliminamos la contraseña del usuario para que esta no sea vista.
      delete user.password;

      // retosnamos un objeto con todo lo del user mas el scope que da el token.
      // Pienzo que esto es lo que hicimos con admin y user en la clase de los scripts.
      // Esto esta en la carpeta script.
      cb(null, {...user, scopes: tokenPayload.scopes });
    } catch(err) {
      return cb(err); // manejamos el error.
    }
  })
);