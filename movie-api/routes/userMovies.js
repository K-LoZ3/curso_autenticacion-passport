const express = require('express');

// Para user los servicios de user-movies.
const UserMoviesService = require('../services/userMovies');
// Para validar los schemas.
const validationHandler = require('../utils/middleware/validationHandler');

// Traemos todos los schemas necesarios.
const { movieIdSchema } = require('../utils/schemas/movies');
const { userIdSchema } = require('../utils/schemas/users');
const { createUserSchema } = require('../utils/schemas/userMovies');
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
}