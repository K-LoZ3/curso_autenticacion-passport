const express = require('express');

// Para user los servicios de user-movies.
const UserMoviesService = require('../services/userMovies');
// Para validar los schemas.
const validationHandler = require('../utils/middleware/validationHandler');

// Traemos todos los schemas necesarios.
const { userIdSchema } = require('../utils/schemas/users');
const { createUserMovieSchema, userMovieIdSchema } = require('../utils/schemas/userMovies');
const { query } = require('express');

function userMoviesApi(app) {
  const router = express.Router();
  app.use('/api/user-movies', router);

  const userMoviesService = new UserMoviesService();

  // Validamos primero si el id cumple con el userId-schema.
  router.get('/', validationHandler({ userId: userIdSchema }, query), async function(req, res, next) {
    const { userId } = req.query; // Almacenamos el userId

    try {
      // Buscamos las movies de ese user.
      const userMovies = await userMoviesService.getUserMovies({ userId });

      // Si las encuentra las mostramos en el navegador con estatus 200 y un mensaje de cumplido.
      res.status(200).json({
        data: userMovies,
        message: 'user movies listed',
      })
    } catch(err) {
      // Si hay error ejecuta el meddleware de error.
      next(err);
    }
  });

  // Para crear la pelicula dentro de la colleccion user-movie.
  // Validamos si cumple con el esquema.
  router.post('/', validationHandler(createUserMovieSchema), async function(req, res, next) {
    // Del body traemos todo lo necesario para crear la pelicula del usuario.
    const { body: userMovie } = req;

    try {
      // Creamos la pelicula y esto devuelve el id de la pelicula creada en mongoDB.
      const createdUserMovieId = await userMoviesService.createUserMovie({
        userMovie, // Pasamos los ids osea el objeto que necita el schema. El id del user y de la movie.
      });

      // Si todo sale bien mostramos en el navegador el id del la pelicula del usuario creada.
      res.status(201).json({
        data: createdUserMovieId,
        massge: 'user movie created',
      });
    } catch (err) {
      next(err); // Manejamos el error si no.
    }
  });

  // Para borrar una pelicula del usuario.
  // Validamos si cumple con el schema.
  router.delete('/:userMovieId', validationHandler({ userMovieId: userMovieIdSchema }, 'params'), async function(req, res, next) {
    // De los parametros sacamos el id de la pelicula del usuario.
    const { userMovieId } = req.params;

    try {
      // Borramos la pelicula.
      const deletedUserMovieId = await userMoviesService.deleteUserMovie({
        userMovieId, // Pasamos el id para que sepa cual borrar.
      });

      // Si sale bien mostramos el id de la pelicula borrada.
      res.status(200).json({
        data: deletedUserMovieId,
        message: 'user movie deleted',
      });
    } catch (err) {
      next(err);  // Manejamos el error si no.
    }
  });
}

// Exportamos para poder usar este router.
module.exports = userMoviesApi;