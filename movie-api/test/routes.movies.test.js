const assert = require('assert'); // Assert es para compara objetos y demas cosas.
// De momento proxyquire sirve para cambiar informacion de un archivo.
// Para este caso se uso para cambiar un require en el archivo routes/movies.js
// por otro require. Logarndo hacer que el archivo fuera diferente pero solo en
// ejecucion de este test.
const proxyquire = require('proxyquire');

// Importamos los mocks para ejecutar el servidor de test con estos y no con mongoDB.
const { moviesMock, MoviesServiceMock } = require('../utils/mocks/movies');
// Funcion que levanta el servidor falso o secundario para los test con los mocks.
const testServer = require('../utils/testServer');

// Funcion para hacer y describir los test.
describe('routes - movies', function() {
  // Aqui cambiamos el require('../services/movies') por la clase MoviesServiceMock.
  // logrando que no usemos la capa de servicios real para que no se conecte a mongoDB
  // y use los mocks como respuesta de json.
  const route = proxyquire('../routes/movies', {
    '../services/movies': MoviesServiceMock,
  });

  // Levantamos el servidor falso/secundario/test.
  // seria como en el index.js principal ejecutan moviesApi(app);
  const request = testServer(route);

  // Describimos un sub-test dentro del primero.
  // Aqui estaran los test al GET.
  describe('GET /movies', function() {
    // Con esta funcion es la que ejecutarmos los test.
    // done es para indicar que ya termino la ejecucion.
    it('should respond with status 200', function(done) {
      // Comparamos que la respuesta del statusCode es 200.
      // Los expect se pueden concatenar, de esta manera se pueden comprobar diferentes
      // respuestas como, si responde con plication/json en el typo de documento y demas.
      request.get('/api/movies').expect(200, done); // done para indicar que finalizo.
    });

    // Con este test comprobamos que el body resibe lo que queremos.
    it('should respond with the list of movies', function(done) {
      // Para el test hacemos lo siguiente:
      // Hacemos la peticion get y la finalizamos con end(). Esto porque si no usamos end
      // no hara la peticion completa. Ejemplo: En el anterior test (estatus 200) no usamos
      // end y por esta razon no tuvo mas respuesta o datos que el estatus o datos del head
      // de la peticion. Con end le decimos al test que queremos que ejecute la peticion
      // hasta el final, o que nos de el final?.
      request.get('/api/movies').end((err, res) => {
        // Conseguido esto con assert comparamos los objetos:
        // la respuesta del body que es un objeto con el objeto que pasamos como segundo
        // parametro dentro de la funcion deepStrictEqual().
        assert.deepStrictEqual(res.body, {
          data: moviesMock, // El mock con todas las movies.
          message: 'movies listed', // El mensaje que devolvemos en el archivo routes cuando el get se ejecuta.
        });

        // Para decirle al test que ya termino la peticion y no queremos comparar o hacer nada mas.
        done();
      })
    })
  });
});