const jwt = require('jsonwebtoken');

// Los 2 primeros no los necesitamos ya que son "node", "index.js"
// process.argv trae los argumentos de la consola que se usaron para ejecutar el programa.
const [, , option, secret, nameOrToken ] = process.argv;

// Comprobamos que estos parametros esten al ejecutar el programa.
if (!option || !secret || !nameOrToken) {
  return console.log("Missing arguments");
}

// Usamos la funcion para crear el json-web-token
function signToken(payload, secret) {
  return jwt.sign(payload, secret);
}

// Usamos la funcion verificar el jwt y retornar el payload.
function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}

// Logica del programa para simular opciones.
if (option === "sign") {
  console.log(signToken({ sub: nameOrToken }, secret));
} else if (option === "verify") {
  console.log(verifyToken(nameOrToken, secret));
} else {
  console.log("The options only should be 'sing' or 'verify'");
}