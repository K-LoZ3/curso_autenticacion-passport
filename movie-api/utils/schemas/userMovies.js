const joi = require('@hapi/joi');

const { movieIdSchema } = require('./movies');
const { userIdSchema } = require('./users');

// Schema para el id.
const userMovieIdSchema = joi.string().regex(/^[0-9a-fA-F]{24}$/);

// Schema completo para las peliculas de un usuario expecifico.
const createUserMovieSchema = {
  userId: userIdSchema,
  movieId: movieIdSchema,
}

module.exports = {
  userMovieIdSchema,
  createUserMovieSchema,
}