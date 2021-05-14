const boom = require('@hapi/boom'); // Para el manejo de errores.

// Recivira los scopes que querramos ver si tiene el user para comparar.
function scopesValidationHandler(allowScopes) {
  return function(req, res, next) {
    // verificar si el usuario no existe, o que sus scopes no existan.
    // Esto es posible ya que es un middleware que ira en la peticion
    // de la ruta. Con esto ya puede acceder al req y de hay al user.
    // Los middleware intercectan las peticiones y el req para comprobar
    // y hasta cambiarlo.
    if (!req.user || !req.user.scopes) {
      next(boom.unauthorized('Missing scopes'));
    }

    // Mapeo el arreglo de scopes pasados a la ruta y verifico si cada uno de esos
    // elementos se encuentra definido en los scopes del usuario. El resultado va a
    // ser un nuevo arreglo de elementos true y/o false
    const permisions = allowScopes.map(scope =>
      req.user.scopes.includes(scope) // Con esto cambiamos cada valor por true o false.
    );

    //verifico que no haya elemetos false en el arreglo de permisos (es decir, todos
    // tienen que ser true para pasar al siguiente middleware, con uno que tenga false,
    // significa que todos los permisos no se cumplen y por tanto se le niega el acceso)
    const hasAccess = !permisions.includes(false);

    // Si cumple con todos pasamos de lo contrario enviamos error.
    if (hasAccess) {
      next();
    } else {
      next(boom.unauthorized('Insufficient scopes'));
    }
  };
}

module.exports = scopesValidationHandler;