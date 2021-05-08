const boom = require('@hapi/boom');
const joi = require('@hapi/joi'); // Joi nos ayuda a validar los schemas.

function validate(data, schema) {
  // Usamos joi para validar el schema comparandolo con la data.
  // Se necesita un schema y los datos que deben seguir este schema.
  const { error } = joi.object(schema).validate(data);
  return error;
}

// Los parametros son el schema a validar y donde se hara esa validacion.
function validationHandler(schema, check = "body") {
  // Retornamos un middleware para que la app siga funcionando como debe.
  return function(req, res, next) {
    // Validamos que es schema es el correcto.
    const error = validate(req[check], schema);

    // Si no hay error ejecutamos el siguente middleware
    // de lo contrario lanzamos el middleware de error.
    error ? next(boom.badRequest(error)) : next();
    // Con boom usamos .badRequest(error) para devolver un error tipo boom de que los datos no
    // son validos.
  }
}

module.exports = validationHandler;