const express = require('express'); // Para poder usar un router en las rutas.
const passport = require('passport'); // Para usar la estrategia.
const boom = require('@hapi/boom'); // Para el manejo de errores.
const jwt = require('jsonwebtoken'); // Para el manejo de jwt. Crearlo en este caso.
const ApiKeysService = require('../services/apiKeys'); // Para buscar el alcance que tendra cada usuario
// Esto porque en la base de datos tenemos los alcances que tendra cada tipo de user.
const UsersService = require('../services/users'); // Para crear los usuarios.
const validationHandler = require('../utils/middleware/validationHandler'); // Para validar que el objeto que pasemos para
// crear el usuario concuerde con el schema.

const { createUserSchema, createProviderUserSchema } = require('../utils/schemas/users');

// Para obtener el secret con el que firmaremos el token.
const { config } = require('../config');

// Basic strategy
require('../utils/auth/strategies/basic');
// Esto es para usar la estrategia basic.
// Con esto no tenemos que ejecutar nada es como poner
// passport.use(); y dentro el meddelware que creamos en basic.js.
// De esta manera validamos el usuario y la contraseña sin necesida de
// llamar la funcion porque passport ya tiene el middleware puesto.

// Creamos la funcion para el manejo de la ruta.
function authApi(app) {
  const router = express.Router(); // Creamos el router.
  app.use('/api/auth', router);

  // Instanciamos los servicios para buscar el scope que daremos al user.
  const apiKeysService = new ApiKeysService();
  // Instanciamos los servicios para buscar y crear usuarios.
  const usersService = new UsersService();

  // creamos el endpoint para hacer post del user. Esto para crear el jwt.
  router.post('/sign-in', async function(req, res, next) {
    // Esto porque del body obtendremos el token de que topo de alcanse tendra.
    // En las variables de entrono estan como PUBLIC_API_KEY_TOKEN= y ADMIN_API_KEY_TOKEN=
    // Esto tambien esta en la base de datos en la colleccion de api-keys.
    // Imagino que de momentos se pasan a travez del body y luego se cambiera la metodologia
    // en la que le damos scope a los users.
    const { apiKeyToken } = req.body;

    // Si este no existe retornamos un error y notificamos porque es ese error.
    if (!apiKeyToken) {
      next(boom.unauthorized('apiKeyToken is required'));
    }

    // Implementamos passport con la estrategia basic que imagino es la que importamos sin
    // variable, y la pasamos como string.
    passport.authenticate('basic', function(error, user) {
      // Lo primero que hace es buscar el user a traves de auth en la peticion.
      // Esto se ve mas adelante cuando hacemos la prueba.
      // *************************************************
      //Explicacion de la prueba al final de este archivo.
      try {
        // Si hay error o no existe el usuario entonces lo manejamos.
        if (error || !user) {
          next(boom.unauthorized());
        }

        // Si sale bien entonces usamos esta funcion para el login. Login viene de passport
        // este le dal al req esta funcion cuando se implementa.
        // Con session: false le decimos que no queremos que mantenga la session activa.
        // Creo que con esto ejecutamos la implementacion de passport como estrategia.
        req.login(user, { session: false }, async function(error) {
          // Si esto genera error lo manejamos.
          if (error) {
            next(error);
          }

          // Buscamos el scope que corresponde al token que le pasamos desde el body.
          const apiKey = await apiKeysService.getApiKey({ token: apiKeyToken });

          // Si este no existe, entonces manejamos el error.
          if (!apiKey) {
            next(boom.unauthorized());
          }

          // Si esto esta bien sacamos unos datos del user.
          const { _id: id, name, email } = user;

          // Con esos datos del user creamos un payload para de esta manera
          // firmar el jwt.
          const payload = {
            sub: id,
            name,
            email,
            scopes: apiKey.scopes, // Estos son los scope que vienen del apiToken que
            // encontramos en los servicios de api-keys.
          }

          // Creamos el jwt con este payload, el sicret que tenemos en .env y un objeto
          // que dice que este token expira en 15 minutos.
          const token = jwt.sign(payload, config.authJWTSecret, {
            expiresIn: '15m',
          });

          // Retornamos el token y el user con solo 3 datos.
          return res.status(200).json({ token, user: { id, name, email }});
        });
      } catch (error) {
        next(error); // Manejamos el error si lo hay.
      }
    })(req, res, next); // Esto es porque .authenticate es un custon callback.
    // Entonces debemos hacer un clousure con la firma de la ruta.
    // De esta manera nos aseguramos que el .authenticate y custom callback funcione sin problemas.
  });

  // Creamos la ruta para crear usuarios.
  // Validamos que lo que tiene el body si cumple con el schema para crear usuarios.
  router.post('/sign-up', validationHandler(createUserSchema), async function(req, res, next) {
    // Sacamos del body el usuario.
    const { body: user } = req;

    try {
      // Buscamos si el usuario ya esta en la base de datos.
      const userExists = await usersService.getUser(user);

      // Si este existe retornamos un error.
      if(userExists) {
        res.status(409).json({
          message: 'user registred',
        });
        return; // Para que no continue el flujo normal del programa.
      }

      // Creamos el usuario con los servicios de user.
      const createdUserId = await usersService.createUser({ user });

      // Devolvemos el userId que nos da mongoDB mas un mensaje.
      res.status(201).json({
        data: createdUserId,
        message: 'user created',
      });
    } catch (error) {
      next(error); // Manejamos el error.
    }
  });

  // Con esta ruta logeamos al user o creamos el user.
  router.post('/sign-provider', validationHandler(createProviderUserSchema), async function(req, res, next) {
    const { body } = req; // Obtenemos el body con la info que nos envia google ya que en este punto
    // la estrategia oauth 2.0 ya se ejecuto.

    const { apiKeyToken, ...user } = body; // El user y el token para el scope.

    // Si este no esta manejamos el error.
    if(!apiKeyToken) {
      next(boom.unauthorized('apiKeyToken is required'));
    }

    try {
      // Cremaos o buscamos el user en la base de datos.
      const queriedUser = await usersService.getOrCreateUser({ user });
      // Buscamos el alcance que tendra, scopes.
      const apiKey = await apiKeysService.getApiKey({ token: apiKeyToken });

      // Si no existe manejamos el error.
      if (!apiKey) {
        next(boom.unauthorized());
      }

      // Obtenemos el id y demas cosas del user.
      const { _id: id, name, email } = queriedUser;

      // Lo ponemos en el payload para crear el JWT.
      const payload = {
        sub: id,
        name,
        email,
        scopes: apiKey.scopes,
      }

      // Creamos el JWT.
      const token = jwt.sign(payload, config.authJWTSecret, {
        expiresIn: '15m',
      });

      // Si todo esta bien mostramos el token con el user.
      return res.status(200).json({ token, user: { id, name, email }});
    } catch (error) {
      next(error);
    }
  })
}

module.exports = authApi;

// ********************************************************
/* 
  Para comprobar si funciona, vamos a postman y hacemos una peticion tipo POST
  en esta usamos la ruta para sign-in: http://localhost:3000/api/auth/sign-in.
  Ademas debemos pasarle en el body el token que define el scope que tendra,
  esto es porque hemos configurado en la linea 'const { apiKeyToken } = req.body;'.
  De momento el token para definir el scope se consigue asi. Este token de momento
  lo tenemos en .env como PUBLIC_API_KEY_TOKEN o ADMIN_API_KEY_TOKEN, ademas de que
  esta en la base de datos como un identificador mas los datos que dicen cual es el
  alcance que tendra este.
  Tambien en autorizacion en el tipo escogemos 'basic auth' para decir que estamos
  usando esta estrategia y este metodo, en user ponemos el usuario y en password la
  contraseña. Para el user creamos varios usuarios que lo hicimos con el script de
  seedUser, creamos varios en la base de datos con la misma contraseña. Esta es root
  para los user admin y secret para los user normales. Damos enviar y nos debe devolver
  algo como esto:

  {
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MDlhYjExYTA3MzVmNTA0MTc5ZjQ1OWUiLCJuYW1lIjoiUk9PVCIsImVtYWlsIjoicm9vdEB1bmRlZmluZWQuc2giLCJzY29wZXMiOlsic2lnbmluOmF1dGgiLCJzaWdudXA6YXV0aCIsInJlYWQ6bW92aWVzIiwiY3JlYXRlOm1vdmllcyIsInVwZGF0ZTptb3ZpZXMiLCJkZWxldGU6bW92aWVzIiwicmVhZDp1c2VyLW1vdmllcyIsImNyZWF0ZTp1c2VyLW1vdmllcyIsImRlbGV0ZTp1c2VyLW1vdmllcyJdLCJpYXQiOjE2MjA4NDM2MDYsImV4cCI6MTYyMDg0NDUwNn0.dVrRzSEFdLWAMEXOJJ54tv2OTqy2TDfCpgphOnb_BVk",
  "user": {
    "id": "609ab11a0735f504179f459e",
    "name": "ROOT",
    "email": "root@undefined.sh"
  }

  ---------------------------------------------
  Si vamos postman y usamos la ruta: http://localhost:3000/api/auth/sign-up para crear
  usuarios lo que devemos hacer es con el meto POST y en el body pasar el objeto json
  con el usuario como esta en el schema. Un user nuevo quedaria asi:
  {
    "name": "carlos eduardo",
    "email": "carlos@gmail.com",
    "password": "secret"
  }

  Luego podemos ver si el usuario esta bien haciendo uso del sign-in.
}
*/