const express = require('express');
const app = express();

const { config } = require('./config/index');
const moviesApi = require('./routes/movies'); // Importamos el router.
const { logErrors, wrapErrors, errorHandler } = require('./utils/middleware/errorHandlers');
const notFoundHandler = require('./utils/middleware/noyFoundHandler');

// body parser. Para que sepa interpretar los json en las rutas cuando pasamos los datos.
app.use(express.json());

// Usamos la funcion para manejar el router o ruta /api/movies
moviesApi(app); // Routes.

// Catch 404. funciona mas como una ruta que como un middleware.
// Por eso va justo despues de todas las rutas.
app.use(notFoundHandler);

// los middleware de error simpre deben ir al final de las rutas ya que estas tambien son middlewares.
app.use(logErrors);
app.use(wrapErrors); // Usamos el middleware que convierte los errores a boom y va en la mitad de estos 2 middleware de error.
app.use(errorHandler);

// Ejemplos.
// *********************************************************************
// Rita principal.
app.get('/', function(req, res) {
  res.send('Hello work');
});

// Ruta localhost:3000/json muestra un json.
app.get('/json', function(req, res) {
  res.json({ hello: 'world' });
});

// *********************************************************************
// Funcion para ver si el año es divisible por 4, 100 o 400.
function leapYear(year, div) {
  return year % div === 0;
}
// Detectar bisiestos con parametro en la url.
app.get('/leap/:year', function(req, res) {
  const { year } = req.params;
  if(leapYear(year, 4) && !leapYear(year, 100) || leapYear(year, 400)) {
    res.send(`El año ${year} es bisiesto.`);
  } else {
    res.send(`El año ${year} no es bisiesto.`);
  }
});
// Fin de ejemplos.
// *********************************************************************

// Esto es para no quemar el puerto sino que lo traiga de config.
app.listen(config.port, function() {
  console.log('Listening http://localhost:', config.port);
});