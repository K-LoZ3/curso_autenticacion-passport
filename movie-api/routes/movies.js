const express = require('express');
const passport = require('passport'); // Importamos para usar la strategia
// para proteger las rutas.
const boom = require('@hapi/boom');

// Eliminamos moviesMock ya que este sera traido por la capa de servicios.
// const { moviesMock } = require('../utils/mocks/movies'); // Archivos de base de datos falsa por el momento.
const MoviesService = require('../services/movies');

const {
  movieIdSchema,
  createMovieSchema,
  updateMovieSchema,
} = require('../utils/schemas/movies'); // Importamos los schemas para validarlos.

// Importamos para validar si los datos cumplen con el schema.
const validationHandler = require('../utils/middleware/validationHandler');

// Exportamos la funcion de establecer cache a las peticiones.
const cacheResponse = require('../utils/cacheResponse');
// Importamos los tiempos para usarlos al establecer la cache.
const { FIVE_MINUTES_IN_SECONDS, SIXTY_MINUTES_IN_SECONDS } = require('../utils/time');

// JWT srtrategy
require('../utils/auth/strategies/jwt'); // Con esto implementamos el middleware de jwt.
// Con esto lo que logramos es que donde usemos passport, este se encargara de buscar el
// usuario y devolverlo validando que este existe y que tiene un jwt.

//Crearemos un middleware para usar la estrategia passport de jwt:
function protectRoutes(req, res, next) {
  passport.authenticate('jwt', (error,user) => {
    // Si ocurre un error o el usuario que me devuelve la strategia no existe
    // llamamos a next pasandole a boom
    if(error || !user) return next(boom.unauthorized());

    // De lo contrario ejecutaremos next para que llame al siguiente middlware (que en
    // este caso seria el validation handler y el manejador de ruta).
    // Creo que con esto ejecutamos la estrategia passport como tal. Es como lo que
    // se hizo en el archivo jwt pero se hace asi porque estamos dentro de la funcion.
    req.login(user, {session : false}, (err) => {
      if(err) return next(err);
      next();
    });
  })(req, res, next);
}
// De ahora en adelante para una peticion en esta ruta debemos hacerla con un barer-token
// en el apartado de autorizacion de postman.

/* 
  Las rutas solo deben manejar url y parametros.
  Los servicios seran los que tengan la logica para las repuestas de los endPoints.
*/

// Esta funcion nos permite ser dinamicos y controlar que app consumira la ruta.
function moviesApi(app) {
  const router = express.Router(); // Creams un router.
  app.use('/api/movies', protectRoutes, router); // Esta direccion usara este rourer.
  // Con esta line no hace falta agreagar a todas las peticiones el middleware como este
  // router.get('/', protectRoutes, async function(req, res, next) {
  // app.use(protectRoutes); No funciona, funciona como esta en la linea anterior.

  // Instanciamos la clase de los servicios.
  const moviesService = new MoviesService();

  // Este get del home se refuere a la ruta principal del router ( /api/movies ).
  // No usaremos ninguna validacion de schema para este.
  // Usamos la estrategia de jwt y session false para que el servidor no maneje los datos de la session.
  // Este passport funciona como un middleware y verifica lo anteterior.
  // router.get('/', passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  // La linea anterior es como se hizo en clase. Esta genera un problema y es que si no se envia un jwt
  // la aplicacion falla por completo. De esta manera manejamos el error.
  // router.get('/', protectRoutes, async function(req, res, next) {
  // Con esta linea usamos un middleware que se encarga de usar la estrategia jwt que esta en el archivo
  // strategies/jwt.js y ademas manejar el error para que no se detenga la app.
  router.get('/', async function(req, res, next) {
    // Se usa try/catch porque es codigo es asincrono pero con promesas y async/await.

    // Establecemos la cache en 300 milisegundos como esta en la constante.
    cacheResponse(res, FIVE_MINUTES_IN_SECONDS);

    const { tags } = req.query; // Estos tags como vienen del query son los que se ponen el '?' el nombre del query.
    // Estos se pueden concatenar.

    try {
      // Vamos a filtrar por tags. Y esos tags se reciven del query de la url.
      // Lo pasamos a la capa de servicios.
      const movies = await moviesService.getMovies({ tags }); // Pedimos los datos del archivo falso.
      // Respondemos con estatus 200 y pasamos los datos que recivimos del archivo falso
      // mas un mensaje indicando lo que hicimos.

      //throw new Error('Inducimos error para probar el middleware de error.')

      res.status(200).json({ 
        data: movies,
        message: 'movies listed',
      });
    } catch (err) {
      next(err); // Manejamos el error.
    }
  });

  // Para este get si ya que hacemos una peticion con el id y necesitamos que cumpla con el schema.
  // Esta validacion la hacemos en el llamado de la funcion. Usamos la funcion validationHandler y como parametro solo
  // necesitamos pasarle el schema y de donde sacara los datos. El schema lo pasamos con { movieId: movieIdSchema } y
  // el segundo seria params ya que ahi estara el id que queremos validar.
  router.get('/:movieId', validationHandler({ movieId: movieIdSchema }, 'params'), async function(req, res, next) {
    // Establecemos la cache en 3600 milisegundos como esta en la constante.
    cacheResponse(res, SIXTY_MINUTES_IN_SECONDS);

    const { movieId } = req.params;

    try {
      const movie = await  moviesService.getMovie({ movieId });
      res.status(200).json({ 
        data: movie, // Retornamos la pelicula.
        message: 'movie retrieved',
      });
    } catch (err) {
      next(err);
    }
  });

  // Para el post necesitamos validar el schema create ya que con post cramos una nueva movie.
  // Para este caso solo vamos a pasar el schema con el que queremos validar ya que los datos
  // los sacara del body que es el valor por defecto del segundo parametro de esta funcion.
  router.post('/', validationHandler(createMovieSchema), async function(req, res, next) {
    // Para el post los datos pasan es en el cuerpo de la peticion.
    // Entonces seria const { body } = req; Pero como no queremos que la variable
    // se llame body le ponemos un alias movie con { body: movie }
    const { body: movie } = req;

    try {
      const createdMovie = await  moviesService.createMovie({ movie });
      res.status(201).json({  // El 201 es porque ese es el estatus code de crear.
        data: createdMovie,
        message: 'movie created',
      });
    } catch (err) {
      next(err);
    }
  });

  // Para este caso en el que se va a actualizar una movie. lo que se hace es colocar dos validaciones.
  // De esta manera primero valida una y luego la otra. Como necesitamos validar el id y ademas validar
  // el schema de actualizacion de movie.
  router.put(
    '/:movieId', 
    validationHandler({ movieId: movieIdSchema }, 'params'), 
    validationHandler(updateMovieSchema), 
    async function(req, res, next) {
      // Recivimos el cuerpo y el id de la pelicula que se va a actualizar.
      const { body: movie } = req;
      const { movieId } = req.params;
      
      try {
        const updatedMovieId = await  moviesService.updateMovie({ movieId, movie });
        res.status(200).json({ 
          data: updatedMovieId,
          message: 'movie updated',
        });
      } catch (err) {
        next(err);
      }
    });

  // Reto Patch
  router.patch("/:movieId", async function(req,res,next) {
		const { movieId } = req.params;
		const { body: movie } = req;

		try {
			const updatedMovieId = await moviesService.partialUpdateMovie({ movieId, movie });

			res.status(200).json({
				data: updatedMovieId,
				message: "movie updated partially"
			});
		}
		catch(error) {
			next(error);
		}
	});

  // Para el delete solo hace falta validar el id.
  router.delete('/:movieId', validationHandler({ movieId: movieIdSchema }, 'params'), async function(req, res, next) {
    const { movieId } = req.params;

    try {
      const deletedMovieId = await  moviesService.deleteMovie({ movieId });
      res.status(200).json({ 
        data: deletedMovieId,
        message: 'movie deleted',
      });
    } catch (err) {
      next(err);
    }
  });
}

// Exportamos para que podamos manejar esta ruta con el router.
module.exports = moviesApi;