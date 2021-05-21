/* 
El servidor de SSR se utiliza como proxy entre el frontend y el API.
El token que regresa el API al hacer sign-in se inyecta en una cookie.
Las otras rutas del SSR leeran el token de la cookie creada.

Este SSR es creado para protejer el jwt ya que este se inyecta el la cookie
a traves de este proxy.
*/

const express = require("express"); // Para el servidor.
const helmet = require('helmet'); // Para los header de seguridad.
const passport = require('passport'); // Para implementar la estrategia que definimos en basic.js.
const session = require('express-session'); // Esto es para la strategia de twitter ya que este middleware requiere tener una sesion activa.
const boom = require('@hapi/boom'); // Manejar errores.
const cookieParser = require('cookie-parser'); // Creo que es porque la estructura del proyecto anterior los tiene. Por conflicto.
const axios = require('axios'); // Para hacer un request al api.

// Para las variables de entrono.
const { config } = require("./config");

const app = express(); // Creamos la app.

// body parser
app.use(express.json());
app.use(helmet()); // Para mas seguridad mediante este middelware.
app.use(cookieParser());
app.use(session({ secret: config.sessionSecret })); // Iniciamos session con el session Secret que nos da twitter.
app.use(passport.initialize()); // Para inicializar la seccion.
app.use(passport.session()); // Esto es porque twitter exige que haya una session activa.

// Basic Strategy
require('./utils/auth/strategies/basic');
// Con esta ya implementamos la estrategia basic.

// OAuth strategy
require('./utils/auth/strategies/oauth');

// Google openId oauth strategy
require('./utils/auth/strategies/google');

// Twitter oauth strategy
require('./utils/auth/strategies/twitter');

// Linkedin oauth strategy
require('./utils/auth/strategies/linkedin');

/* 
Generalmente cuando queremos implementar la opción de recordar
sesión para Express mediante passport, lo que hacemos es extender
la expiración de la Cookie.
*/

// Agregamos las variables de timpo en segundos
const THIRTY_DAYS_IN_SEC = 2592000000;
const TWO_HOURS_IN_SEC = 7200000;

// Para iniciar session.
app.post("/auth/sign-in", async function(req, res, next) {
  // Obtenemos el atributo rememberMe desde el cuerpo del request
  const { rememberMe } = req.body;

  passport.authenticate('basic', function(error, data) {
    try {
      // Si nuestra estrategia basic fallo, devolvemos un error.
      if (error || !data) {
        next(boom.unauthorized());
      }
      
      // Si esta bien creamos la session.
      req.login(data, { session: false }, async function(error) {
        if (error) {
          next(error);
        }

        const { token, ...user } = data;

        // Creamos una cookie en la respuesta.
        // Esta cookies se llamara token e incertamos el token en la cookie.
        // Si el atributo rememberMe es verdadero la expiración será en 30 dias
        // de lo contrario la expiración será en 2 horas
        // Este tiempo no esta implementado bien ya que no se como la api-server
        // implementaria esto si ya esta terminada.
        res.cookie("token", token, {
          httpOnly: !config.dev,
          secure: !config.dev,
          maxAge: rememberMe ? THIRTY_DAYS_IN_SEC : TWO_HOURS_IN_SEC,
        });

        // Respondemos con el user.
        res.status(200).json(user);
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});

// Crear usuarios.
app.post("/auth/sign-up", async function(req, res, next) {
  const { body: user } = req; // Sacamos del body de la peticion el user a crear.

  try {
    // Con axios hacemos una peticion a la api-server para crear un user.
    await axios({
      url: `${config.apiUrl}/api/auth/sign-up`,
      method: 'post',
      data: user,
    });

    // Respondemos que se creo con estatus 201.
    res.status(201).json({
      message: 'user created',
    });
  } catch (error) {
    next(error);
  }
});

// Buscar peliculas.
app.get("/movies", async function(req, res, next) {

});

// Crear peliculas del usuario (agregar a favoritos).
app.post("/user-movies", async function(req, res, next) {
  try {
    // Sacamos user-movie del body.
    const { body: userMovie } = req;
    const { token } = req.cookies; // El token desde las cookies.

    // Con axios sacamos la data y el estatus.
    const { data, status } = await axios({
      url: `${config.apiUrl}/api/user-movies`, // La ruta para crear un user-movie.
      headers: { Authorization: `Bearer ${token}` }, // El bearer token para la autorizacion.
      method: 'post',
      data: userMovie,
    });

    if (status !== 201) {
      return next(boom.badImplementation());
    }

    // Si todo es correcto retornamos la data.
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Eliminar la pelicula del usuario.
app.delete("/user-movies/:userMovieId", async function(req, res, next) {
  try {
    // Sacamos el id de los parametros.
    const { userMovieId } = req.params;
    const { token } = req.cookies; // El token desde las cookies.

    // Con axios sacamos la data y el estatus.
    const { data, status } = await axios({
      url: `${config.apiUrl}/api/user-movies/${userMovieId}`, // La ruta para crear un user-movie.
      headers: { Authorization: `Bearer ${token}` }, // El bearer token para la autorizacion.
      method: 'delete',
    });

    if (status !== 200) {
      return next(boom.badImplementation());
    }

    // Si todo es correcto retornamos la data.
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

// Para iniciar el proseco de autenticacion con google.
app.get('/auth/google-oauth', passport.authenticate('google-oauth', { // Le decimos que use la estrategia que definimos.
  scope: ['email', 'profile', 'openid'], // Los alcances que tendra.
}));

// Esta sera la ruta a la que enviara google los datos.
app.get('/auth/google-oauth/callback', passport.authenticate('google-oauth', { session: false }), function(req, res, next) {
  if (!req.user) { // Manejamos el error si el user no existe.
    next(boom.unauthorized());
  }
  
  // Obtenemos los datos necesarios.
  const { token, ...user } = req.user;

  // Creamos la cookie para poner el token de nombre 'token'.
  // El objeto es para decir que en produccion solo usara http y
  // https.
  res.cookie('token', token, {
    httpOnly: !config.dev,
    secure: !config.dev,
  });

  // Retornamos el user con estatus 200.
  res.status(200).json(user);
});

// Esta ruta es para usar la estrategia de google directamente.
app.get("/auth/google", passport.authenticate("google", {
  scope: ["email", "profile", "openid"],
}));

// Esta es para recivir los datos de google pero usando la estrategia de google directamente.
app.get("/auth/google/callback", passport.authenticate("google", { session: false }), function(req, res, next) {
  if (!req.user) { // Manejamos el error si no existe el user.
    next(boom.unauthorized());
  }

  // Obtenemos el token y user.
  const { token, ...user } = req.user;

  // Creamos la cookie y ponemos el JWT ahi.
  res.cookie("token", token, {
    httpOnly: !config.dev,
    secure: !config.dev,
  });

  // Mostramos el user en el navegador.
  res.status(200).json(user);
});

// Esto genera el redireccionamiento como en la estrategia de google.
app.get('/auth/twitter', passport.authenticate('twitter'));

// La ruta de callback para que envien los datos de twitter.
app.get('/auth/twitter/callback', passport.authenticate('twitter', { session: false }), function(req, res, next) {
  if (!req.user) { // Manejamos el error si no hay user.
    next(boom.unauthorized());
  }

  // Obtenemos el token y user por separado.
  const { token, ...user } = req.user;

  // Incluimos el token dentro de la cookie.
  res.cookie('token', token, {
    httpOnly: !config.dev,
    secure: !config.dev,
  });

  // Mostramos el user en el navegador.
  res.status(200).json(user);
});

// Esta ruta es para usar la estrategia de linkedin
app.get("/auth/linkedin", passport.authenticate('linkedin', {
  scope: ['r_emailaddress', 'r_liteprofile'],
}));

// Esta es para recivir los datos de google pero usando la estrategia de google directamente.
app.get("/auth/linkedin/callback", passport.authenticate('linkedin', { session: false }), function(req, res, next) {
  if (!req.user) { // Manejamos el error si no existe el user.
    next(boom.unauthorized());
  }

  // Obtenemos el token y user.
  const { token, ...user } = req.user;

  // Creamos la cookie y ponemos el JWT ahi.
  res.cookie('token', token, {
    httpOnly: !config.dev,
    secure: !config.dev,
  });

  // Mostramos el user en el navegador.
  res.status(200).json(user);
});

// Lanzamos la app en el puerto que esta en la variable de entorno.
app.listen(config.port, function() {
  console.log(`Listening http://localhost:${config.port}`);
});

// ***************************************************************
// Para probar las rutas...
/* 
  Levantamos los 2 servidores (movies-api, ssr-server).
  Creamos 3 variables de entorno en postman para facilitar el uso de datos.
  La primera sera client_url para la ruta del ssr ya que este esta en el port 8000
  los otros 2 los creamos en blanco ya que les asignnaremos valores al crear
  el id que les toca. 
  user_id cuando iniciemos session nos dara un id que lo
  asignaremos a esta variable.
  user_movie_id cuando creemos/agregemos la movie del/al usuario.

  En sign-in lo unico que nesesitamos es la ruta y en authorization el user y pasword
  ya que el token (apiKeyToken) lo trae de .env y lo hace el ssr. Este nos devuelve
  {
    "user": {
      "id": "609c41ea0147f706866c7ab7",
      "name": "carlos eduardo",
      "email": "carlos@gmail.com"
    }
  }
  De aqui sacamos el id y lo asignamos a user_id de postman
  Este ademas devuelve una cookie tambien. Postman configura para usar esta cookie en
  todas las demas peticiones.

  Para crear la pelicula del usuario o asignarle una movie al user {{client_url}}/user-movies
  Con esta ruta en el body le pasamos el objeto para crear user-movie:
  {
    "userId": "{{user_id}}",
    "movieId": "{{movie_id}}"
  }
  Esto es porque la variables de entrono de postman ya esta deinidas. userId lo acabamos de
  agregar y la segunda la creamos en la clase pasada.

  Para eliminar el user-movie o quetarle la movie al user {{client_url}}/user-movies/{{user_movie_id}}
  con el metodo delete. Este no necesita nada mas. Esto es porque tanto en el anterior como en este
  el token queda en la cookie y se postman lo usa para esta peticiones. Con esto tiene la info del user
  y demas, salvo que en la url le pasamos la movie que le vamos a quitar al user.

  Para probar si logearse desde google funciona entramos a http://localhost:8000/auth/google-oauth
*/