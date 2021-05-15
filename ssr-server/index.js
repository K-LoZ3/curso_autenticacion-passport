/* 
El servidor de SSR se utiliza como proxy entre el frontend y el API.
El token que regresa el API al hacer sign-in se inyecta en una cookie.
Las otras rutas del SSR leeran el token de la cookie creada.

Este SSR es creado para protejer el jwt ya que este se inyecta el la cookie
a traves de este proxy.
*/

const express = require("express"); // Para el servidor.

// Para las variables de entrono.
const { config } = require("./config");

const app = express(); // Creamos la app.

// body parser
app.use(express.json());

// Para iniciar session.
app.post("/auth/sign-in", async function(req, res, next) {

});

// Crear usuarios.
app.post("/auth/sign-up", async function(req, res, next) {

});

// Buscar peliculas.
app.get("/movies", async function(req, res, next) {

});

// Crear peliculas del usuario (agregar a favoritos).
app.post("/user-movies", async function(req, res, next) {

});

// Eliminar la pelicula del usuario.
app.delete("/user-movies/:userMovieId", async function(req, res, next) {

});

// Lanzamos la app en el puerto que esta en la variable de entorno.
app.listen(config.port, function() {
  console.log(`Listening http://localhost:${config.port}`);
});