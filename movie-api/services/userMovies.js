// Importamos para usar la base de datos de mongoDB.
const MongoLib = require('../lib/mongo');

class UserMoviesService {
  constructor() {
    this. collection = 'user-movies';
    this.mongoDB = new MongoLib();
  }

  async getUserMovies({ userId }) {
    // Este query dice que nos traiga las peliculas del user que tengan como id
    // este userId.
    const query = userId && { userId };
    // Esto nos devuelve las peliculas del user dentro de la coleccion user-movie que coincidan
    // con el query que estamos pasando.
    const userMovies = await this.mongoDB.getAll(this.collection, query);
    
    // Retornamos las peliculas o un array vacio.
    return userMovies || [];
  }

  async createUserMovie({ userMovie }) {
    // Creamos la pelicula y la guardamos en la base de datos de mongoDB
    // Esto retorna el id que mongo le dio a este dato que sera el que retornemos.
    const createdUserMovieId = await this.mongoDB.create(this.collection, userMovie);

    return createdUserMovieId;
  }

  async deleteUserMovie({ userMovieId }) {
    const deletedUserMovieId = await this.mongoDB.delete(this.collection, userMovieId);

    return deletedUserMovieId;
  }
}

module.exports = UserMoviesService;