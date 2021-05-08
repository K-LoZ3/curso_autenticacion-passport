// Config para comprobar si ejecutamos el script de dev o de produccion.
const { config } = require('../config');

// Funcion para establecer cahce.
function cacheResponse(res, seconds) {
  if (!config.dev) { // Si no es de dev la ejecucion.
    // Establece la cache en tantos segundos.
    res.set('Cache-Control', `public, max-age=${seconds}`);
  }
}

// Exportamos.
module.exports = cacheResponse;