// const { moviesMock } = require('../utils/mocks/movies');
// Es mejor que los servicios sean quienes sirvan los mocks en vez de las rutas.
// Ya no necesitamos los mocks porque nos vamos a conectar a mongoDB.
const MongoLib = require('../lib/mongo');

// Esta clase sera la capa de servicios.
class MoviesService {
  constructor() {
    this.collection = 'movies'; // Definimos el nombre de la coleccion.
    this.mongoDB = new MongoLib(); // Instanciamos la clase para el manejo de mongoDB.
  }

  async getMovies({ tags }) {
    /*
    Esto es lo que se llama un IF Ternario, cumple la misma función de un condicional IF, nada más 
    que escrito de distinta manera.
    */
    // const ifBasico = <condición> && <haz esto>;
    // const ifConElse = <condición> && <haz esto> : <sino haz esto>;
    // Con tags && {} le decimos que si los tags existen entonces el query sera {}.
    // Con { tags: { $in: tags } } decimos que queremos los tags que esten dentro de los tags que estamos pasando.
    const query = tags && { tags: { $in: tags } };
    // Hacemos una peticion de todas las mives con este queery.
    const movies = await this.mongoDB.getAll(this.collection, query);
    return movies || [];
  }

  async getMovie({ movieId }) {
    // Pasamos el id.
    const movie = await this.mongoDB.get(this.collection, movieId);
    return movie || [];
  }

  async createMovie({ movie }) {
    // Pasamos la movie.
    const createMovieId = await this.mongoDB.create(this.collection, movie);
    return createMovieId;
  }

  async updateMovie({ movieId, movie }) {
    const updatedMovieId = await this.mongoDB.update(this.collection, movieId, movie);
    return updatedMovieId;
  }

  // Este es un reto. No lo cambio.
  // async partialUpdateMovie() {
	// 	const updatedMovieId = await Promise.resolve(moviesMock[0].id);
	// 	return updatedMovieId;
	// }

  async deleteMovie({ movieId }) {
    const deletedMovieId = await this.mongoDB.delete(this.collection, movieId);
    return deletedMovieId;
  }
}

module.exports = MoviesService;