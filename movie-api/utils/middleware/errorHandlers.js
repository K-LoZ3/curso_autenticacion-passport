// Incluimos boom para manejar los errores con esta api.
// Esta tiene funciones para definir el status de error y mensajes de error.
const boom = require('@hapi/boom');
const { config } = require('../../config');

function withErrorStack(error, stack) {
  if (config.dev) {
    // Usamos ... en el error ya que los errores boom trae varias propiedades.
    return { ...error, stack }
  }

  return error;
}

function wrapErrors(err, req, res, next) {
  // Si el error no es de tipo boom, lo enviamos al siguente middleware transformado
  // a un error tipo boom. Pero si ya es boom solo lo enviamos tal cual fue recivido.
  if (!err.isBoom) {
    next(boom.badImplementation(err));
  }

  next(err);
}

function logErrors(err, req, res, next) {
  console.log(err);
  next(err);
}

function errorHandler(err, req, res, next) {
  // Apartir del error que ya es de tipo boom debido al anterior middleware que implementaremos
  // debemos sacar el output, asi es como lo maneja boom, de este sacamos el estatusCode y el
  // payload que seria el mensaje.
  const { output: { statusCode, payload } } = err;

  res.status(statusCode);
  res.json(withErrorStack(payload, err.stack));
}

module.exports = {
  logErrors,
  wrapErrors, // Exportamos el nuevo middleware para manejar que todos los errores sean tipo boom.
  errorHandler,
}