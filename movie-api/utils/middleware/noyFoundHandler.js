// Usamos boom para los errores.
const boom = require('@hapi/boom');

// Funcion para cuando la ruta no sea encontrada. 404.
// No usamos next ya que no va a ser un middleware como tal y no queremos que llame a los demas middleware.
// Eso entendi yo.
function notFoundHandler(req, res) {
  const {
    // Este devuelve 404, mensaje de pagina no encontrada.
    output: { statusCode, payload },
  } = boom.notFound(); // Retornamos el error directamente de boom, del error notFound.

  // Retornamos la respuesta al navegador con el dogigo y el mensaje en formato json.
  res.status(statusCode).json(payload);
}

// Eportamos para su uso.
module.exports = notFoundHandler;