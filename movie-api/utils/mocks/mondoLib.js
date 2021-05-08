// Con este archivo falcearemos o mockearemos la libreria de mongo
// o sea lib/mongo.js. Para que usemos esta en vez de conectarnos
// mongoDB.

// Con sinon podemos verificar si una funcion fue llamada o no.
const sinon = require('sinon');

// Esto para cuando se haga un test podemos simular que recivimos datos
// y con filterred simulamos que se filtro.
const { moviesMock, filteredMoviesMock } = require('./movies');

// Con .stub creamos el sinon cargando la funcionalidad de comprobar cuando se llamo
// esta funcion y otras cosas mas.
const getAllStub = sinon.stub();
// Con .withArgs() le decimos que cuando esta funcion sea llamada con los argumentos
// que le pasamos ('movies') esta responda con lo que le pasemos en .resolve().
// De esta manera no tenemos que crear una funcion que respnda algo sino que este
// este objeto actuara como una funcion que retornara un valor.
getAllStub.withArgs('movies').resolves(moviesMock);

// Con esto estamos escribiendo una peticion como si esta estuviera conectandoce a mongoDB
// y pidiera las peliculas que tienen drama en sus tag.
const tagQuery = { tags: { $in: ["Drama"] } };
// Para esto simulamos una respuesta para esta peticion de 2 argumentos ('movies', tagQuery)
// que son la coleccion a la que hacen la peticion y el query que envian para la peticion.
// La respuesta simulada la hacemos con la funcion filtered que creamos antes para solo
// mostrar el json con las movies que tengan Drama es sus tags.
getAllStub.withArgs('movies', tagQuery).resolves(filteredMoviesMock('Drama'));

// Para este caso queremos que cuando se llame esta funcion resuelva con el id de la
// primera pelicula.
const createStub = sinon.stub().resolves(moviesMock[0].id);

// Cramos la clase false que sustituira a la clase de mongo
// con la que hacemos las peticiones. ('lib/mongo.js' y su clase MongoLib).
class MongoLibMock {
  // Creamos las funciones que vamos a testear.
  getAll(collection, query) {
    return getAllStub(collection, query); // Las usamos con sinon para comprobar su llamado.
  }

  create(collection, data) {
    return createStub(collection, data);
  }
}

// Exportamos para su uso.
module.exports = {
  getAllStub,
  createStub,
  MongoLibMock,
}