/* 
El servidor de SSR se utiliza como proxy entre el frontend y el API.
El token que regresa el API al hacer sign-in se inyecta en una cookie.
Las otras rutas del SSR leeran el token de la cookie creada.

Este SSR es creado para protejer el jwt ya que este se inyecta el la cookie
a traves de este proxy.
*/

const express = require("express"); // Para el servidor.
const passport = require('passport'); // Para implementar la estrategia que definimos en basic.js
const boom = require('@hapi/boom'); // Manejar errores.
const cookieParser = require('cookie-parser'); // Creo que es porque la estructura del proyecto anterior los tiene. Por conflicto.
const axios = require('axios'); // Para hacer un request al api.

// Para las variables de entrono.
const { config } = require("./config");

const app = express(); // Creamos la app.

// body parser
app.use(express.json());
app.use(cookieParser());

// Basic Strategy
require('./utils/auth/strategies/basic');
// Con esta ya implementamos la estrategia basic.



// Para iniciar session.
app.post("/auth/sign-in", async function(req, res, next) {
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
        res.cookie('token', token, {
          httpOnly: !config.dev, // Solo sera http cuando estemos en produccion.
          secure: !config.dev, // Y usara https solo en produccion tambien.
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

});

// Eliminar la pelicula del usuario.
app.delete("/user-movies/:userMovieId", async function(req, res, next) {

});

// Lanzamos la app en el puerto que esta en la variable de entorno.
app.listen(config.port, function() {
  console.log(`Listening http://localhost:${config.port}`);
});