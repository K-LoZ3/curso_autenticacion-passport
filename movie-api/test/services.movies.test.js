const assert = require('assert'); // Para comparar objetos y demas.
const proxyquire = require('proxyquire'); // Para cambiar el require de la mongoLib en la capa de servicios.

// Traemos los mocks que vamos a usar.
// El primero es la libreria de mongo falceada ya que cuando testeamos la capa de servicios
// no queremos que se conecte a mongoDB, asi que sustituiremos MongoLib por esta clase. El
// segunto es la funcion que comprobaremos que si fue llamada. Solo comprobaremos esta
// ya que en esta clase no vamos a comprobar la funcion de create.
const { MongoLibMock, getAllStub } = require('../utils/mocks/mondoLib');

// Traemos el json con las movies para comprobar con la respuesta de getAllStub
const { moviesMock } = require('../utils/mocks/movies');

// Creamos la descipcien de los test de servicios.
describe("service - movies", function() {
  // Cambiamos la libreria de mongoDB en el archivo de servicos por el mock/falsa.
  // Con esto evitamos usar la libreria real y que se conecte a mongoDB.
  const MoviesServices = proxyquire('../services/movies', {
    '../lib/mongo': MongoLibMock,
  });

  // Instanciamos la capa de servicios ya mokeada para los test.
  // No usamos la funcion de testServer.js ya que vamos a levantar el servidor real con todo
  // lo que tiene menos la capa de servicios con la libreria de mongo real.
  const moviesServices = new MoviesServices();

  // Aqui van los test para la funcion getMovies.
  describe('when getMovies method is called', async function() {
    // Con este comprobamos que la funcion es llamada.
    it('should call the getAll Mongolib method', async function() {
      await moviesServices.getMovies({}); // Ejecutamos la funcion.
      // Gracias a sinon podemos comprobar si esta funcion fue llamada o no.
      assert.strictEqual(getAllStub.called, true);
    });

    // Con este comprobamos que lo que devuelve .getMovies es lo que esperamos.
    it('should return an array of movies', async function() {
      const result = await moviesServices.getMovies({}); // Ejecutamos la funcion y guardamos el resultado.
      // Esta parte no es 100% necesaria pero es para identificar que lo que se espera es el json con las
      // movies del mock ya que no estamos conectando con mongoDB.
      const expected = moviesMock;
      // Comparamos con deep ya que es un objeto con campos.
      // Si no coinciden el test no pasara.
      assert.deepStrictEqual(result, expected);

      // Imagino que no hace falta el done porque son funciones asincronas.
    });
  });
});