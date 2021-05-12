const passport = require('passport'); // Para la estrategia passport.
const { BasicStrategy } = require('passport-http'); // La estrategia.
const boom = require('@hapi/boom'); // Para el manejo de errores.
const bcrypt = require('bcrypt'); // Para verificar si el password es el mismo que el de la base de datos.

// Los servicios del usuario para buscarlos en la base de datos y poder compararlos.
const UsersService = require('../../../services/users');

// Implementamos la estrategia.
passport.use(new BasicStrategy(async function(email, password, cb) {
  // Instanciamos los servicios para consultar los usuarios en la base de datos.
  const userServices = new UsersService();

  try {
    // Buscamos el usuario buscandolo con el email.
    const user = await userServices.getUser({ email });

    // Si el user no existe retornamos un error con ayuda de boom.
    // y false para decirle que el user no existe.
    if (!user) {
      return cb(boom.unauthorized(), false);
    }

    // Con becrypt comparamos el passwrod con el que tiene el user en la base de datos.
    // Si no es asi mandamos un error con false.
    if (!(await bcrypt.compare(password, user.password))) {
      return cb(boom.unauthorized(), false);
    }

    // Eliminamos el pasword del objeto user que nos devolvio la base de datos
    // para que no permanesca y se pueda ver.
    delete user.password;

    // Si todo sale bien llega hasta esta linea y retornamos un false para el error y
    // el usuario sin la contraseña.
    return cb(null, user);
  } catch (err) {
    return cb(err); // manejamos el error.
  }
}));