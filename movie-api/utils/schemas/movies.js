// Con joi tambien podemos definir el schema que vamos a validar.
const joi = require("@hapi/joi");

// *******************************
// Estos son schemas individuales.

// El id de la pelicula.
// Con joi.string generamos un string y con regex le indicamos con una exprecion regular
// como va a ser ese string. Va a ser una coleccion de caracteres alfanumericos con un minimo de 24 caracteres.
// Este significa que: inicia con cualquiera de los caracteres alfanumericos del 0 al 9, de la a minuuscula a
// la f minuscula y de la A mayuscula a la F mayuscula (Esto es porque los ids de mongo debe estan en hexadecimal)
// y solo puede tener un tamaño de 24. Esa es la exprecion regular para la estructura de ids de mongoDB.
const movieIdSchema = joi.string().regex(/^[0-9a-fA-F]{24}$/);
// Maximo 80 caracteres en el titulo.
const movieTitleSchema = joi.string().max(80);
// Desde el 1888 al 2077 ya que es el menor y mayor numero a usar.
const movieYearSchema = joi.number().min(1888).max(2077);
// Este sera una url.
const movieCoverSchema = joi.string().uri();
// Una descripcion maximo de 300 caracteres.
const movieDesciptionSchema = joi.string().max(300);
// La duracion de la pelicula tendra un minimo de 1 min y maximo 300 min.
const movieDurationSchema = joi.number().min(1).max(300);
// la calificacion en la que es acto ver la peli. Sera de maxsimo 5 caracteres.
const movieContentRatingSchema = joi.string().max(5);
// El source es una url que es el que servira la muvie.
const movieSourceSchema = joi.string().uri();
// Con los tags podemos agregar un array de tags que serviran para tener etiquetas en la movie.
// .items de podria dejar vacio () pero tambien se puede expecificar que schema tendra cada item.
// De esta manera cada iten sera un string con un maximo de 50 caracteres.
const movieTagsSchema = joi.array().items(joi.string().max(50));

// *******************************

const createMovieSchema = {
  // Esta llave (title, year...) debe ser la que se envie por el request tal y como esta escrita aqui
  // de lo contrario no lo identifica cuando lo valide. Todos deben ser requeridos.
  title: movieTitleSchema.required(),
  year: movieYearSchema.required(),
  cover: movieCoverSchema.required(),
  description: movieDesciptionSchema.required(),
  duration: movieDurationSchema.required(),
  contentRating: movieContentRatingSchema.required(),
  source: movieSourceSchema.required(),
  tags: movieTagsSchema, // este no sera requerido ya que no siempre hay tags en las peliculas.
};

// Con update no debemos hacer que los paramotros sean requeridos ya que muchas veces solo
// necesitaremos actualizar uno o dos campos en la pelicula.
const updateMovieSchema = {
  title: movieTitleSchema,
  year: movieYearSchema,
  cover: movieYearSchema,
  description: movieDesciptionSchema,
  duration: movieDurationSchema,
  contentRating: movieContentRatingSchema,
  source: movieSourceSchema,
  tags: movieTagsSchema,
};

module.exports = {
  movieIdSchema, // Este lo vamos a nececitar tambien por fuera.
  createMovieSchema,
  updateMovieSchema,
}